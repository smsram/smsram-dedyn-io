'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Search, Code } from 'lucide-react'
import { sourceCodesData } from '@/data/mockData'
import SourceCodeCard from '@/app/components/dashboard/SourceCodeCard'

export default function SourceCodes() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCodes = sourceCodesData.filter(code =>
    code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="sourcecodes-page">
      {/* Page Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">Source Codes</h1>
        <p className="page-subtitle">Download complete source code for our video tutorials</p>
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
      </motion.div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {searchTerm ? `Results (${filteredCodes.length})` : 'All Source Codes'}
        </h2>
        <span className="result-count">{filteredCodes.length} available</span>
      </div>

      {/* Source Codes Grid */}
      <motion.div 
        className="sourcecodes-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredCodes.map((code) => (
          <motion.div key={code.id} variants={itemVariants}>
            <SourceCodeCard code={code} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredCodes.length === 0 && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Code size={48} className="empty-state-icon" />
          <p className="empty-state-title">No source codes found</p>
          <p className="empty-state-subtitle">Try searching with different keywords or technologies</p>
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
