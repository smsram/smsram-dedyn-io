"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Download,
  Github,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Play,
  Code,
  Layers,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { sourceCodesData, videosData } from "@/data/mockData";
import CodeExplorer from "@/app/components/dashboard/CodeExplorer";

export default function SourceCodeDetail() {
  const params = useParams();
  const id = params.id;
  const sourceCode = sourceCodesData.find((sc) => sc.id === parseInt(id));
  const [formattedDate, setFormattedDate] = useState("");
  const codeExplorerRef = useRef(null);

  useEffect(() => {
    if (sourceCode) {
      const date = new Date(sourceCode.lastUpdated);
      setFormattedDate(
        date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [sourceCode]);

  const scrollToCodeExplorer = () => {
    codeExplorerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (!sourceCode) {
    return (
      <div className="sourcecode-detail-page">
        <div className="error-container">
          <h2>Source code not found</h2>
          <Link href="/dashboard/source-codes" className="back-link">
            <ArrowLeft size={16} />
            Back to Source Codes
          </Link>
        </div>
      </div>
    );
  }

  const relatedVideo = videosData.find((v) => v.id === sourceCode.videoId);

  const fileStructure = sourceCode.files || [
    {
      path: "src",
      name: "src",
      type: "folder",
      children: [
        {
          path: "src/App.js",
          name: "App.js",
          type: "file",
          language: "javascript",
          content: `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}\n\nexport default App;`,
        },
        {
          path: "src/App.css",
          name: "App.css",
          type: "file",
          language: "css",
          content: `.App {\n  text-align: center;\n}\n\n.App h1 {\n  font-size: 2rem;\n  color: #333;\n}`,
        },
      ],
    },
    {
      path: "package.json",
      name: "package.json",
      type: "file",
      language: "json",
      content: `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "description": "My awesome app",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}`,
    },
  ];

  // Feature descriptions mapping
  const getFeatureDetails = (feature, index) => {
    const details = {
      0: {
        icon: Code,
        color: "cyan",
        desc: "Clean and maintainable code structure",
      },
      1: {
        icon: Layers,
        color: "purple",
        desc: "Modular component architecture",
      },
      2: { icon: Zap, color: "orange", desc: "Optimized for best performance" },
      3: { icon: Star, color: "cyan", desc: "Production-ready implementation" },
    };
    return details[index % 4] || details[0];
  };

  return (
    <div className="sourcecode-detail-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/dashboard/source-codes" className="back-link">
          <ArrowLeft size={16} />
          Back to Source Codes
        </Link>

        {/* Header Section */}
        <motion.div
          className="sourcecode-detail-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="sourcecode-detail-header">
            <h1 className="sourcecode-detail-title">{sourceCode.title}</h1>
            <p className="sourcecode-detail-description">
              {sourceCode.description}
            </p>

            <div className="sourcecode-detail-meta">
              {formattedDate && (
                <span className="meta-item">
                  <Calendar size={18} />
                  Updated: {formattedDate}
                </span>
              )}
              {sourceCode.downloadAvailable && (
                <span className="meta-item">
                  Size: {sourceCode.downloadSize}
                </span>
              )}
            </div>

            <div className="sourcecode-actions-main">
              {sourceCode.downloadAvailable && (
                <motion.button
                  className="action-btn primary-btn"
                  onClick={scrollToCodeExplorer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={18} />
                  Download Source Code
                </motion.button>
              )}
              {sourceCode.githubUrl && (
                <motion.a
                  href={sourceCode.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn secondary-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github size={18} />
                  View on GitHub
                </motion.a>
              )}
            </div>
          </div>

          {/* Technologies */}
          <motion.div
            className="detail-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="section-title">Technologies Used</h2>
            <div className="tech-tags-large">
              {sourceCode.technologies.map((tech, index) => (
                <motion.span
                  key={index}
                  className="tech-tag-large"
                  whileHover={{ y: -2 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Features Section */}
          <motion.div
            className="detail-section features-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">Features Included</h2>
              <p className="section-subtitle">
                Everything you need to get started quickly
              </p>
            </div>

            <div className="features-grid">
              {sourceCode.features.map((feature, index) => {
                const details = getFeatureDetails(feature, index);
                const Icon = details.icon;

                return (
                  <motion.div
                    key={`feature-${index}`}
                    className={`feature-card-new feature-${details.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="feature-card-header">
                      <div
                        className={`feature-icon-circle feature-icon-${details.color}`}
                      >
                        <Icon size={28} />
                      </div>
                    </div>

                    <div className="feature-card-body">
                      <h3 className="feature-card-title">{feature}</h3>
                      <p className="feature-card-desc">{details.desc}</p>
                    </div>

                    <div className="feature-card-footer">
                      <div className="feature-line"></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Feature Stats */}
            <motion.div
              className="feature-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.div className="stat-item" whileHover={{ scale: 1.05 }}>
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {sourceCode.features.length}
                  </span>
                  <span className="stat-label">Features</span>
                </div>
              </motion.div>
              <motion.div className="stat-item" whileHover={{ scale: 1.05 }}>
                <div className="stat-icon">
                  <Code size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {sourceCode.technologies.length}
                  </span>
                  <span className="stat-label">Technologies</span>
                </div>
              </motion.div>
              <motion.div className="stat-item" whileHover={{ scale: 1.05 }}>
                <div className="stat-icon">
                  <Layers size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">100%</span>
                  <span className="stat-label">Complete</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Code Explorer Section */}
        <motion.div
          ref={codeExplorerRef}
          className="code-explorer-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="section-title-wrapper">
            <h2 className="section-title">Source Code Files</h2>
            <p className="section-subtitle">
              Browse and download the complete source code
            </p>
          </div>
          <CodeExplorer files={fileStructure} />
        </motion.div>

        {/* Related Video */}
        {relatedVideo && (
          <motion.div
            className="related-video-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="section-title">Related Video Tutorial</h2>
            <div className="related-video-card">
              <a
                href={relatedVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="video-thumbnail">
                  <img src={relatedVideo.thumbnail} alt={relatedVideo.title} />
                  <div className="video-overlay">
                    <Play size={40} />
                  </div>
                </div>
              </a>

              <div className="video-info">
                <Link href={`/dashboard/videos/${relatedVideo.id}`}>
                  <h3 className="video-title">{relatedVideo.title}</h3>
                </Link>
                <p className="video-description">{relatedVideo.description}</p>

                <div className="video-actions">
                  <Link
                    href={`/dashboard/videos/${relatedVideo.id}`}
                    className="action-btn view-btn"
                  >
                    <Play size={16} />
                    View Video Details
                  </Link>
                  <a
                    href={relatedVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn youtube-btn"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
