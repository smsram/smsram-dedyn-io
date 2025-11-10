const express = require("express");
const { createClient } = require("@libsql/client");
require("dotenv").config();

const router = express.Router();

// ============================================
// DATABASE CONNECTION
// ============================================

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// ============================================
// VIDEO ROUTES
// ============================================

// Get video by ID
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

// Update video
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

// Delete video
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

// ============================================
// SOURCE CODE ROUTES
// ============================================

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
// PROJECT ROUTES
// ============================================

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


// ============================================
// GET: Get folder/file tree by root_id
// ============================================
router.get("/files-folders/tree/:root_id", async (req, res) => {
  try {
    const { root_id } = req.params;

    // Fetch all related files/folders in one go (avoid N+1 recursive queries)
    const result = await db.execute({
      sql: `
        SELECT id, name, type, path, parent_id, language, size, is_root, source_code_id, created_at, updated_at
        FROM files_and_folders
        WHERE (
          id = ? OR
          is_root = 1 AND id = ? OR
          source_code_id = (
            SELECT source_code_id FROM files_and_folders WHERE id = ?
          )
        )
      `,
      args: [root_id, root_id, root_id],
    });

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Root folder not found",
      });
    }

    // Map items by ID for easy lookup
    const itemsById = {};
    result.rows.forEach(row => {
      itemsById[row.id] = {
        ...row,
        size_formatted: formatSize(row.size || 0),
        children: [],
      };
    });

    // Find the root node (should match root_id)
    const rootItem = itemsById[root_id];
    if (!rootItem) {
      return res.status(404).json({
        success: false,
        error: "Root folder not found",
      });
    }

    // Add child items to their parents
    Object.values(itemsById).forEach(item => {
      if (item.parent_id && itemsById[item.parent_id]) {
        itemsById[item.parent_id].children.push(item);
      }
    });

    // Helper for stats
    function getStats(node) {
      let fileCount = 0;
      let folderCount = 0;
      let totalSize = 0;
      function walk(item) {
        if (item.type === "file") {
          fileCount++;
          totalSize += item.size || 0;
        } else if (item.type === "folder") {
          folderCount++;
          item.children.forEach(child => walk(child));
        }
      }
      walk(node);
      return { fileCount, folderCount, totalSize };
    }

    const stats = getStats(rootItem);

    res.json({
      success: true,
      data: rootItem,
      total_items: result.rows.length,
      file_count: stats.fileCount,
      folder_count: stats.folderCount,
      total_size: stats.totalSize,
      total_size_formatted: formatSize(stats.totalSize),
    });
  } catch (error) {
    console.error("Error fetching tree:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load tree",
      details: error.message,
    });
  }
});

// Get single file/folder
router.get("/file-folder/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT id, name, type, path, parent_id, language, size, is_root, source_code_id, created_at, updated_at
            FROM files_and_folders WHERE id = ?`,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "File/Folder not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        size_formatted: formatSize(result.rows[0].size || 0)
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

// Update file/folder
router.put("/file-folder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    // If renaming, update path
    if (updates.name) {
      const currentItem = await db.execute({
        sql: `SELECT * FROM files_and_folders WHERE id = ?`,
        args: [id]
      });

      if (currentItem.rows.length > 0) {
        const item = currentItem.rows[0];
        const pathParts = item.path.split('/');
        pathParts[pathParts.length - 1] = updates.name;
        updates.path = pathParts.join('/');
      }
    }

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

// Delete file/folder (cascade)
router.delete("/file-folder/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get all children recursively
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

module.exports = router;
