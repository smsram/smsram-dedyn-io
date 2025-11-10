const express = require("express");
const { createClient } = require("@libsql/client");
require("dotenv").config();

const router = express.Router();

// DB client (Turso or local)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET /dashboard/stats
// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const videosCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM videos",
      args: [], // Empty array, not undefined
    });
    
    const sourceCodesCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM source_codes",
      args: [],
    });
    
    const totalViews = await db.execute({
      sql: "SELECT COALESCE(SUM(views), 0) as total FROM videos",
      args: [],
    });

    res.json({
      success: true,
      data: {
        videos: videosCount.rows[0].count || 0,
        sourceCodes: sourceCodesCount.rows[0].count || 0,
        totalViews: totalViews.rows[0].total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      details: error.message,
    });
  }
});

// GET /dashboard/latest
// Get latest videos and source codes for dashboard
router.get("/latest", async (req, res) => {
  try {
    // Get latest 3 videos
    const videosResult = await db.execute({
      sql: `
        SELECT 
          id, title, description, thumbnail, youtube_url, 
          views, likes, duration, published_date,
          has_source_code, source_code_id
        FROM videos 
        ORDER BY datetime(published_date) DESC 
        LIMIT 3
      `,
      args: [],
    });

    // Get latest 3 source codes
    const sourceCodesResult = await db.execute({
      sql: `
        SELECT 
          id, title, description, technologies,
          download_available, download_url, github_url, updated_at
        FROM source_codes 
        ORDER BY datetime(updated_at) DESC 
        LIMIT 3
      `,
      args: [],
    });

    // Format videos
    const videos = videosResult.rows.map(video => ({
      ...video,
      has_source_code: !!video.has_source_code,
      views: video.views || 0,
      likes: video.likes || 0,
    }));

    // Format source codes
    const sourceCodes = sourceCodesResult.rows.map(sc => ({
      ...sc,
      technologies: sc.technologies ? JSON.parse(sc.technologies) : [],
      download_available: !!sc.download_available,
    }));

    res.json({
      success: true,
      data: {
        videos: videos,
        sourceCodes: sourceCodes,
      },
    });
  } catch (error) {
    console.error("Error fetching latest content:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch latest content",
      details: error.message,
    });
  }
});

// GET /dashboard/videos
// Supports optional search: /dashboard/videos?search=react
router.get("/videos", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    let result;
    if (search) {
      // Simple search across title and description
      result = await db.execute({
        sql: `
          SELECT id, title, slug, description, youtube_url, thumbnail, published_date,
                 views, likes, duration, category, level, has_source_code, source_code_id,
                 topics, created_at, updated_at
          FROM videos
          WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?
          ORDER BY datetime(published_date) DESC, datetime(created_at) DESC
        `,
        args: [`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`],
      });
    } else {
      result = await db.execute({
        sql: `
          SELECT id, title, slug, description, youtube_url, thumbnail, published_date,
                 views, likes, duration, category, level, has_source_code, source_code_id,
                 topics, created_at, updated_at
          FROM videos
          ORDER BY datetime(published_date) DESC, datetime(created_at) DESC
        `,
        args: [],
      });
    }

    // Normalize booleans and arrays
    const rows = result.rows.map((v) => ({
      ...v,
      has_source_code: !!v.has_source_code,
      topics:
        typeof v.topics === "string" && v.topics.trim().length
          ? v.topics
          : "",
    }));

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard videos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch videos",
      details: error.message,
    });
  }
});

