'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Eye, Code, ExternalLink, Video, Search } from 'lucide-react'
import Link from 'next/link'
import { videosData } from '@/data/mockData'
import StatCard from '../components/dashboard/StatCard'
import VideoCard from '../components/dashboard/VideoCard'

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  // Get latest 6 videos or filter by search
  const videosToDisplay = searchTerm 
    ? videosData.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : videosData.slice(0, 6)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <div className="dashboard-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to SMSRam - Your source for web development tutorials</p>
      </motion.div>

      <motion.div 
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Video}
            value="48"
            label="Total Videos"
            variant="orange"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Code}
            value="32"
            label="Source Codes"
            variant="purple"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Eye}
            value="1.2M"
            label="Total Views"
            variant="cyan"
          />
        </motion.div>
      </motion.div>

      {/* Search Bar Section */}
      <motion.div 
        className="search-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search videos..."
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
          {searchTerm ? `Search Results (${videosToDisplay.length})` : 'Latest Videos'}
        </h2>
        {!searchTerm && (
          <Link href="/dashboard/videos" className="section-link">
            View All <ExternalLink size={16} />
          </Link>
        )}
      </div>

      {/* Videos Grid */}
      <motion.div 
        className="videos-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {videosToDisplay.map((video) => (
          <motion.div key={video.id} variants={itemVariants}>
            <VideoCard video={video} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {searchTerm && videosToDisplay.length === 0 && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Search size={48} className="empty-state-icon" />
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