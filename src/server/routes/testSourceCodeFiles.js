const path = require("path");
const fs = require("fs");

// Load .env
const possibleEnvPaths = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
  path.join(process.cwd(), ".env"),
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`📄 Loading .env from: ${envPath}`);
    require("dotenv").config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("⚠️  No .env file found. Trying default dotenv...");
  require("dotenv").config();
}

const { createClient } = require("@libsql/client");

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

console.log("\n🔧 Environment Check:");
console.log("TURSO_DATABASE_URL:", TURSO_DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("TURSO_AUTH_TOKEN:", TURSO_AUTH_TOKEN ? "✅ Set" : "❌ Missing");

if (!TURSO_DATABASE_URL) {
  console.error("\n❌ ERROR: TURSO_DATABASE_URL is not set!");
  process.exit(1);
}

let db;
try {
  db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
  console.log("✅ Database client created successfully\n");
} catch (error) {
  console.error("❌ Failed to create database client:", error.message);
  process.exit(1);
}

// Track failed file IDs
const failedFileIds = [];

/**
 * Fetch children ONE BY ONE with 2-second timeout
 */
async function fetchChildrenOneByOne(parentId, sourceCodeId) {
  const allChildren = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const query = parentId
      ? `SELECT id, name, type, parent_id, path, language, content, size, is_root 
         FROM files_and_folders 
         WHERE source_code_id = ? AND parent_id = ? 
         ORDER BY CASE type WHEN 'folder' THEN 0 ELSE 1 END, LOWER(name) ASC 
         LIMIT 1 OFFSET ?`
      : `SELECT id, name, type, parent_id, path, language, content, size, is_root 
         FROM files_and_folders 
         WHERE source_code_id = ? AND (parent_id IS NULL OR is_root = 1) 
         ORDER BY CASE type WHEN 'folder' THEN 0 ELSE 1 END, LOWER(name) ASC 
         LIMIT 1 OFFSET ?`;

    const args = parentId
      ? [sourceCodeId, parentId, offset]
      : [sourceCodeId, offset];

    try {
      const result = await Promise.race([
        db.execute({ sql: query, args }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 2000)
        ),
      ]);

      if (result.rows.length === 0) {
        hasMore = false;
        break;
      }

      const item = result.rows[0];
      process.stdout.write(
        `\r⏳ Item ${offset + 1}: ${item.type === "folder" ? "📁" : "📄"} ${item.name.substring(0, 40).padEnd(40, " ")}`
      );

      allChildren.push(item);
      offset += 1;

      if (offset > 1000) {
        hasMore = false;
      }
    } catch (error) {
      if (error.message === "Timeout") {
        try {
          const idQuery = parentId
            ? `SELECT id FROM files_and_folders 
               WHERE source_code_id = ? AND parent_id = ? 
               ORDER BY CASE type WHEN 'folder' THEN 0 ELSE 1 END, LOWER(name) ASC 
               LIMIT 1 OFFSET ?`
            : `SELECT id FROM files_and_folders 
               WHERE source_code_id = ? AND (parent_id IS NULL OR is_root = 1) 
               ORDER BY CASE type WHEN 'folder' THEN 0 ELSE 1 END, LOWER(name) ASC 
               LIMIT 1 OFFSET ?`;

          const idResult = await db.execute({ sql: idQuery, args });
          if (idResult.rows.length > 0) {
            const failedId = idResult.rows[0].id;
            failedFileIds.push(failedId);
            console.log(`\n⏸️  Timeout at offset ${offset}, stored ID: ${failedId}`);
          }
        } catch (idError) {
          console.log(`\n⏸️  Timeout at offset ${offset}, couldn't get ID`);
        }
        offset += 1;
      } else {
        console.error(`\n❌ Error: ${error.message}`);
        hasMore = false;
      }
    }
  }

  return allChildren;
}

/**
 * Build tree recursively
 */