// GET /dashboard/videos/:id
router.get("/videos/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          id, title, slug, description, youtube_url, thumbnail, 
          published_date, views, likes, duration, category, level, 
          has_source_code, source_code_id, topics, 
          full_description, created_at, updated_at
        FROM videos
        WHERE id = ?
      `,
      args: [req.params.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Video not found" 
      });
    }

    const v = result.rows[0];

    res.json({
      success: true,
      data: {
        ...v,
        has_source_code: !!v.has_source_code,
        topics: typeof v.topics === "string" ? v.topics : "",
        full_description: v.full_description || "",
      },
    });
  } catch (error) {
    console.error("Error fetching video by id:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch video",
      details: error.message,
    });
  }
});

// NEW: GET /dashboard/videos/:id/related
router.get("/videos/:id/related", async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 3;

    // First get the category of the current video
    const currentVideo = await db.execute({
      sql: `SELECT category FROM videos WHERE id = ?`,
      args: [id],
    });

    if (currentVideo.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const category = currentVideo.rows[0].category;

    // Fetch related videos from the same category
    const result = await db.execute({
      sql: `
        SELECT id, title, slug, thumbnail, views
        FROM videos
        WHERE category = ? AND id != ?
        ORDER BY RANDOM()
        LIMIT ?
      `,
      args: [category, id, limit],
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching related videos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch related videos",
      details: error.message,
    });
  }
});

// GET /dashboard/source-codes
router.get("/source-codes", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    let result;
    if (search) {
      result = await db.execute({
        sql: `
          SELECT id, title, slug, description, technologies, features,
                 github_url, download_available, download_url, root_folder_id,
                 file_count, folder_count, total_size, video_id,
                 created_at, updated_at
          FROM source_codes
          WHERE LOWER(title) LIKE ? OR 
                LOWER(description) LIKE ? OR
                LOWER(technologies) LIKE ?
          ORDER BY datetime(created_at) DESC
        `,
        args: [`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`],
      });
    } else {
      result = await db.execute({
        sql: `
          SELECT id, title, slug, description, technologies, features,
                 github_url, download_available, download_url, root_folder_id,
                 file_count, folder_count, total_size, video_id,
                 created_at, updated_at
          FROM source_codes
          ORDER BY datetime(created_at) DESC
        `,
        args: [],
      });
    }

    // Parse JSON fields safely
    const rows = result.rows.map((sc) => ({
      ...sc,
      technologies: typeof sc.technologies === "string" ? sc.technologies : "[]",
      features: typeof sc.features === "string" ? sc.features : "[]",
      download_available: !!sc.download_available,
    }));

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching source codes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch source codes",
      details: error.message,
    });
  }
});

// GET /dashboard/source-codes/:id
router.get("/source-codes/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          id, title, slug, description, full_description,
          video_id,
          technologies,              -- JSON string
          features,                  -- JSON string
          github_url,
          download_url,
          download_available,
          file_count,
          folder_count,
          total_size,
          root_folder_id,
          created_at,
          updated_at
        FROM source_codes
        WHERE id = ?
      `,
      args: [req.params.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Source code not found" });
    }

    const sc = result.rows[0];

    res.json({
      success: true,
      data: {
        ...sc,
        download_available: !!sc.download_available,
        technologies: typeof sc.technologies === "string" ? sc.technologies : "[]",
        features: typeof sc.features === "string" ? sc.features : "[]",
      },
    });
  } catch (error) {
    console.error("Error fetching source code by id:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch source code",
      details: error.message,
    });
  }
});

