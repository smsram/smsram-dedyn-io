'use client'

import { motion } from 'motion/react'
import { Eye, ThumbsUp, Code } from 'lucide-react'
import Link from 'next/link'
import "../style/cards.css";

export default function VideoCard({ video }) {
  return (
    <motion.div 
      className="video-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <a 
        href={video.youtubeUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="video-thumbnail-link"
      >
        <div className="video-thumbnail">
          <img src={video.thumbnail} alt={video.title} />
          <motion.div 
            className="video-overlay"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="play-button"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.2 }}
            >
              ▶
            </motion.div>
          </motion.div>
        </div>
      </a>

      <div className="video-info">
        <Link href={`/dashboard/video/${video.id}`} className="video-title-link">
          <h3 className="video-title">{video.title}</h3>
        </Link>

        <div className="video-meta">
          <span className="meta-item">
            <Eye size={14} />
            {video.views} views
          </span>
          <span className="meta-item">
            <ThumbsUp size={14} />
            {video.likes} likes
          </span>
        </div>

        {video.hasSourceCode && (
          <Link href={`/dashboard/source-codes/${video.sourceCodeId}`} className="source-code-btn">
            <Code size={16} />
            Source Code
          </Link>
        )}
      </div>
    </motion.div>
  )
}