async function buildTreeRecursively(parentId, sourceCodeId, depth = 0) {
  const children = await fetchChildrenOneByOne(parentId, sourceCodeId);
  const nodes = [];

  for (const child of children) {
    const node = {
      id: child.id,
      path: child.path || child.id,
      name: child.name,
      type: child.type,
      language: child.language || null,
      content: child.type === "file" ? child.content || "" : undefined,
      size: child.size || null,
      is_root: !!child.is_root,
      parent_id: child.parent_id || null,
      children: [],
    };

    if (child.type === "folder") {
      node.children = await buildTreeRecursively(child.id, sourceCodeId, depth + 1);
    }

    nodes.push(node);
  }

  return nodes;
}

/**
 * RETRY FUNCTION: Fetch failed files by ID with fresh connection
 */
async function fetchFailedFilesByIds(fileIds) {
  if (fileIds.length === 0) {
    console.log("\n✅ No failed files to retry!\n");
    return [];
  }

  console.log(`\n\n🔄 Retrying ${fileIds.length} failed files with fresh connection...\n`);

  // Close old connection
  console.log("🔌 Closing old database connection...");
  try {
    await db.close?.();
  } catch (e) {
    // Ignore close errors
  }

  // Create fresh connection
  console.log("🔌 Opening fresh database connection...\n");
  const freshDb = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  const retriedFiles = [];

  for (let i = 0; i < fileIds.length; i++) {
    const fileId = fileIds[i];
    console.log(`   📥 ${i + 1}/${fileIds.length}: Fetching ID ${fileId}...`);

    try {
      const result = await freshDb.execute({
        sql: `SELECT * FROM files_and_folders WHERE id = ?`,
        args: [fileId],
      });

      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`      ✅ ${row.type === "folder" ? "📁" : "📄"} ${row.name} (${row.content?.length || 0} chars)`);
        retriedFiles.push(row);
      } else {
        console.log(`      ❌ Not found`);
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
  }

  // Close fresh connection
  try {
    await freshDb.close?.();
  } catch (e) {
    // Ignore
  }

  console.log(`\n✅ Retrieved ${retriedFiles.length}/${fileIds.length} failed files\n`);
  return retriedFiles;
}

/**
 * Insert retried files into tree
 */
function insertRetriedFilesIntoTree(tree, retriedFiles) {
  if (retriedFiles.length === 0) return;

  console.log("🔧 Inserting retried files into tree...\n");

  const byId = new Map();

  const indexTree = (nodes) => {
    nodes.forEach((node) => {
      byId.set(node.id, node);
      if (node.children) indexTree(node.children);
    });
  };
  indexTree(tree);

  retriedFiles.forEach((file) => {
    if (file.parent_id && byId.has(file.parent_id)) {
      const parent = byId.get(file.parent_id);
      const node = {
        id: file.id,
        path: file.path || file.id,
        name: file.name,
        type: file.type,
        language: file.language || null,
        content: file.type === "file" ? file.content || "" : undefined,
        size: file.size || null,
        is_root: !!file.is_root,
        parent_id: file.parent_id || null,
        children: [],
      };
      parent.children.push(node);
      console.log(`  ✅ Inserted ${file.name} into ${parent.name}`);
    } else {
      console.log(`  ⚠️  No parent found for ${file.name}`);
    }
  });

  console.log("");
}

/**
 * Test function
 */
