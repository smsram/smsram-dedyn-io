'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Search, Briefcase, RefreshCw, Filter } from 'lucide-react'
import ProjectCard from '@/app/components/dashboard/ProjectCard'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProjects = async (query = '', status = 'all') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (status !== 'all') params.append('status', status)

      const url = `${BASE_URL}/dashboard/projects${params.toString() ? `?${params}` : ''}`
      
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load projects')
      }

      setProjects(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err.message || 'Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchProjects()
  }, [])

  const filteredProjects = useMemo(() => {
    if (!searchTerm && filterStatus === 'all') return projects
    
    const term = searchTerm.toLowerCase()
    return projects.filter(project => {
      // Check search term
      const matchesSearch = !searchTerm || (
        (project.title || '').toLowerCase().includes(term) ||
        (project.description || '').toLowerCase().includes(term) ||
        (Array.isArray(project.technologies) 
          ? project.technologies.some(tech => (tech || '').toLowerCase().includes(term))
          : false)
      )
      
      // Check status filter
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [projects, searchTerm, filterStatus])

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

  const statusOptions = ['all', 'completed', 'in-progress', 'archived']

  return (
    <div className="projects-page">
      {/* Page Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">My Projects</h1>
        <p className="page-subtitle">Explore all my portfolio projects and contributions</p>
      </motion.div>

      {/* Search & Filter Section */}
      <motion.div 
        className="search-filter-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Search Bar */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by title, description, or technology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchProjects(searchTerm, filterStatus)
              }
            }}
          />
          {searchTerm && (
            <motion.button
              className="search-clear"
              onClick={() => {
                setSearchTerm('')
                fetchProjects('', filterStatus)
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
            onClick={() => fetchProjects(searchTerm, filterStatus)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <Filter size={20} className="filter-icon" />
          {statusOptions.map(status => (
            <motion.button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus(status)
                fetchProjects(searchTerm, status)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'all' ? 'All' : status.replace('-', ' ').toUpperCase()}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {searchTerm ? `Results (${filteredProjects.length})` : 'All Projects'}
        </h2>
        <span className="result-count">
          {loading ? 'Loading...' : `${filteredProjects.length} available`}
        </span>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => fetchProjects(searchTerm, filterStatus)}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <LoadingSpinner message="Loading projects..." />
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <motion.div 
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProjects.map((project) => (
            <motion.div 
              key={project.id}
              variants={itemVariants}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Briefcase size={48} className="empty-state-icon" />
          <p className="empty-state-title">No projects found</p>
          <p className="empty-state-subtitle">
            {searchTerm 
              ? 'Try searching with different keywords or technologies'
              : 'No projects match the selected filters'}
          </p>
          <motion.button
            className="empty-state-btn"
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('all')
              fetchProjects('', 'all')
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
