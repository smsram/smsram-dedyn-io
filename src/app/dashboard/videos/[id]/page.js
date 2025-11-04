'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Play, Share2, Calendar, Eye, ThumbsUp, ArrowLeft, Code, Download } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { videosData, sourceCodesData } from '@/data/mockData'

export default function VideoDetail() {
  const params = useParams()
  const id = params.id
  const video = videosData.find(v => v.id === parseInt(id))
  const [formattedDate, setFormattedDate] = useState('')

  // Format date on client only to avoid hydration mismatch
  useEffect(() => {
    if (video) {
      const date = new Date(video.publishedDate)
      setFormattedDate(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }
  }, [video])

  if (!video) {
    return (
      <div className="video-detail-page">
        <div className="error-container">
          <h2>Video not found</h2>
          <Link href="/dashboard/videos" className="back-link">
            <ArrowLeft size={16} />
            Back to Videos
          </Link>
        </div>
      </div>
    )
  }

  const relatedSourceCode = video.hasSourceCode 
    ? sourceCodesData.find(sc => sc.id === video.sourceCodeId)
    : null

  const relatedVideos = videosData
    .filter(v => v.id !== video.id && v.category === video.category)
    .slice(0, 3)

  return (
    <div className="video-detail-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/dashboard/videos" className="back-link">
          <ArrowLeft size={16} />
          Back to Videos
        </Link>

        <div className="video-detail-container">
          {/* Video Player Section */}
          <motion.div 
            className="video-player-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="video-player-wrapper">
              <iframe
                width="100%"
                height="600"
                src={`https://www.youtube.com/embed/${extractYoutubeId(video.youtubeUrl)}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              />
            </div>
          </motion.div>

          {/* Video Header */}
          <div className="video-detail-header">
            <h1 className="video-detail-title">{video.title}</h1>
            <p className="video-detail-description">{video.description}</p>

            <div className="video-detail-meta">
              {formattedDate && (
                <span className="meta-item">
                  <Calendar size={18} />
                  Published: {formattedDate}
                </span>
              )}
              <span className="meta-item">
                <Eye size={18} />
                {video.views} views
              </span>
              <span className="meta-item">
                <ThumbsUp size={18} />
                {video.likes} likes
              </span>
            </div>

            <div className="video-actions-main">
              <a 
                href={video.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn primary-btn"
              >
                <Play size={18} />
                Watch on YouTube
              </a>
              <button className="action-btn secondary-btn">
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Video Info Section */}
          <motion.div 
            className="detail-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Video Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <h3>Duration</h3>
                <p>{video.duration || 'N/A'}</p>
              </div>
              <div className="info-item">
                <h3>Category</h3>
                <p>{video.category || 'Web Development'}</p>
              </div>
              <div className="info-item">
                <h3>Level</h3>
                <p>{video.level || 'Beginner'}</p>
              </div>
              <div className="info-item">
                <h3>Channel</h3>
                <p>SMSRam</p>
              </div>
            </div>
          </motion.div>

          {/* Topics Covered */}
          <motion.div 
            className="detail-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Topics Covered</h2>
            <div className="topics-list">
              {video.topics ? video.topics.map((topic, index) => (
                <motion.div 
                  key={index}
                  className="topic-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <div className="topic-check">✓</div>
                  <span>{topic}</span>
                </motion.div>
              )) : (
                <p className="no-data">Topics information not available</p>
              )}
            </div>
          </motion.div>

          {/* Source Code Related */}
          {relatedSourceCode && (
            <motion.div 
              className="related-sourcecode-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="section-title">Related Source Code</h2>
              <div className="related-sourcecode-card">
                <div className="sourcecode-info">
                  <Link href={`/dashboard/source-code/${relatedSourceCode.id}`} className="sourcecode-title-link">
                    <h3 className="sourcecode-title">{relatedSourceCode.title}</h3>
                  </Link>
                  <p className="sourcecode-description">{relatedSourceCode.description}</p>

                  <div className="sourcecode-tech">
                    {relatedSourceCode.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>

                  <div className="sourcecode-actions-related">
                    <Link href={`/dashboard/source-code/${relatedSourceCode.id}`} className="action-btn view-btn">
                      <Code size={16} />
                      View Source Code
                    </Link>
                    {relatedSourceCode.downloadAvailable && (
                      <button className="action-btn download-btn">
                        <Download size={16} />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Transcript Section */}
          <motion.div 
            className="detail-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Video Description</h2>
            <div className="transcript-content">
              {video.fullDescription ? (
                <p>{video.fullDescription}</p>
              ) : (
                <p className="no-data">Full description not available</p>
              )}
            </div>
          </motion.div>

          {/* Related Videos */}
          {relatedVideos.length > 0 && (
            <motion.div 
              className="related-videos-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">Related Videos</h2>
              <div className="related-videos-grid">
                {relatedVideos.map((relatedVideo, index) => (
                  <motion.div 
                    key={relatedVideo.id}
                    className="related-video-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                  >
                    <Link href={`/dashboard/videos/${relatedVideo.id}`} className="related-video-thumbnail">
                      <img src={relatedVideo.thumbnail} alt={relatedVideo.title} />
                      <div className="video-overlay">
                        <Play size={32} />
                      </div>
                    </Link>
                    <div className="related-video-info">
                      <Link href={`/dashboard/videos/${relatedVideo.id}`}>
                        <h3 className="related-video-title">{relatedVideo.title}</h3>
                      </Link>
                      <p className="related-video-meta">{relatedVideo.views} views</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Helper function to extract YouTube video ID
function extractYoutubeId(url) {
  if (!url) return ''
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(youtubeRegex)
  return match ? match[1] : ''
}
