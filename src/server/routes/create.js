const express = require("express");
const { createClient } = require("@libsql/client");
const crypto = require("crypto");
const { syncAllVideos } = require("../services/youtubeSync");
require("dotenv").config();

const router = express.Router();

// ============================================
// TURSO DATABASE CONNECTION
// ============================================
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Test connection
db.execute("SELECT 1")
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate 8-character unique ID
const generateId = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase().substring(0, 8);
};

// Generate File/Folder ID with smarter naming
const generateFileId = (type, index) => {
  const prefix = type === 'folder' ? 'FD' : 'FL';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`.substring(0, 8);
};

const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

// ============================================
// VIDEOS ROUTES
// ============================================

// Create Video
router.post("/video", async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      youtube_url,
      thumbnail,
      published_date,
      views = 0,
      likes = 0,
      duration,
      category,
      level,
      has_source_code = false,
      source_code_id,
      full_description,
      topics,
    } = req.body;

    validateRequired(req.body, ["title", "youtube_url"]);

    const id = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO videos (
        id, title, slug, description, youtube_url, thumbnail,
        published_date, views, likes, duration, category, level,
        has_source_code, source_code_id, full_description, topics,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        title,
        slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        youtube_url,
        thumbnail,
        published_date,
        views,
        likes,
        duration,
        category,
        level,
        has_source_code ? 1 : 0,
        source_code_id || null,
        full_description,
        topics ? JSON.stringify(topics) : null,
        now,
        now,
      ],
    });

    res.status(201).json({
      success: true,
      message: "Video created successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create video",
      details: error.message,
    });
  }
});

// Get All Videos
router.get("/videos", async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await db.execute({
      sql: `SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [parseInt(limit), parseInt(offset)],
    });

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch videos",
      details: error.message,
    });
  }
});

// Get Video by ID
router.get("/video/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT * FROM videos WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Video not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch video",
      details: error.message,
    });
  }
});

// Update Video
router.put("/video/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => {
        if (key === 'topics' && typeof updates[key] !== 'string') {
          return JSON.stringify(updates[key]);
        }
        if (typeof updates[key] === 'boolean') {
          return updates[key] ? 1 : 0;
        }
        return updates[key];
      });

    await db.execute({
      sql: `UPDATE videos SET ${fields}, updated_at = ? WHERE id = ?`,
      args: [...values, now, id],
    });

    res.json({
      success: true,
      message: "Video updated successfully",
    });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update video",
      details: error.message,
    });
  }
});

// Delete Video
router.delete("/video/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: `DELETE FROM videos WHERE id = ?`,
      args: [id],
    });

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete video",
      details: error.message,
    });
  }
});

// POST /create/youtube-data
// Fetch YouTube video data by video URL
router.post("/youtube-data", async (req, res) => {
  try {
    const { youtube_url } = req.body;

    if (!youtube_url) {
      return res.status(400).json({
        success: false,
        error: "YouTube URL is required",
      });
    }

    // Extract video ID from URL
    const extractYouTubeId = (url) => {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null;
    };

    const videoId = extractYouTubeId(youtube_url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: "Invalid YouTube URL",
      });
    }

    // Get API key from environment
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "YouTube API key not configured",
      });
    }

    // Fetch video data from YouTube API
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || "Failed to fetch YouTube data",
      });
    }

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Video not found",
      });
    }

    const video = data.items[0];

    // Format duration (from ISO 8601 to HH:MM:SS or MM:SS)
    const formatDuration = (duration) => {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = (match[1] || '').replace('H', '');
      const minutes = (match[2] || '0M').replace('M', '');
      const seconds = (match[3] || '0S').replace('S', '');
      
      const parts = [];
      if (hours) parts.push(hours.padStart(2, '0'));
      parts.push(minutes.padStart(2, '0'));
      parts.push(seconds.padStart(2, '0'));
      
      return parts.join(':');
    };

    // Generate thumbnail URL
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

    // Prepare response data
    const videoData = {
      title: video.snippet.title,
      description: video.snippet.description.substring(0, 200),
      full_description: video.snippet.description,
      thumbnail: thumbnailUrl,
      published_date: video.snippet.publishedAt.split('T')[0],
      views: parseInt(video.statistics.viewCount || 0),
      likes: parseInt(video.statistics.likeCount || 0),
      duration: formatDuration(video.contentDetails.duration),
      topics: video.snippet.tags || [],
      channel_title: video.snippet.channelTitle,
      category_id: video.snippet.categoryId,
    };

    res.json({
      success: true,
      data: videoData,
    });
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch YouTube video data",
      details: error.message,
    });
  }
});

