// utils/treeHelper.js
// At the top of the file, declare it once:
function formatSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function fetchTreeForFolder(db, rootId) {
  const startTime = Date.now();

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📦 FETCHING TREE FOR: ${rootId}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(80)}\n`);

    // Step 1: Get root folder
    console.log(`STEP 1: Fetching root folder...`);
    const rootResult = await db.execute({
      sql: `SELECT id, name, type, path, parent_id, language, size, is_root, source_code_id, created_at, updated_at 
            FROM files_and_folders WHERE id = ?`,
      args: [rootId]
    });

    if (rootResult.rows.length === 0) {
      throw new Error(`Root folder not found: ${rootId}`);
    }

    const root = rootResult.rows[0];
    console.log(`✅ Root Found:`);
    console.log(`   • ID: ${root.id}`);
    console.log(`   • Name: ${root.name}`);
    console.log(`   • Type: ${root.type}`);
    console.log(`   • Path: ${root.path}`);
    console.log(`   • Source Code ID: ${root.source_code_id || 'None'}`);
    console.log(`   • Is Root: ${root.is_root === 1 ? 'Yes' : 'No'}`);
    console.log(`   • Size: ${formatSize(root.size || 0)}\n`);

    // Step 2: Count items
    console.log(`STEP 2: Counting total items...`);
    let countResult;
    if (root.source_code_id) {
      countResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM files_and_folders WHERE source_code_id = ?`,
        args: [root.source_code_id]
      });
      console.log(`   Query: Counting by source_code_id = ${root.source_code_id}`);
    } else {
      countResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM files_and_folders WHERE path LIKE ? OR id = ?`,
        args: [`${root.path}%`, rootId]
      });
      console.log(`   Query: Counting by path LIKE ${root.path}%`);
    }

    const totalCount = countResult.rows[0]?.count || 0;
    console.log(`✅ Total Items: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log(`⚠️  NO ITEMS FOUND\n`);
      return {
        ...root,
        size_formatted: formatSize(root.size || 0),
        children: []
      };
    }

    // Step 3: Fetch all items (WITHOUT content)
    console.log(`STEP 3: Fetching all ${totalCount} items (excluding content field)...`);
    let allItems = [];
    
    const fetchStart = Date.now();
    if (root.source_code_id) {
      console.log(`   Using source_code_id: ${root.source_code_id}`);
      const result = await db.execute({
        sql: `SELECT id, name, type, path, parent_id, language, size, is_root, source_code_id, created_at, updated_at
              FROM files_and_folders 
              WHERE source_code_id = ?
              ORDER BY type DESC, path ASC`,
        args: [root.source_code_id]
      });
      allItems = result.rows;
    } else {
      console.log(`   Using path: ${root.path}%`);
      const result = await db.execute({
        sql: `SELECT id, name, type, path, parent_id, language, size, is_root, source_code_id, created_at, updated_at
              FROM files_and_folders 
              WHERE path LIKE ? OR id = ?
              ORDER BY type DESC, path ASC`,
        args: [`${root.path}%`, rootId]
      });
      allItems = result.rows;
    }

    const fetchTime = ((Date.now() - fetchStart) / 1000).toFixed(2);
    console.log(`✅ Fetched ${allItems.length} items in ${fetchTime}s\n`);

    // Step 4: Analyze items
    console.log(`STEP 4: Analyzing items...`);
    let folderCount = 0;
    let fileCount = 0;
    let totalSize = 0;
    const languages = new Set();

    allItems.forEach(item => {
      if (item.type === 'folder') folderCount++;
      else {
        fileCount++;
        if (item.language) languages.add(item.language);
      }
      totalSize += item.size || 0;
    });

    console.log(`✅ Analysis Complete:`);
    console.log(`   • Folders: ${folderCount}`);
    console.log(`   • Files: ${fileCount}`);
    console.log(`   • Total Size: ${formatSize(totalSize)}`);
    console.log(`   • Languages: ${Array.from(languages).join(', ')}\n`);

    // Step 5: Build tree structure
    console.log(`STEP 5: Building tree structure...`);
    const buildStart = Date.now();
    
    const itemsMap = new Map();
    allItems.forEach(item => {
      itemsMap.set(item.id, {
        ...item,
        size_formatted: formatSize(item.size || 0),
        children: []
      });
    });

    let rootNode = null;
    let orphanCount = 0;

    allItems.forEach(item => {
      const node = itemsMap.get(item.id);
      
      if (item.id === rootId) {
        rootNode = node;
      } else if (item.parent_id) {
        const parent = itemsMap.get(item.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          console.log(`   ⚠️  Orphan: ${item.name} (parent ${item.parent_id} not found)`);
          orphanCount++;
          if (rootNode) rootNode.children.push(node);
        }
      } else {
        console.log(`   ⚠️  No parent: ${item.name}`);
        orphanCount++;
        if (rootNode) rootNode.children.push(node);
      }
    });

    const buildTime = ((Date.now() - buildStart) / 1000).toFixed(2);
    console.log(`✅ Tree built in ${buildTime}s`);
    console.log(`   • Root children: ${rootNode.children.length}`);
    console.log(`   • Orphans: ${orphanCount}\n`);

    // Step 6: Sort children
    console.log(`STEP 6: Sorting children...`);
    const sortChildren = (node) => {
      if (node.children?.length) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortChildren);
      }
    };
    sortChildren(rootNode);

    // Display tree preview
    console.log(`\nSTEP 7: Tree Preview (first 20 items):`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`📁 ${rootNode.name} (${rootNode.children.length} items)`);
    
    const preview = rootNode.children.slice(0, 20);
    preview.forEach((child) => {
      const icon = child.type === 'folder' ? '📂' : '📄';
      const size = child.type === 'file' ? ` (${child.size_formatted})` : '';
      console.log(`   ${icon} ${child.name}${size}`);
    });
    
    if (rootNode.children.length > 20) {
      console.log(`   ... and ${rootNode.children.length - 20} more items`);
    }
    console.log(`${'─'.repeat(80)}\n`);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ COMPLETE IN ${totalTime}s`);
    console.log(`${'='.repeat(80)}\n`);

    return {
      rootNode,
      stats: {
        folders: folderCount,
        files: fileCount,
        orphans: orphanCount,
        totalSize: formatSize(totalSize),
        languages: Array.from(languages),
        loadTime: totalTime + 's'
      }
    };

  } catch (error) {
    const errorTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n${'='.repeat(80)}`);
    console.error(`❌ ERROR AFTER ${errorTime}s`);
    console.error(`${'='.repeat(80)}`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`${'='.repeat(80)}\n`);
    throw error;
  }
}

module.exports = { fetchTreeForFolder, formatSize };
