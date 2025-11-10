const { createClient } = require("@libsql/client");
require("dotenv").config();

// DB client (Turso or local)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper to generate 8-char ID
function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Helper to extract YouTube video ID from URL
function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

// Helper to format ISO 8601 duration to HH:MM:SS or MM:SS
function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || "").replace("H", "");
  const minutes = (match[2] || "0M").replace("M", "");
  const seconds = (match[3] || "0S").replace("S", "");

  const parts = [];
  if (hours) parts.push(hours.padStart(2, "0"));
  parts.push(minutes.padStart(2, "0"));
  parts.push(seconds.padStart(2, "0"));

  return parts.join(":");
}

// Fetch YouTube channel statistics
async function fetchChannelStats() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error("YouTube API key or Channel ID not configured");
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok || !data.items || data.items.length === 0) {
      throw new Error("Failed to fetch channel statistics");
    }

    const channel = data.items[0];
    const stats = channel.statistics;

    return {
      channelId: channelId,
      channelName: channel.snippet.title,
      totalSubscribers: parseInt(stats.subscriberCount || 0),
      totalVideos: parseInt(stats.videoCount || 0),
      channelTotalViews: parseInt(stats.viewCount || 0),
    };
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    throw error;
  }
}

// Fetch YouTube data for multiple video IDs (max 50 per request)
async function fetchYouTubeDataBatch(videoIds) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }

  const idsString = videoIds.join(",");
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${idsString}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch YouTube data");
    }

    return data.items || [];
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    throw error;
  }
}

// Update a single video in the database
async function updateVideoInDB(videoId, youtubeData) {
  const now = new Date().toISOString();

  try {
    await db.execute({
      sql: `
        UPDATE videos 
        SET 
          title = ?,
          description = ?,
          full_description = ?,
          views = ?,
          likes = ?,
          duration = ?,
          topics = ?,
          updated_at = ?
        WHERE id = ?
      `,
      args: [
        youtubeData.snippet.title,
        youtubeData.snippet.description.substring(0, 200),
        youtubeData.snippet.description,
        parseInt(youtubeData.statistics.viewCount || 0),
        parseInt(youtubeData.statistics.likeCount || 0),
        formatDuration(youtubeData.contentDetails.duration),
        JSON.stringify(youtubeData.snippet.tags || []),
        now,
        videoId,
      ],
    });

    console.log(`✅ Updated video ${videoId}: ${youtubeData.snippet.title}`);
    return {
      success: true,
      views: parseInt(youtubeData.statistics.viewCount || 0),
    };
  } catch (error) {
    console.error(`❌ Error updating video ${videoId}:`, error);
    return { success: false, views: 0 };
  }
}