// GET /dashboard/source-codes/:id/files
// Returns full nested tree with content, loading one child at a time with 2s timeout
router.get("/source-codes/:id/files", async (req, res) => {
  try {
    // Step 1: Verify source code exists
    const scRes = await db.execute({
      sql: `SELECT id, title, root_folder_id FROM source_codes WHERE id = ?`,
      args: [req.params.id],
    });
    
    if (scRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Source code not found" });
    }
    
    const sc = scRes.rows[0];

    // Step 2: Check if any files exist
    const countRes = await db.execute({
      sql: `SELECT COUNT(*) as count FROM files_and_folders WHERE source_code_id = ?`,
      args: [req.params.id],
    });

    if (countRes.rows[0].count === 0) {
      const rootId = sc.root_folder_id || "root";
      return res.json({
        success: true,
        data: [
          {
            id: rootId,
            path: rootId,
            name: sc.title || "Source Code",
            type: "folder",
            children: [],
          },
        ],
        meta: { source_code_id: sc.id, root_folder_id: sc.root_folder_id || null, count: 0 },
      });
    }

    // Track skipped files
    let skippedCount = 0;

    // Step 3: Fetch children ONE BY ONE with 2-second timeout
    const fetchChildrenOneByOne = async (parentId) => {
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
          ? [req.params.id, parentId, offset]
          : [req.params.id, offset];

        try {
          // 2-second timeout per query
          const result = await Promise.race([
            db.execute({ sql: query, args }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 2000)
            ),
          ]);

          if (result.rows.length === 0) {
            hasMore = false;
            break;
          }

          allChildren.push(result.rows[0]);
          offset += 1;

          // Safety limit
          if (offset > 1000) {
            hasMore = false;
          }
        } catch (error) {
          if (error.message === 'Timeout') {
            console.log(`Timeout at offset ${offset}, skipping...`);
            skippedCount++;
            offset += 1; // Skip and continue
          } else {
            console.error(`Error fetching at offset ${offset}:`, error.message);
            hasMore = false;
          }
        }
      }

      return allChildren;
    };

    // Step 4: Build tree recursively
    const buildTreeRecursively = async (parentId) => {
      const children = await fetchChildrenOneByOne(parentId);
      const nodes = [];

      for (const child of children) {
        const node = {
          id: child.id,
          path: child.path || child.id,
          name: child.name,
          type: child.type,
          language: child.language || null,
          content: child.type === 'file' ? (child.content || '') : undefined,
          size: child.size || null,
          is_root: !!child.is_root,
          parent_id: child.parent_id || null,
          children: [],
        };

        // Recursively fetch children if it's a folder
        if (child.type === 'folder') {
          node.children = await buildTreeRecursively(child.id);
        }

        nodes.push(node);
      }

      return nodes;
    };

    // Build tree starting from root
    const roots = await buildTreeRecursively(null);

    // Sort tree recursively
    const sortTree = (node) => {
      if (node.type === "folder" && Array.isArray(node.children) && node.children.length > 0) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    roots.forEach(sortTree);

    // Count total nodes
    const countNodes = (nodes) => {
      let count = nodes.length;
      nodes.forEach(node => {
        if (node.children) count += countNodes(node.children);
      });
      return count;
    };

    res.json({
      success: true,
      data: roots,
      meta: {
        source_code_id: sc.id,
        root_folder_id: sc.root_folder_id || null,
        total_nodes: countNodes(roots),
        roots_count: roots.length,
        skipped_files: skippedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching source code files:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch source code files",
      details: error.message,
    });
  }
});

// GET /dashboard/projects
// Returns all projects with optional search and status filter
router.get("/projects", async (req, res) => {
  try {
    const { search, status } = req.query;

    // Base query
    let query = `SELECT 
      id,
      title,
      description,
      live_url as liveUrl,
      github_url as githubUrl,
      source_code_id as sourceCodeId,
      technologies,
      status,
      year,
      featured,
      created_at as createdAt,
      updated_at as updatedAt
    FROM projects
    WHERE 1=1`;

    const args = [];

    // Add status filter if provided
    if (status && status !== 'all') {
      query += ` AND status = ?`;
      args.push(status);
    }

    // Add search filter if provided
    if (search && search.trim()) {
      query += ` AND (
        title LIKE ? OR 
        description LIKE ? OR 
        technologies LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      args.push(searchTerm, searchTerm, searchTerm);
    }

    // Order by featured first, then by year descending
    query += ` ORDER BY featured DESC, year DESC, created_at DESC`;

    // Execute query
    const result = await db.execute({ sql: query, args });

    // Parse technologies JSON string to array
    const projects = result.rows.map(project => ({
      ...project,
      technologies: JSON.parse(project.technologies || '[]'),
      featured: !!project.featured, // Convert to boolean
    }));

    res.json({
      success: true,
      data: projects,
      meta: {
        total: projects.length,
        filtered: !!search || (status && status !== 'all'),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
      details: error.message,
    });
  }
});

// GET /dashboard/projects/:id
// Get single project by ID
router.get("/projects/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT 
        id,
        title,
        description,
        live_url as liveUrl,
        github_url as githubUrl,
        source_code_id as sourceCodeId,
        technologies,
        status,
        year,
        featured,
        created_at as createdAt,
        updated_at as updatedAt
      FROM projects
      WHERE id = ?`,
      args: [req.params.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const project = {
      ...result.rows[0],
      technologies: JSON.parse(result.rows[0].technologies || '[]'),
      featured: !!result.rows[0].featured,
    };

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project",
      details: error.message,
    });
  }
});

module.exports = router;
