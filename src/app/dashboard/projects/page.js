'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Search, Briefcase, Filter } from 'lucide-react'
import { projectsData } from '@/data/mockData'
import ProjectCard from '@/app/components/dashboard/ProjectCard'

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => 
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

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

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <Filter size={20} className="filter-icon" />
          {statusOptions.map(status => (
            <motion.button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
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
        <span className="result-count">{filteredProjects.length} available</span>
      </div>

      {/* Projects Grid */}
      <motion.div 
        className="projects-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredProjects.map((project) => (
          <motion.div key={project.id} variants={itemVariants}>
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
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
