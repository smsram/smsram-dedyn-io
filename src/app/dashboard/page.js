'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Eye, Code, ExternalLink, Video } from 'lucide-react'
import Link from 'next/link'
import StatCard from '../components/dashboard/StatCard'
import VideoCard from '../components/dashboard/VideoCard'
import SourceCodeCard from '../components/dashboard/SourceCodeCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function Dashboard() {
  const [stats, setStats] = useState({ videos: 0, sourceCodes: 0, totalViews: 0 })
  const [latestVideos, setLatestVideos] = useState([])
  const [latestSourceCodes, setLatestSourceCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Fetch stats and latest content in parallel
        const [statsRes, latestRes] = await Promise.all([
          fetch(`${BASE_URL}/dashboard/stats`),
          fetch(`${BASE_URL}/dashboard/latest`),
        ])

        const statsData = await statsRes.json()
        const latestData = await latestRes.json()

        if (!statsRes.ok || !statsData.success) {
          throw new Error('Failed to fetch statistics')
        }

        if (!latestRes.ok || !latestData.success) {
          throw new Error('Failed to fetch latest content')
        }

        setStats(statsData.data)
        setLatestVideos(latestData.data.videos)
        setLatestSourceCodes(latestData.data.sourceCodes)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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

  // Format views count
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <h2>Failed to load dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
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

      {/* Stats Grid */}
      <motion.div 
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Video}
            value={stats.videos.toString()}
            label="Total Videos"
            variant="orange"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Code}
            value={stats.sourceCodes.toString()}
            label="Source Codes"
            variant="purple"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard 
            icon={Eye}
            value={formatViews(stats.totalViews)}
            label="Total Views"
            variant="cyan"
          />
        </motion.div>
      </motion.div>

      {/* Latest Videos Section */}
      <div className="section-header">
        <h2 className="section-title">Latest Videos</h2>
        <Link href="/dashboard/videos" className="section-link">
          View All <ExternalLink size={16} />
        </Link>
      </div>

      <motion.div 
        className="videos-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {latestVideos.map((video) => (
          <motion.div key={video.id} variants={itemVariants}>
            <VideoCard video={video} />
          </motion.div>
        ))}
      </motion.div>

      {latestVideos.length === 0 && (
        <div className="empty-state">
          <Video size={48} className="empty-state-icon" />
          <p className="empty-state-title">No videos yet</p>
          <p className="empty-state-subtitle">Check back later for new content</p>
        </div>
      )}

      {/* Latest Source Codes Section */}
      <div className="section-header" style={{ marginTop: '3rem' }}>
        <h2 className="section-title">Latest Source Codes</h2>
        <Link href="/dashboard/source-codes" className="section-link">
          View All <ExternalLink size={16} />
        </Link>
      </div>

      <motion.div 
        className="sourcecodes-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {latestSourceCodes.map((code) => (
          <motion.div key={code.id} variants={itemVariants}>
            <SourceCodeCard code={code} />
          </motion.div>
        ))}
      </motion.div>

      {latestSourceCodes.length === 0 && (
        <div className="empty-state">
          <Code size={48} className="empty-state-icon" />
          <p className="empty-state-title">No source codes yet</p>
          <p className="empty-state-subtitle">Check back later for new content</p>
        </div>
      )}
    </div>
  )
}
