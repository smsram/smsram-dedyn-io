'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Play, Share2, Calendar, Eye, ThumbsUp, ArrowLeft, Code, Github, 
  Clock, Tag, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Helper to extract YouTube video ID from various URL formats
function extractYoutubeId(url) {
  if (!url) return ''
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}

export default function VideoDetail() {
  const params = useParams()
  const id = params.id
  
  const [video, setVideo] = useState(null)
  const [relatedSourceCode, setRelatedSourceCode] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Parse topics from string to array
  const topicsArray = useMemo(() => {
    if (!video?.topics) return []
    
    // If topics is already a string, split by comma
    if (typeof video.topics === 'string') {
      return video.topics.split(',').map(t => t.trim()).filter(Boolean)
    }
    
    // If topics is a JSON string, parse it
    try {
      const parsed = JSON.parse(video.topics)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [video?.topics])

  // Format date
  const formattedDate = useMemo(() => {
    if (!video?.published_date) return ''
    const date = new Date(video.published_date)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [video?.published_date])

  // Description preview logic
  const PREVIEW_LENGTH = 500
  const isDescriptionLong = video?.full_description?.length > PREVIEW_LENGTH

  const displayedDescription = useMemo(() => {
    if (!video?.full_description) return ''
    if (showFullDescription || !isDescriptionLong) {
      return video.full_description
    }
    return video.full_description.substring(0, PREVIEW_LENGTH) + '...'
  }, [video?.full_description, showFullDescription, isDescriptionLong])

  useEffect(() => {
    if (!id) return

    const fetchVideoData = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch main video details
        const videoRes = await fetch(`${BASE_URL}/dashboard/videos/${id}`)
        const videoData = await videoRes.json()
        
        if (!videoRes.ok || !videoData.success) {
          throw new Error(videoData.error || 'Video not found')
        }
        
        setVideo(videoData.data)

        // Fetch related source code if it exists
        if (videoData.data.has_source_code && videoData.data.source_code_id) {
          try {
            const scRes = await fetch(`${BASE_URL}/dashboard/source-codes/${videoData.data.source_code_id}`)
            const scData = await scRes.json()
            if (scData.success) {
              setRelatedSourceCode(scData.data)
            }
          } catch (err) {
            console.error('Error fetching source code:', err)
          }
        }

        // Fetch related videos
        try {
          const relatedRes = await fetch(`${BASE_URL}/dashboard/videos/${id}/related`)
          const relatedData = await relatedRes.json()
          if (relatedData.success) {
            setRelatedVideos(relatedData.data)
          }
        } catch (err) {
          console.error('Error fetching related videos:', err)
        }

      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideoData()
  }, [id])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err))
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="video-detail-page loading-container">
        <LoadingSpinner message="Loading video details..." />
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="video-detail-page">
        <div className="error-container">
          <h2>{error || 'Video not found'}</h2>
          <Link href="/dashboard/videos" className="back-link">
            <ArrowLeft size={16} />
            Back to Videos
          </Link>
        </div>
      </div>
    )
  }

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
                src={`https://www.youtube.com/embed/${extractYoutubeId(video.youtube_url)}`}
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
            {video.description && (
              <p className="video-detail-description">{video.description}</p>
            )}

            <div className="video-detail-meta">
              {formattedDate && (
                <span className="meta-item">
                  <Calendar size={18} />
                  {formattedDate}
                </span>
              )}
              <span className="meta-item">
                <Eye size={18} />
                {Number(video.views || 0).toLocaleString()} views
              </span>
              <span className="meta-item">
                <ThumbsUp size={18} />
                {Number(video.likes || 0).toLocaleString()} likes
              </span>
              {video.duration && (
                <span className="meta-item">
                  <Clock size={18} />
                  {video.duration}
                </span>
              )}
            </div>

            <div className="video-actions-main">
              <motion.a 
                href={video.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn primary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={18} />
                Watch on YouTube
              </motion.a>
              <motion.button 
                className="action-btn secondary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
              >
                <Share2 size={18} />
                Share
              </motion.button>
            </div>
          </div>

          {/* Video Info Grid */}
          <motion.div 
            className="detail-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              <BookOpen size={24} />
              Video Information
            </h2>
            <div className="info-grid">
              {video.category && (
                <div className="info-item">
                  <h3>Category</h3>
                  <p>{video.category}</p>
                </div>
              )}
              {video.level && (
                <div className="info-item">
                  <h3>Difficulty Level</h3>
                  <p className={`level-badge level-${video.level.toLowerCase()}`}>
                    {video.level}
                  </p>
                </div>
              )}
              {video.duration && (
                <div className="info-item">
                  <h3>Duration</h3>
                  <p>{video.duration}</p>
                </div>
              )}
              <div className="info-item">
                <h3>Published</h3>
                <p>{formattedDate || 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          {/* Topics Covered */}
          {topicsArray.length > 0 && (
            <motion.div 
              className="detail-section topics-section"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                <Tag size={24} />
                Topics Covered
              </h2>
              <div className="topics-grid">
                {topicsArray.map((topic, index) => (
                  <motion.div 
                    key={index}
                    className="topic-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <div className="topic-icon">✓</div>
                    <span className="topic-text">{topic}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Related Source Code */}
          {relatedSourceCode && (
            <motion.div 
              className="related-sourcecode-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                <Code size={24} />
                Related Source Code
              </h2>
              <motion.div 
                className="related-sourcecode-card"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="sourcecode-info">
                  <Link 
                    href={`/dashboard/source-codes/${relatedSourceCode.id}`}
                    className="sourcecode-title-link"
                  >
                    <h3 className="sourcecode-title">{relatedSourceCode.title}</h3>
                  </Link>
                  <p className="sourcecode-description">
                    {relatedSourceCode.description}
                  </p>

                  {/* Technologies */}
                  {relatedSourceCode.technologies && (
                    <div className="sourcecode-tech">
                      {(() => {
                        try {
                          const techs = typeof relatedSourceCode.technologies === 'string'
                            ? JSON.parse(relatedSourceCode.technologies)
                            : relatedSourceCode.technologies
                          
                          return Array.isArray(techs) 
                            ? techs.slice(0, 5).map((tech, idx) => (
                                <span key={idx} className="tech-tag">{tech}</span>
                              ))
                            : null
                        } catch {
                          return null
                        }
                      })()}
                    </div>
                  )}

                  <div className="sourcecode-actions-related">
                    <Link 
                      href={`/dashboard/source-codes/${relatedSourceCode.id}`}
                      className="action-btn view-btn"
                    >
                      <Code size={16} />
                      View Source Code
                    </Link>
                    {relatedSourceCode.github_url && (
                      <a 
                        href={relatedSourceCode.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn github-btn"
                      >
                        <Github size={16} />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Full Description with Show More/Less */}
          {video.full_description && (
            <motion.div 
              className="detail-section description-section"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">
                <BookOpen size={24} />
                About This Video
              </h2>
              <div className="description-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showFullDescription ? 'full' : 'preview'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {displayedDescription.split('\n').map((paragraph, index) => (
                      paragraph.trim() ? (
                        <p key={index} className="description-paragraph">
                          {paragraph}
                        </p>
                      ) : (
                        <br key={index} />
                      )
                    ))}
                  </motion.div>
                </AnimatePresence>
                
                {isDescriptionLong && (
                  <motion.button
                    className="show-more-btn"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp size={18} />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} />
                        Show More
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

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
                {relatedVideos.map((relatedVideo, index) => {
                  const videoId = extractYoutubeId(relatedVideo.youtube_url)
                  const thumbUrl = videoId 
                    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                    : relatedVideo.thumbnail || '/images/video-fallback.jpg'
                  
                  return (
                    <motion.div 
                      key={relatedVideo.id}
                      className="related-video-item"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -8 }}
                    >
                      <Link 
                        href={`/dashboard/videos/${relatedVideo.id}`}
                        className="related-video-thumbnail"
                      >
                        <Image 
                          src={thumbUrl}
                          alt={relatedVideo.title}
                          width={320}
                          height={180}
                          className="related-video-img"
                        />
                        <div className="video-overlay">
                          <div className="play-icon">
                            <Play size={32} fill="white" />
                          </div>
                        </div>
                      </Link>
                      <div className="related-video-info">
                        <Link href={`/dashboard/videos/${relatedVideo.id}`}>
                          <h3 className="related-video-title">{relatedVideo.title}</h3>
                        </Link>
                        <p className="related-video-meta">
                          {Number(relatedVideo.views || 0).toLocaleString()} views
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
