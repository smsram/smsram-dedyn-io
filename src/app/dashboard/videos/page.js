'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Search, Film, RotateCw } from 'lucide-react'
import VideoCard from '@/app/components/dashboard/VideoCard'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchVideos = async (query = '') => {
    setLoading(true)
    setError('')
    try {
      const url = query
        ? `${BASE_URL}/dashboard/videos?search=${encodeURIComponent(query)}`
        : `${BASE_URL}/dashboard/videos`
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load videos')
      }

      setVideos(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load videos')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load
    fetchVideos()
  }, [])

  const filteredVideos = useMemo(() => {
    if (!searchTerm) return videos
    const term = searchTerm.toLowerCase()
    return videos.filter(
      (v) =>
        (v.title || '').toLowerCase().includes(term) ||
        (v.description || '').toLowerCase().includes(term)
    )
  }, [videos, searchTerm])

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
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchVideos(searchTerm)
            }}
          />
          {searchTerm && (
            <motion.button
              className="search-clear"
              onClick={() => {
                setSearchTerm('')
                fetchVideos('')
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              title="Clear search"
            >
              ✕
            </motion.button>
          )}
          <motion.button
            className="search-refresh"
            onClick={() => fetchVideos(searchTerm)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            title="Refresh"
          >
            <RotateCw size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {searchTerm ? `Results (${filteredVideos.length})` : 'All Videos'}
        </h2>
        <span className="result-count">
          {loading ? 'Loading...' : `${filteredVideos.length} available`}
        </span>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => fetchVideos(searchTerm)}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
        >
          <LoadingSpinner message="Loading videos..." />
        </motion.div>
      )}

      {/* Videos Grid */}
      {!loading && !error && (
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
      )}

      {/* Empty State */}
      {!loading && !error && filteredVideos.length === 0 && (
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
            onClick={() => {
              setSearchTerm('')
              fetchVideos('')
            }}
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