// POST /create/sync-videos
// Manually trigger YouTube video sync
router.post("/sync-videos", async (req, res) => {
  try {
    console.log("\n🔄 Manual sync triggered via API");
    const result = await syncAllVideos();

    res.json({
      success: true,
      message: "Video sync completed",
      data: result,
    });
  } catch (error) {
    console.error("Error during manual sync:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync videos",
      details: error.message,
    });
  }
});

// GET /create/sync-status
// Get last sync status (optional - for monitoring)
router.get("/sync-status", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as total_videos,
          MAX(datetime(updated_at)) as last_update
        FROM videos
      `,
      args: [],
    });

    res.json({
      success: true,
      data: {
        total_videos: result.rows[0].total_videos,
        last_update: result.rows[0].last_update,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get sync status",
    });
  }
});

// ============================================
// SOURCE CODES ROUTES
// ============================================

// Create Source Code
router.post("/source-code", async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      full_description,
      video_id,
      technologies,
      features,
      github_url,
      download_url,
      download_available = false,
      file_count = 0,
      folder_count = 0,
      total_size,
    } = req.body;

    validateRequired(req.body, ["title"]);

    const id = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO source_codes (
        id, title, slug, description, full_description, video_id,
        technologies, features, github_url, download_url,
        download_available, file_count, folder_count, total_size,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        title,
        slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        full_description,
        video_id || null,
        technologies ? JSON.stringify(technologies) : null,
        features ? JSON.stringify(features) : null,
        github_url,
        download_url,
        download_available ? 1 : 0,
        file_count,
        folder_count,
        total_size,
        now,
        now,
      ],
    });

    res.status(201).json({
      success: true,
      message: "Source code created successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Error creating source code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create source code",
      details: error.message,
    });
  }
});

// Get All Source Codes
router.get("/source-codes", async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await db.execute({
      sql: `SELECT * FROM source_codes ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [parseInt(limit), parseInt(offset)],
    });

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
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

// Get Source Code by ID
router.get("/source-code/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT * FROM source_codes WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Source code not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching source code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch source code",
      details: error.message,
    });
  }
});

// Update Source Code
router.put("/source-code/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => {
        if ((key === 'technologies' || key === 'features') && typeof updates[key] !== 'string') {
          return JSON.stringify(updates[key]);
        }
        if (typeof updates[key] === 'boolean') {
          return updates[key] ? 1 : 0;
        }
        return updates[key];
      });

    await db.execute({
      sql: `UPDATE source_codes SET ${fields}, updated_at = ? WHERE id = ?`,
      args: [...values, now, id],
    });

    res.json({
      success: true,
      message: "Source code updated successfully",
    });
  } catch (error) {
    console.error("Error updating source code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update source code",
      details: error.message,
    });
  }
});

// Delete Source Code
router.delete("/source-code/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: `DELETE FROM source_codes WHERE id = ?`,
      args: [id],
    });

    res.json({
      success: true,
      message: "Source code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting source code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete source code",
      details: error.message,
    });
  }
});

// ============================================
// PROJECTS ROUTES
// ============================================