async function testSourceCodeFiles(sourceCodeId) {
  console.log(`\n🔍 Testing source code files for ID: ${sourceCodeId}\n`);

  try {
    const scRes = await db.execute({
      sql: `SELECT id, title, root_folder_id FROM source_codes WHERE id = ?`,
      args: [sourceCodeId],
    });

    if (scRes.rows.length === 0) {
      console.error("❌ Error: Source code not found");
      return { success: false, error: "Source code not found" };
    }

    const sc = scRes.rows[0];
    console.log("✅ Source code found:");
    console.log(`   ID: ${sc.id}`);
    console.log(`   Title: ${sc.title}\n`);

    const countRes = await db.execute({
      sql: `SELECT COUNT(*) as count FROM files_and_folders WHERE source_code_id = ?`,
      args: [sourceCodeId],
    });
    console.log(`📊 Total files/folders: ${countRes.rows[0].count}\n`);

    if (countRes.rows[0].count === 0) {
      console.warn("⚠️  No files found");
      return { success: true, data: [], meta: { source_code_id: sc.id, count: 0 } };
    }

    console.log("🌳 Building tree (2-second timeout)...\n");
    const startTime = Date.now();

    const roots = await buildTreeRecursively(null, sourceCodeId, 0);

    const buildTime = Date.now() - startTime;
    console.log(`\n\n✅ Tree built in ${(buildTime / 1000).toFixed(2)}s\n`);

    // Retry failed files with fresh connection
    const retriedFiles = await fetchFailedFilesByIds(failedFileIds);

    // Insert retried files
    if (retriedFiles.length > 0) {
      insertRetriedFilesIntoTree(roots, retriedFiles);
    }

    const countNodes = (nodes) => {
      let count = nodes.length;
      nodes.forEach((node) => {
        if (node.children) count += countNodes(node.children);
      });
      return count;
    };

    const totalNodes = countNodes(roots);

    return {
      success: true,
      data: roots,
      meta: {
        source_code_id: sc.id,
        source_code_title: sc.title,
        total_nodes: totalNodes,
        build_time_ms: buildTime,
        retried_count: retriedFiles.length,
      },
    };
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Print tree
 */
function printTree(nodes, indent = "", stats = { folders: 0, files: 0, total_content_size: 0 }) {
  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const prefix = isLast ? "└── " : "├── ";
    const icon = node.type === "folder" ? "📁" : "📄";

    if (node.type === "folder") stats.folders++;
    if (node.type === "file") {
      stats.files++;
      stats.total_content_size += node.content?.length || 0;
    }

    const sizeInfo = node.type === "file" ? ` [${node.content?.length || 0} chars]` : "";
    console.log(
      `${indent}${prefix}${icon} ${node.name}${node.language ? ` (${node.language})` : ""}${sizeInfo}`
    );

    if (node.type === "folder" && node.children && node.children.length > 0) {
      const newIndent = indent + (isLast ? "    " : "│   ");
      printTree(node.children, newIndent, stats);
    }
  });

  return stats;
}

/**
 * Main
 */
async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log(" Source Code Files (2s Timeout + Fresh Connection)");
  console.log("═══════════════════════════════════════════════════");

  const TEST_SOURCE_CODE_ID = "02A03BA7";

  const result = await testSourceCodeFiles(TEST_SOURCE_CODE_ID);

  if (result.success && result.data && result.data.length > 0) {
    console.log("\n📊 Tree View:");
    console.log("═══════════════════════════════════════════════════");

    const stats = { folders: 0, files: 0, total_content_size: 0 };
    printTree(result.data, "", stats);

    console.log("═══════════════════════════════════════════════════");
    console.log(`\n📈 Statistics:`);
    console.log(`   Total Nodes: ${result.meta.total_nodes}`);
    console.log(`   Folders: ${stats.folders}`);
    console.log(`   Files: ${stats.files}`);
    console.log(`   Retried Files: ${result.meta.retried_count || 0}`);
    console.log(`   Total Content Size: ${(stats.total_content_size / 1024).toFixed(2)} KB`);
    console.log(`   Build Time: ${(result.meta.build_time_ms / 1000).toFixed(2)}s`);

    try {
      const outputPath = path.join(__dirname, "source-code-tree.json");
      console.log(`\n💾 Saving to: ${outputPath}`);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
      const fileSize = fs.statSync(outputPath).size;
      console.log(`✅ File saved successfully!`);
      console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
    } catch (fileError) {
      console.error(`❌ Error saving file: ${fileError.message}`);
    }
  } else if (result.success && (!result.data || result.data.length === 0)) {
    console.log("\n⚠️  No files or folders found");
  } else {
    console.error("\n❌ Failed:", result.error);
  }

  console.log("\n✨ Test complete!\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
