require("dotenv").config();
const express = require("express");
const cors = require("cors");
const createRouter = require("./routes/create.js");
const editRouter = require("./routes/edit.js");
const dashboardRouter = require("./routes/dashboard");
const mailRouter = require("./routes/mail");
const mainPageRouter = require("./routes/main-page");
const { startScheduledSync } = require("./services/youtubeSync");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Request timeout and logging
app.use((req, res, next) => {
  req.setTimeout(60000); // 1 minute timeout
  res.setTimeout(60000);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "SMSRam API Server", 
    status: "running",
    version: "2.0.0",
    features: {
      youtube_sync: "Auto-sync every hour",
      contact_form: "Email notifications",
      dashboard_api: "Full CRUD operations",
      file_explorer: "Source code browser"
    }
  });
});

app.use("/create", createRouter);
app.use("/edit", editRouter);
app.use("/dashboard", dashboardRouter);
app.use("/mail", mailRouter);
app.use("/main-page", mainPageRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ SMSRam API Server v2.0.0`);
  console.log(`${"=".repeat(50)}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📦 Max upload: 100MB`);
  console.log(`⏱️  Request timeout: 60s`);
  console.log(`📧 Email service: Active`);
  console.log(`🎥 YouTube sync: Starting...`);
  console.log(`${"=".repeat(50)}\n`);
  
  // Start YouTube sync scheduler (runs every hour)
  try {
    startScheduledSync();
  } catch (error) {
    console.error("❌ Failed to start YouTube sync scheduler:", error);
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) {
    console.log('\n⚠️  Force killing...');
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🛑 ${signal} received, shutting down gracefully...`);
  console.log(`${"=".repeat(50)}`);

  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed');
    console.log('✅ All connections terminated');
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });

  // Force exit after 3 seconds if not closed
  setTimeout(() => {
    console.error('❌ Forcefully shutting down after timeout');
    process.exit(1);
  }, 3000);
};

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));  // Ctrl+C

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('\n❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Log startup completion
setTimeout(() => {
  console.log('✅ Server initialization complete');
  console.log('📡 Ready to accept requests\n');
}, 1000);

module.exports = app;