// Create Project
router.post("/project", async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      year,
      technologies,
      status = "in-progress",
      featured = false,
      live_url,
      github_url,
      source_code_id,
    } = req.body;

    validateRequired(req.body, ["title"]);

    const id = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO projects (
        id, title, slug, description, year, technologies,
        status, featured, live_url, github_url, source_code_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        title,
        slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        year || new Date().getFullYear(),
        technologies ? JSON.stringify(technologies) : null,
        status,
        featured ? 1 : 0,
        live_url,
        github_url,
        source_code_id || null,
        now,
        now,
      ],
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create project",
      details: error.message,
    });
  }
});

// Get All Projects
router.get("/projects", async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await db.execute({
      sql: `SELECT * FROM projects ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [parseInt(limit), parseInt(offset)],
    });

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
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

// Get Project by ID
router.get("/project/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT * FROM projects WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
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

// Update Project
router.put("/project/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => {
        if (key === 'technologies' && typeof updates[key] !== 'string') {
          return JSON.stringify(updates[key]);
        }
        if (typeof updates[key] === 'boolean') {
          return updates[key] ? 1 : 0;
        }
        return updates[key];
      });

    await db.execute({
      sql: `UPDATE projects SET ${fields}, updated_at = ? WHERE id = ?`,
      args: [...values, now, id],
    });

    res.json({
      success: true,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update project",
      details: error.message,
    });
  }
});

// Delete Project
router.delete("/project/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: `DELETE FROM projects WHERE id = ?`,
      args: [id],
    });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete project",
      details: error.message,
    });
  }
});


// Format bytes to human-readable size
const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Calculate total size of folder (including all children)
const calculateFolderSize = async (folderId) => {
  const getAllChildren = async (parentId) => {
    const result = await db.execute({
      sql: `SELECT id, type, size FROM files_and_folders WHERE parent_id = ?`,
      args: [parentId]
    });
    
    let totalSize = 0;
    
    for (const item of result.rows) {
      if (item.type === 'file') {
        totalSize += item.size || 0;
      } else {
        totalSize += await getAllChildren(item.id);
      }
    }
    
    return totalSize;
  };
  
  return await getAllChildren(folderId);
};

// Count files and folders recursively
const countFilesAndFolders = async (folderId) => {
  const getAllItems = async (parentId) => {
    const result = await db.execute({
      sql: `SELECT id, type FROM files_and_folders WHERE parent_id = ?`,
      args: [parentId]
    });
    
    let fileCount = 0;
    let folderCount = 0;
    
    for (const item of result.rows) {
      if (item.type === 'file') {
        fileCount++;
      } else {
        folderCount++;
        const childCounts = await getAllItems(item.id);
        fileCount += childCounts.fileCount;
        folderCount += childCounts.folderCount;
      }
    }
    
    return { fileCount, folderCount };
  };
  
  return await getAllItems(folderId);
};

// [Previous routes for videos, source codes, and projects remain the same...]
// I'll include only the updated files/folders routes below

// ============================================
// FILES AND FOLDERS ROUTES (Enhanced)
// ============================================

// Bulk Create Files/Folders with Enhanced Features (FIXED FOR LARGE UPLOADS)
router.post("/files-folders/bulk", async (req, res) => {
  try {
    const { items, source_code_id, root_folder_name } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items array is required and must not be empty",
      });
    }

    // Validate source_code_id if provided
    if (source_code_id) {
      const sourceCodeCheck = await db.execute({
        sql: `SELECT id FROM source_codes WHERE id = ?`,
        args: [source_code_id]
      });

      if (sourceCodeCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: `Source code with id ${source_code_id} does not exist`,
        });
      }
    }

    console.log(`📦 Starting bulk upload of ${items.length} items...`);
    if (source_code_id) {
      console.log(`🔗 Attaching to source code: ${source_code_id}`);
    }
    if (root_folder_name) {
      console.log(`📁 Root folder: ${root_folder_name}`);
    }

    const now = new Date().toISOString();
    const createdItems = [];
    const pathMapping = {}; // Map paths to generated IDs
    const processedPaths = new Set(); // Track processed paths to avoid duplicates

    // Step 1: Create root folder first (if root_folder_name provided)
    let rootId = null;
    if (root_folder_name) {
      rootId = generateFileId('folder', 0);
      const rootPath = `/${root_folder_name}`;
      
      await db.execute({
        sql: `INSERT INTO files_and_folders (
          id, name, type, parent_id, path, is_root, size, source_code_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          rootId, 
          root_folder_name, 
          'folder', 
          null, 
          rootPath, 
          1, 
          0, 
          source_code_id || null,
          now, 
          now
        ]
      });

      pathMapping[rootPath] = rootId;
      processedPaths.add(rootPath);
      createdItems.push({ 
        id: rootId, 
        name: root_folder_name, 
        path: rootPath,
        type: 'folder',
        parent_id: null,
        is_root: 1
      });
      
      console.log(`✅ Created root folder: ${root_folder_name} (${rootId})`);
    }

    // Step 2: Sort items by depth (shallow to deep) to ensure parents exist before children
    const sortedItems = items.sort((a, b) => {
      const depthA = (a.path || '').split('/').filter(Boolean).length;
      const depthB = (b.path || '').split('/').filter(Boolean).length;
      if (depthA !== depthB) return depthA - depthB;
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return 0;
    });

    console.log(`📊 Sorted ${sortedItems.length} items by depth`);

    // Step 3: Process items in batches (larger batches for efficiency)
    const batchSize = 50; // Process 50 at a time
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sortedItems.length; i += batchSize) {
      const batch = sortedItems.slice(i, i + batchSize);
      console.log(`📤 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sortedItems.length / batchSize)} (${batch.length} items)`);
      
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const index = i + j;
        
        // Generate unique ID with timestamp to avoid collisions
        const id = generateFileId(item.type, index + 1) + Date.now().toString(36).slice(-3).toUpperCase();
        
        let parent_id = null;
        let finalPath = item.path;

        // Build proper path structure
        if (item.path) {
          const pathParts = item.path.split('/').filter(Boolean);
          
          if (rootId && root_folder_name) {
            // Remove root folder name from path if it's already there
            if (pathParts[0] === root_folder_name) {
              pathParts.shift();
            }
            
            if (pathParts.length === 0) {
              // Item name only, directly under root
              parent_id = rootId;
              finalPath = `/${root_folder_name}/${item.name}`;
            } else if (pathParts.length === 1) {
              // Direct child of root
              parent_id = rootId;
              finalPath = `/${root_folder_name}/${pathParts[0]}`;
            } else {
              // Nested item - find parent folder
              const parentPath = `/${root_folder_name}/${pathParts.slice(0, -1).join('/')}`;
              parent_id = pathMapping[parentPath] || rootId;
              finalPath = `/${root_folder_name}/${pathParts.join('/')}`;
            }
          } else {
            // No root folder, use original paths
            if (pathParts.length > 1) {
              const parentPath = '/' + pathParts.slice(0, -1).join('/');
              parent_id = pathMapping[parentPath] || null;
            }
            finalPath = item.path;
          }
        } else {
          // No path provided
          parent_id = rootId;
          finalPath = rootId ? `/${root_folder_name}/${item.name}` : `/${item.name}`;
        }

        // Skip if path already processed (duplicate)
        if (processedPaths.has(finalPath)) {
          console.log(`⚠️  Skipping duplicate: ${finalPath}`);
          skippedCount++;
          continue;
        }

        // Calculate size
        const itemSize = item.type === 'file' 
          ? (item.size || (item.content ? item.content.length : 0))
          : 0;

        try {
          await db.execute({
            sql: `INSERT INTO files_and_folders (
              id, name, type, parent_id, path, language, content,
              size, is_root, source_code_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              id,
              item.name,
              item.type || "file",
              parent_id,
              finalPath,
              item.language || null,
              item.content || null,
              itemSize,
              0, // Not root
              source_code_id || null,
              now,
              now,
            ],
          });

          pathMapping[finalPath] = id;
          processedPaths.add(finalPath);

          createdItems.push({ 
            id, 
            name: item.name, 
            path: finalPath, 
            type: item.type,
            parent_id: parent_id,
            size: itemSize
          });

          processedCount++;
          
          if (processedCount % 10 === 0) {
            console.log(`✅ Processed ${processedCount}/${sortedItems.length} items...`);
          }
        } catch (error) {
          console.error(`❌ Error creating ${item.name}:`, error.message);
          errorCount++;
          // Continue with next item instead of failing entire upload
        }
      }
    }

    console.log(`📊 Upload Summary:`);
    console.log(`   ✅ Created: ${createdItems.length} items`);
    console.log(`   ⚠️  Skipped: ${skippedCount} duplicates`);
    console.log(`   ❌ Errors: ${errorCount} items`);

    // Step 4: Calculate and update folder sizes (bottom-up)
    if (rootId) {
      console.log(`📐 Calculating folder sizes...`);
      
      try {
        const totalSize = await calculateFolderSize(rootId);
        const humanReadableSize = formatSize(totalSize);
        
        await db.execute({
          sql: `UPDATE files_and_folders SET size = ?, updated_at = ? WHERE id = ?`,
          args: [totalSize, now, rootId]
        });

        console.log(`📊 Root folder size: ${humanReadableSize}`);

        // Step 5: Update source_code table if source_code_id provided
        if (source_code_id) {
          const counts = await countFilesAndFolders(rootId);
          
          await db.execute({
            sql: `UPDATE source_codes SET 
                  file_count = ?, 
                  folder_count = ?, 
                  total_size = ?,
                  root_folder_id = ?,
                  updated_at = ? 
                  WHERE id = ?`,
            args: [
              counts.fileCount,
              counts.folderCount,
              humanReadableSize,
              rootId,
              now,
              source_code_id
            ]
          });

          console.log(`✅ Updated source_code: ${counts.fileCount} files, ${counts.folderCount} folders, ${humanReadableSize}`);
        }
      } catch (sizeError) {
        console.error("⚠️  Error calculating sizes:", sizeError.message);
        // Continue anyway, sizes can be recalculated later
      }
    }

    const finalMessage = errorCount > 0 
      ? `Created ${createdItems.length} items (${errorCount} errors, ${skippedCount} skipped)`
      : `Successfully created ${createdItems.length} items`;

    console.log(`✅ ${finalMessage}`);

    res.status(201).json({
      success: true,
      message: finalMessage,
      data: { 
        items: createdItems, 
        count: createdItems.length,
        skipped: skippedCount,
        errors: errorCount,
        rootId: rootId,
        root_folder_name: root_folder_name,
        totalSize: rootId ? formatSize(await calculateFolderSize(rootId).catch(() => 0)) : '0 Bytes'
      },
    });
  } catch (error) {
    console.error("❌ Error bulk creating files/folders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk create files/folders",
      details: error.message,
    });
  }
});

// Get All Files/Folders
router.get("/files-folders", async (req, res) => {
  try {
    const { 
      type, 
      parent_id, 
      source_code_id,
      is_root,
      limit = 100,
      offset = 0 
    } = req.query;

    let sql = `SELECT * FROM files_and_folders WHERE 1=1`;
    const args = [];

    if (type) {
      sql += ` AND type = ?`;
      args.push(type);
    }

    if (parent_id === 'null') {
      sql += ` AND parent_id IS NULL`;
    } else if (parent_id) {
      sql += ` AND parent_id = ?`;
      args.push(parent_id);
    }

    if (source_code_id) {
      sql += ` AND source_code_id = ?`;
      args.push(source_code_id);
    }

    if (is_root !== undefined) {
      sql += ` AND is_root = ?`;
      args.push(is_root === 'true' ? 1 : 0);
    }

    sql += ` ORDER BY is_root DESC, type DESC, name ASC LIMIT ? OFFSET ?`;
    args.push(parseInt(limit), parseInt(offset));

    const result = await db.execute({ sql, args });

    // Add human-readable size to each item
    const enhancedRows = result.rows.map(row => ({
      ...row,
      size_formatted: formatSize(row.size || 0)
    }));

    res.json({
      success: true,
      data: enhancedRows,
      count: enhancedRows.length,
    });
  } catch (error) {
    console.error("Error fetching files/folders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch files/folders",
      details: error.message,
    });
  }
});

// Get File/Folder by ID
router.get("/file-folder/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT * FROM files_and_folders WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "File/Folder not found",
      });
    }

    const item = result.rows[0];
    
    res.json({
      success: true,
      data: {
        ...item,
        size_formatted: formatSize(item.size || 0)
      },
    });
  } catch (error) {
    console.error("Error fetching file/folder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch file/folder",
      details: error.message,
    });
  }
});

// Update File/Folder
router.put("/file-folder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => updates[key]);

    await db.execute({
      sql: `UPDATE files_and_folders SET ${fields}, updated_at = ? WHERE id = ?`,
      args: [...values, now, id],
    });

    res.json({
      success: true,
      message: "File/Folder updated successfully",
    });
  } catch (error) {
    console.error("Error updating file/folder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update file/folder",
      details: error.message,
    });
  }
});

// Delete File/Folder (recursive)
router.delete("/file-folder/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const getAllChildren = async (parentId) => {
      const result = await db.execute({
        sql: `SELECT id FROM files_and_folders WHERE parent_id = ?`,
        args: [parentId]
      });
      
      let ids = [parentId];
      for (const row of result.rows) {
        ids = ids.concat(await getAllChildren(row.id));
      }
      return ids;
    };

    const idsToDelete = await getAllChildren(id);
    
    const placeholders = idsToDelete.map(() => '?').join(',');
    await db.execute({
      sql: `DELETE FROM files_and_folders WHERE id IN (${placeholders})`,
      args: idsToDelete
    });

    res.json({
      success: true,
      message: `Deleted ${idsToDelete.length} item(s) successfully`,
      data: { deleted_count: idsToDelete.length }
    });
  } catch (error) {
    console.error("Error deleting file/folder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete file/folder",
      details: error.message,
    });
  }
});

// Get File Tree Structure
router.get("/files-folders/tree/:source_code_id", async (req, res) => {
  try {
    const { source_code_id } = req.params;

    const result = await db.execute({
      sql: `SELECT * FROM files_and_folders WHERE source_code_id = ? ORDER BY path ASC`,
      args: [source_code_id]
    });

    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          size_formatted: formatSize(item.size || 0),
          children: item.type === 'folder' ? buildTree(items, item.id) : []
        }));
    };

    const tree = buildTree(result.rows);

    res.json({
      success: true,
      data: tree,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching file tree:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch file tree",
      details: error.message,
    });
  }
});

// Recalculate folder sizes (utility endpoint)
router.post("/files-folders/recalculate-sizes/:folder_id", async (req, res) => {
  try {
    const { folder_id } = req.params;
    const now = new Date().toISOString();

    const totalSize = await calculateFolderSize(folder_id);
    const humanReadableSize = formatSize(totalSize);

    await db.execute({
      sql: `UPDATE files_and_folders SET size = ?, updated_at = ? WHERE id = ?`,
      args: [totalSize, now, folder_id]
    });

    res.json({
      success: true,
      message: "Folder size recalculated successfully",
      data: {
        folder_id,
        size_bytes: totalSize,
        size_formatted: humanReadableSize
      }
    });
  } catch (error) {
    console.error("Error recalculating sizes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to recalculate sizes",
      details: error.message,
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
router.get("/health", async (req, res) => {
  try {
    await db.execute("SELECT 1");
    res.json({
      success: true,
      message: "Database connection healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: error.message,
    });
  }
});

module.exports = router;
