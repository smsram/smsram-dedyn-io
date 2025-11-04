'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Search, Film } from 'lucide-react'
import { videosData } from '@/data/mockData'
import VideoCard from '@/app/components/dashboard/VideoCard'

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVideos = videosData.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="videos-page">
      {/* Page Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">All Videos</h1>
        <p className="page-subtitle">Browse through all our video tutorials</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="search-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search videos by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <motion.button
              className="search-clear"
              onClick={() => setSearchTerm('')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
            >
              ✕
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {searchTerm ? `Results (${filteredVideos.length})` : 'All Videos'}
        </h2>
        <span className="result-count">{filteredVideos.length} available</span>
      </div>

      {/* Videos Grid */}
      <motion.div 
        className="videos-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredVideos.map((video) => (
          <motion.div 
            key={video.id}
            variants={itemVariants}
          >
            <VideoCard video={video} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Film size={48} className="empty-state-icon" />
          <p className="empty-state-title">No videos found</p>
          <p className="empty-state-subtitle">Try searching with different keywords</p>
          <motion.button
            className="empty-state-btn"
            onClick={() => setSearchTerm('')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Search
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
