const express = require("express");
const { createClient } = require("@libsql/client");
require("dotenv").config();

const router = express.Router();

// DB client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET /main-page/youtube-channel-stats
// Fetch channel statistics from database (updated hourly by sync service)
router.get("/youtube-channel-stats", async (req, res) => {
  try {
    // Get channel stats from database (most recent record)
    const result = await db.execute({
      sql: `
        SELECT 
          channel_id,
          channel_name,
          total_subscribers,
          total_views,
          total_videos,
          last_updated
        FROM channel_stats 
        ORDER BY datetime(last_updated) DESC 
        LIMIT 1
      `,
      args: [],
    });

    if (result.rows.length === 0) {
      // No stats yet, return zeros
      return res.json({
        success: true,
        data: {
          subscribers: 0,
          totalVideos: 0,
          totalViews: 0,
          channelTitle: "SMSRam",
          channelDescription: "Channel statistics will be available after first sync",
          lastUpdated: null,
        },
      });
    }

    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        subscribers: stats.total_subscribers || 0,
        totalVideos: stats.total_videos || 0,
        totalViews: stats.total_views || 0,
        channelTitle: stats.channel_name || "SMSRam",
        channelDescription: "",
        lastUpdated: stats.last_updated,
      },
    });
  } catch (error) {
    console.error("Error fetching channel stats from database:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch channel statistics",
      details: error.message,
    });
  }
});

// GET /main-page/homepage-data
// Get latest 3 videos, projects, and source codes for homepage
router.get("/homepage-data", async (req, res) => {
  try {
    // Fetch latest 3 videos
    const videosResult = await db.execute({
      sql: `
        SELECT 
          id, title, description, thumbnail, youtube_url, 
          views, likes, duration, published_date,
          has_source_code, source_code_id, category, level
        FROM videos 
        ORDER BY datetime(published_date) DESC 
        LIMIT 3
      `,
      args: [],
    });

    // Fetch latest 3 projects
    const projectsResult = await db.execute({
      sql: `
        SELECT 
          id, title, description, technologies, status,
          featured, live_url, github_url, year
        FROM projects 
        ORDER BY year DESC, datetime(created_at) DESC
        LIMIT 3
      `,
      args: [],
    });

    // Fetch latest 3 source codes
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

    // Format data with proper field names
    const videos = videosResult.rows.map(video => ({
      ...video,
      has_source_code: !!video.has_source_code,
      hasSourceCode: !!video.has_source_code,
      source_code_id: video.source_code_id,
      sourceCodeId: video.source_code_id,
      views: video.views || 0,
      likes: video.likes || 0,
      youtube_url: video.youtube_url,
    }));

    const projects = projectsResult.rows.map(project => ({
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: !!project.featured,
    }));

    const sourceCodes = sourceCodesResult.rows.map(sc => ({
      ...sc,
      technologies: sc.technologies ? JSON.parse(sc.technologies) : [],
      download_available: !!sc.download_available,
      downloadAvailable: !!sc.download_available,
    }));

    res.json({
      success: true,
      data: {
        videos,
        projects,
        sourceCodes,
      },
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch homepage data",
      details: error.message,
    });
  }
});

// GET /main-page/stats
// Get statistics for homepage (from channel_stats and other tables)
router.get("/stats", async (req, res) => {
  try {
    // Get channel stats (most recent)
    const channelStatsResult = await db.execute({
      sql: `
        SELECT 
          total_subscribers, 
          total_views, 
          total_videos,
          last_updated
        FROM channel_stats 
        ORDER BY datetime(last_updated) DESC 
        LIMIT 1
      `,
      args: [],
    });

    // Get counts from other tables
    const projectsCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM projects",
      args: [],
    });

    const sourceCodesCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM source_codes",
      args: [],
    });

    const emailSubscribersCount = await db.execute({
      sql: "SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'",
      args: [],
    });

    // Use channel stats if available, otherwise fallback to 0
    const channelStats = channelStatsResult.rows[0] || {
      total_subscribers: 0,
      total_views: 0,
      total_videos: 0,
      last_updated: null,
    };

    res.json({
      success: true,
      data: {
        subscribers: channelStats.total_subscribers,
        totalViews: channelStats.total_views,
        videos: channelStats.total_videos,
        projects: projectsCount.rows[0].count,
        sourceCodes: sourceCodesCount.rows[0].count,
        emailSubscribers: emailSubscribersCount.rows[0].count,
        lastUpdated: channelStats.last_updated,
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

module.exports = router;
