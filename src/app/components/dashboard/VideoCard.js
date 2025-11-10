'use client'

import { motion } from 'motion/react'
import { Eye, ThumbsUp, Code, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import '../style/cards.css'

const FALLBACK_THUMB = '/images/video-fallback.jpg' // ensure this exists in /public/images

function getYouTubeThumb(youtubeUrl) {
  if (!youtubeUrl || typeof youtubeUrl !== 'string') return null
  const match = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
  const id = match && match[1]
  return id ? `https://img.youtube.com/vi/${id}/sddefault.jpg` : null
}

function safeThumbSrc(video) {
  if (video && typeof video.thumbnail === 'string' && video.thumbnail.trim().length > 0) {
    return video.thumbnail.trim()
  }
  const yt = getYouTubeThumb(video && video.youtube_url)
  if (yt) return yt
  return FALLBACK_THUMB
}

export default function VideoCard({ video }) {
  const safeSrc = safeThumbSrc(video)
  const title = (video && video.title) || 'Untitled'
  const views = Number((video && video.views) || 0)
  const likes = Number((video && video.likes) || 0)
  const hasSourceCode = Boolean(
    (video && video.has_source_code) != null ? video.has_source_code : (video && video.hasSourceCode)
  )
  const sourceCodeId =
    (video && video.source_code_id) != null ? video.source_code_id : (video && video.sourceCodeId)

  return (
    <motion.div
      className="video-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Thumbnail - Click to view details */}
      <Link href={`/dashboard/videos/${video && video.id}`} className="video-thumbnail-link">
        <div className="video-thumbnail">
          <Image
            src={safeSrc}
            alt={title}
            width={640}
            height={360}
            className="video-thumb-img"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <motion.div
            className="video-overlay"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div className="play-button" whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              ▶
            </motion.div>
          </motion.div>
        </div>
      </Link>

      <div className="video-info">
        {/* Title - Click to view details */}
        <Link href={`/dashboard/videos/${video && video.id}`} className="video-title-link">
          <h3 className="video-title">{title}</h3>
        </Link>

        <div className="video-meta">
          <span className="meta-item">
            <Eye size={14} />
            {views} views
          </span>
          <span className="meta-item">
            <ThumbsUp size={14} />
            {likes} likes
          </span>
        </div>

        {/* Action Buttons */}
        <div className="video-card-actions">
          <Link href={`/dashboard/videos/${video && video.id}`} className="action-btn view-details-btn">
            <ExternalLink size={14} />
            View Details
          </Link>

          {hasSourceCode && sourceCodeId && (
            <Link href={`/dashboard/source-codes/${sourceCodeId}`} className="source-code-btn">
              <Code size={14} />
              Source Code
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