// Update or create channel stats in database (UPSERT - ensures single row per channel)
async function updateChannelStats(channelData, calculatedTotalViews) {
  const now = new Date().toISOString();

  try {
    // Check if record exists for this channel_id
    const existing = await db.execute({
      sql: "SELECT id FROM channel_stats WHERE channel_id = ? LIMIT 1",
      args: [channelData.channelId],
    });

    if (existing.rows.length > 0) {
      // UPDATE existing record
      const recordId = existing.rows[0].id;

      await db.execute({
        sql: `
          UPDATE channel_stats 
          SET 
            channel_name = ?,
            total_subscribers = ?,
            total_views = ?,
            total_videos = ?,
            last_updated = ?
          WHERE channel_id = ?
        `,
        args: [
          channelData.channelName,
          channelData.totalSubscribers,
          calculatedTotalViews,
          channelData.totalVideos,
          now,
          channelData.channelId,
        ],
      });

      console.log(`✅ Updated channel stats (Record ID: ${recordId})`);
    } else {
      // INSERT new record (only if doesn't exist)
      const newId = generateId();

      await db.execute({
        sql: `
          INSERT INTO channel_stats 
          (id, channel_id, channel_name, total_subscribers, total_views, total_videos, last_updated) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          newId,
          channelData.channelId,
          channelData.channelName,
          channelData.totalSubscribers,
          calculatedTotalViews,
          channelData.totalVideos,
          now,
        ],
      });

      console.log(`✅ Created new channel stats record (ID: ${newId})`);
    }

    console.log(`   Channel: ${channelData.channelName}`);
    console.log(`   Subscribers: ${channelData.totalSubscribers.toLocaleString()}`);
    console.log(`   Total Views: ${calculatedTotalViews.toLocaleString()}`);
    console.log(`   Total Videos: ${channelData.totalVideos}`);

    return true;
  } catch (error) {
    console.error("❌ Error updating channel stats:", error);
    return false;
  }
}

// Main sync function
async function syncAllVideos() {
  console.log("\n🔄 Starting YouTube sync...");
  const startTime = Date.now();

  try {
    // Fetch channel statistics from YouTube
    console.log("\n📊 Fetching channel statistics...");
    const channelStats = await fetchChannelStats();
    console.log(`   Channel: ${channelStats.channelName}`);
    console.log(`   Subscribers: ${channelStats.totalSubscribers.toLocaleString()}`);
    console.log(`   Total Videos: ${channelStats.totalVideos}`);

    // Fetch all videos from database
    const result = await db.execute({
      sql: "SELECT id, youtube_url FROM videos ORDER BY datetime(created_at) DESC",
      args: [],
    });

    const allVideos = result.rows;
    console.log(`\n📹 Found ${allVideos.length} videos in database`);

    if (allVideos.length === 0) {
      console.log("⚠️  No videos to sync");
      await updateChannelStats(channelStats, 0);
      return { success: true, updated: 0, failed: 0 };
    }

    // Extract YouTube video IDs
    const videoMap = new Map();
    const youtubeIds = [];

    for (const video of allVideos) {
      const ytId = extractYoutubeId(video.youtube_url);
      if (ytId) {
        videoMap.set(ytId, video.id);
        youtubeIds.push(ytId);
      } else {
        console.log(`⚠️  Invalid YouTube URL for video ${video.id}`);
      }
    }

    console.log(`🎯 Extracted ${youtubeIds.length} valid YouTube IDs`);

    if (youtubeIds.length === 0) {
      console.log("⚠️  No valid YouTube URLs to sync");
      await updateChannelStats(channelStats, 0);
      return { success: true, updated: 0, failed: 0 };
    }

    // Process in batches of 50
    const BATCH_SIZE = 50;
    let totalUpdated = 0;
    let totalFailed = 0;
    let totalViewsSum = 0;

    for (let i = 0; i < youtubeIds.length; i += BATCH_SIZE) {
      const batch = youtubeIds.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(youtubeIds.length / BATCH_SIZE);

      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} videos)`);

      try {
        const youtubeVideos = await fetchYouTubeDataBatch(batch);
        const ytDataMap = new Map();
        
        for (const ytVideo of youtubeVideos) {
          ytDataMap.set(ytVideo.id, ytVideo);
        }

        for (const ytId of batch) {
          const ytData = ytDataMap.get(ytId);
          const dbId = videoMap.get(ytId);

          if (ytData && dbId) {
            const result = await updateVideoInDB(dbId, ytData);
            if (result.success) {
              totalUpdated++;
              totalViewsSum += result.views;
            } else {
              totalFailed++;
            }
          } else {
            console.log(`⚠️  No YouTube data found for ${ytId} (might be private/deleted)`);
            totalFailed++;
          }
        }

        if (i + BATCH_SIZE < youtubeIds.length) {
          console.log("⏳ Waiting 2 seconds before next batch...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Error processing batch ${batchNumber}:`, error);
        totalFailed += batch.length;
      }
    }

    // Update channel stats with calculated total views
    console.log(`\n📈 Calculated total views from videos: ${totalViewsSum.toLocaleString()}`);
    await updateChannelStats(channelStats, totalViewsSum);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Sync completed in ${duration}s`);
    console.log(`   Videos Updated: ${totalUpdated}`);
    console.log(`   Videos Failed: ${totalFailed}`);
    console.log(`   Total Views (Sum): ${totalViewsSum.toLocaleString()}`);
    console.log(`   Subscribers: ${channelStats.totalSubscribers.toLocaleString()}`);

    return {
      success: true,
      updated: totalUpdated,
      failed: totalFailed,
      totalViews: totalViewsSum,
      subscribers: channelStats.totalSubscribers,
      duration: duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Fatal error during sync:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Schedule the sync to run every hour
function startScheduledSync() {
  console.log("\n🚀 YouTube sync scheduler started");
  console.log("⏰ Running every 1 hour");

  // Run immediately on startup
  console.log("🔄 Running initial sync...");
  syncAllVideos();

  // Then run every hour
  setInterval(() => {
    console.log(`\n⏰ Scheduled sync triggered at ${new Date().toLocaleString()}`);
    syncAllVideos();
  }, 60 * 60 * 1000);
}

module.exports = {
  syncAllVideos,
  startScheduledSync,
};
