"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Eye, ArrowRight, Sparkles, Zap } from "lucide-react";
import "./style/LatestVideosCards.css";

const ERROR_IMG_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

function ImageWithFallback({ src, alt, className }) {
  const [didError, setDidError] = useState(false);
  if (didError) return <img src={ERROR_IMG_SRC} alt="Error" className={className} />;
  return <img src={src} alt={alt} className={className} onError={() => setDidError(true)} />;
}

const videos = [
  {
    id: 1,
    title: "Complete Python Tutorial for Beginners 2024",
    description: "Learn Python from scratch with this comprehensive tutorial covering all fundamentals.",
    thumbnail: "https://images.unsplash.com/photo-1618422168439-4b03d3a05b15?w=400",
    views: "12K",
    duration: "45:20",
    category: "Python",
    color: "#10b981",
  },
  {
    id: 2,
    title: "Building AI Apps with Machine Learning",
    description: "Deep dive into creating practical AI applications using modern ML frameworks.",
    thumbnail: "https://images.unsplash.com/photo-1695144244472-a4543101ef35?w=400",
    views: "8.5K",
    duration: "32:15",
    category: "AI/ML",
    color: "#8b5cf6",
  },
  {
    id: 3,
    title: "Modern Web Development with React & Next.js",
    description: "Create stunning web applications with React and Next.js best practices.",
    thumbnail: "https://images.unsplash.com/photo-1593720213681-e9a8778330a7?w=400",
    views: "15K",
    duration: "52:40",
    category: "Web Dev",
    color: "#2563eb",
  },
  {
    id: 4,
    title: "Advanced Data Structures & Algorithms",
    description: "Master DSA concepts with practical coding examples and interview prep.",
    thumbnail: "https://images.unsplash.com/photo-1719400471588-575b23e27bd7?w=400",
    views: "10K",
    duration: "38:30",
    category: "DSA",
    color: "#f59e0b",
  },
  {
    id: 5,
    title: "Building RESTful APIs with Node.js",
    description: "Learn to create scalable backend services with Node.js and Express.",
    thumbnail: "https://images.unsplash.com/photo-1652212976547-16d7e2841b8c?w=400",
    views: "7.2K",
    duration: "28:45",
    category: "Backend",
    color: "#ec4899",
  },
  {
    id: 6,
    title: "Creative Coding with p5.js",
    description: "Explore generative art and creative coding techniques with p5.js.",
    thumbnail: "https://images.unsplash.com/photo-1618422168439-4b03d3a05b15?w=400",
    views: "5.8K",
    duration: "41:15",
    category: "Creative",
    color: "#f97316",
  },
];

export default function LatestVideosCards() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section id="videos" className="videos-section">
      <div className="videos-container">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="videos-section-header"
        >
          <motion.div
            className="videos-header-top"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="videos-header-sparkle" />
            <span className="videos-header-label">Featured Tutorials</span>
            <Sparkles className="videos-header-sparkle" />
          </motion.div>

          <motion.h2
            className="videos-section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Latest Videos
          </motion.h2>

          <motion.p
            className="videos-section-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Check out my recent tutorials and tech content
          </motion.p>

          <motion.div
            className="videos-title-underline"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          />
        </motion.div>

        {/* Video Grid */}
        <div className="video-grid">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                type: "spring",
                stiffness: 100,
              }}
              onHoverStart={() => setHoveredCard(video.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <motion.div
                className="video-card"
                whileHover={{
                  y: -12,
                  boxShadow: `0 30px 60px ${video.color}40`,
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Thumbnail Section */}
                <div className="video-thumbnail">
                  {/* Background Shape */}
                  <motion.div
                    className="thumbnail-bg-shape"
                    style={{ backgroundColor: video.color }}
                    animate={{
                      scale: hoveredCard === video.id ? 1.3 : 1,
                      opacity: hoveredCard === video.id ? 0.15 : 0.05,
                    }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Image */}
                  <motion.img
                    src={video.thumbnail}
                    alt={video.title}
                    className="thumbnail-img"
                    whileHover={{ scale: 1.15, rotate: 2 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Overlay */}
                  <motion.div
                    className="thumbnail-overlay"
                    animate={{
                      opacity: hoveredCard === video.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      className="play-button"
                      style={{ backgroundColor: video.color }}
                    >
                      <Play className="play-icon" fill="white" />
                    </motion.div>
                  </motion.div>

                  {/* Duration Badge */}
                  <motion.div
                    className="video-duration"
                    animate={{
                      y: hoveredCard === video.id ? -5 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {video.duration}
                  </motion.div>

                  {/* Category Badge */}
                  <motion.div
                    className="video-category"
                    style={{ backgroundColor: video.color }}
                    animate={{
                      x: hoveredCard === video.id ? [0, 3, -3, 0] : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: hoveredCard === video.id ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                  >
                    {video.category}
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="video-content">
                  <motion.h3
                    className="video-title"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.12 }}
                    animate={{
                      color:
                        hoveredCard === video.id ? video.color : "inherit",
                    }}
                  >
                    {video.title}
                  </motion.h3>

                  <motion.p
                    className="video-description"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.12 }}
                  >
                    {video.description}
                  </motion.p>

                  {/* Footer */}
                  <div className="video-footer">
                    <motion.div
                      className="video-views"
                      animate={{
                        x: hoveredCard === video.id ? [0, 3, 0] : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: hoveredCard === video.id ? Infinity : 0,
                      }}
                    >
                      <Eye className="view-icon" />
                      <span>{video.views} views</span>
                    </motion.div>

                    <motion.button
                      className="watch-btn"
                      style={{ backgroundColor: video.color }}
                      whileHover={{
                        scale: 1.08,
                        boxShadow: `0 12px 24px ${video.color}50`,
                      }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        x: hoveredCard === video.id ? [0, 5, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: hoveredCard === video.id ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      <Play className="watch-play-icon" fill="white" />
                      Watch
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                <motion.div
                  className="video-card-progress"
                  style={{ backgroundColor: video.color }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Glow Effect */}
                <motion.div
                  className="video-card-glow"
                  style={{
                    background: `radial-gradient(circle, ${video.color}40, transparent)`,
                  }}
                  animate={{
                    opacity: hoveredCard === video.id ? [0.5, 0.8, 0.5] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="videos-section-footer"
        >
          <motion.button
            className="videos-view-all-btn"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="btn-icon" />
            View All Videos
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
