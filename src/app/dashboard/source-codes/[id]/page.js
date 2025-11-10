"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  Github,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Play,
  Code as CodeIcon,
  Layers,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CodeExplorer from "@/app/components/dashboard/CodeExplorer";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function SourceCodeDetail() {
  const params = useParams();
  const id = params.id;

  const [sourceCode, setSourceCode] = useState(null);
  const [filesTree, setFilesTree] = useState(null);
  const [relatedVideo, setRelatedVideo] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState("");
  const [filesError, setFilesError] = useState("");
  const codeExplorerRef = useRef(null);

  // Fetch source code details and related video first
  useEffect(() => {
    if (!id) {
      setError("No source code ID provided");
      setLoading(false);
      return;
    }

    const fetchSourceCodeAndVideo = async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Source code details
        const scRes = await fetch(`${BASE_URL}/dashboard/source-codes/${id}`);
        const scJson = await scRes.json();
        if (!scRes.ok || !scJson.success) {
          throw new Error(scJson.error || "Source code not found");
        }
        const sc = scJson.data;
        setSourceCode(sc);

        if (sc.updated_at) {
          const d = new Date(sc.updated_at);
          setFormattedDate(
            d.toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })
          );
        }

        // 2) Related video
        if (sc.video_id) {
          try {
            const vRes = await fetch(`${BASE_URL}/dashboard/videos/${sc.video_id}`);
            const vJson = await vRes.json();
            if (vJson.success) setRelatedVideo(vJson.data);
          } catch {
            // ignore video error
          }
        }
      } catch (e) {
        console.error("Source code fetch error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSourceCodeAndVideo();
  }, [id]);

  // Fetch files tree separately after main content loads
  useEffect(() => {
    if (!id || !sourceCode) return;

    const fetchFilesTree = async () => {
      setFilesLoading(true);
      setFilesError("");
      try {
        const fRes = await fetch(`${BASE_URL}/dashboard/source-codes/${id}/files`);
        const fJson = await fRes.json();
        if (!fRes.ok || !fJson.success) {
          throw new Error(fJson.error || "Failed to load files");
        }
        setFilesTree(Array.isArray(fJson.data) ? fJson.data : []);
      } catch (fe) {
        console.error("Files fetch error:", fe);
        setFilesError(fe.message || "Failed to load files");
        setFilesTree([]);
      } finally {
        setFilesLoading(false);
      }
    };

    // Small delay to let main content render first
    const timer = setTimeout(fetchFilesTree, 100);
    return () => clearTimeout(timer);
  }, [id, sourceCode]);

  const scrollToCodeExplorer = () => {
    codeExplorerRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "start" 
    });
  };

  // Safe arrays for technologies/features
  const technologies = useMemo(() => {
    if (!sourceCode?.technologies) return [];
    try {
      const parsed = JSON.parse(sourceCode.technologies);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(sourceCode.technologies)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }, [sourceCode?.technologies]);

  const features = useMemo(() => {
    if (!sourceCode?.features) return [];
    try {
      const parsed = JSON.parse(sourceCode.features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(sourceCode.features)
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }
  }, [sourceCode?.features]);

  const getFeatureDetails = (feature, index) => {
    const details = [
      { 
        icon: CodeIcon, 
        color: "cyan", 
        desc: "Clean and maintainable code structure" 
      },
      { 
        icon: Layers, 
        color: "purple", 
        desc: "Modular component architecture" 
      },
      { 
        icon: Zap, 
        color: "orange", 
        desc: "Optimized for best performance" 
      },
      { 
        icon: Star, 
        color: "cyan", 
        desc: "Production-ready implementation" 
      },
    ];
    return details[index % details.length];
  };

  if (loading) {
    return (
      <div className="sourcecode-detail-page">
        <LoadingSpinner message="Loading source code details..." />
      </div>
    );
  }

  if (error || !sourceCode) {
    return (
      <div className="sourcecode-detail-page">
        <div className="error-container">
          <h2>{error || "Source code not found"}</h2>
          <Link href="/dashboard/source-codes" className="back-link">
            <ArrowLeft size={16} />
            Back to Source Codes
          </Link>
        </div>
      </div>
    );
  }

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
            <p className="sourcecode-detail-description">{sourceCode.description}</p>

            <div className="sourcecode-detail-meta">
              {formattedDate && (
                <span className="meta-item">
                  <Calendar size={18} />
                  Updated: {formattedDate}
                </span>
              )}
              {features.length > 0 && (
                <span className="meta-item">
                  <CodeIcon size={18} />
                  {features.length} features
                </span>
              )}
            </div>

            <div className="sourcecode-actions-main">
              {sourceCode.download_available && (
                <motion.a
                  href={sourceCode.download_url || "#"}
                  className="action-btn primary-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={18} />
                  Download Source Code
                </motion.a>
              )}
              {sourceCode.github_url && (
                <motion.a
                  href={sourceCode.github_url}
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
          {technologies.length > 0 && (
            <motion.div 
              className="detail-section" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="section-title">Technologies Used</h2>
              <div className="tech-tags-large">
                {technologies.map((tech, index) => (
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
          )}

          {/* Features */}
          {features.length > 0 && (
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
                {features.map((feature, index) => {
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
                        ease: [0.4, 0, 0.2, 1] 
                      }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="feature-card-header">
                        <div className={`feature-icon-circle feature-icon-${details.color}`}>
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
                    <span className="stat-value">{features.length}</span>
                    <span className="stat-label">Features</span>
                  </div>
                </motion.div>
                <motion.div className="stat-item" whileHover={{ scale: 1.05 }}>
                  <div className="stat-icon">
                    <CodeIcon size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{technologies.length}</span>
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
          )}
        </motion.div>

        {/* Code Explorer Section - Loads after main content */}
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

          {filesLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingSpinner message="Loading file explorer..." />
            </motion.div>
          ) : filesError ? (
            <div className="error-banner">
              <span>{filesError}</span>
              <button
                onClick={async () => {
                  try {
                    setFilesLoading(true);
                    setFilesError("");
                    const fRes = await fetch(
                      `${BASE_URL}/dashboard/source-codes/${id}/files`
                    );
                    const fJson = await fRes.json();
                    if (!fRes.ok || !fJson.success) {
                      throw new Error(fJson.error || "Failed to load files");
                    }
                    setFilesTree(Array.isArray(fJson.data) ? fJson.data : []);
                  } catch (err) {
                    setFilesError(err.message || "Failed to load files");
                    setFilesTree([]);
                  } finally {
                    setFilesLoading(false);
                  }
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CodeExplorer files={filesTree || []} />
            </motion.div>
          )}
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
                href={relatedVideo.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="video-thumbnail">
                  <img
                    src={
                      relatedVideo.thumbnail || 
                      "https://via.placeholder.com/320x180?text=Video+Preview"
                    }
                    alt={relatedVideo.title}
                  />
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
                    href={relatedVideo.youtube_url} 
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
