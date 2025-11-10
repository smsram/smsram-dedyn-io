'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Search, Code, RefreshCw } from 'lucide-react'
import SourceCodeCard from '@/app/components/dashboard/SourceCodeCard'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function SourceCodes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceCodes, setSourceCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSourceCodes = async (query = '') => {
    setLoading(true)
    setError('')
    try {
      const url = query
        ? `${BASE_URL}/dashboard/source-codes?search=${encodeURIComponent(query)}`
        : `${BASE_URL}/dashboard/source-codes`
      
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load source codes')
      }

      setSourceCodes(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      console.error('Error fetching source codes:', err)
      setError(err.message || 'Failed to load source codes')
      setSourceCodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchSourceCodes()
  }, [])

  const filteredCodes = useMemo(() => {
    if (!searchTerm) return sourceCodes
    
    const term = searchTerm.toLowerCase()
    return sourceCodes.filter(code => {
      // Check title and description
      const matchesBasic =
        (code.title || '').toLowerCase().includes(term) ||
        (code.description || '').toLowerCase().includes(term)
      
      // Check technologies (JSON string or array)
      try {
        const technologies = typeof code.technologies === 'string' 
          ? JSON.parse(code.technologies || '[]')
          : code.technologies || []
        
        const techTerm = Array.isArray(technologies)
          ? technologies.some(tech => (tech || '').toLowerCase().includes(term))
          : String(technologies).toLowerCase().includes(term)
        
        return matchesBasic || techTerm
      } catch {
        return matchesBasic
      }
    })
  }, [sourceCodes, searchTerm])

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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchSourceCodes(searchTerm)
              }
            }}
          />
          {searchTerm && (
            <motion.button
              className="search-clear"
              onClick={() => {
                setSearchTerm('')
                fetchSourceCodes('')
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
            onClick={() => fetchSourceCodes(searchTerm)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {searchTerm ? `Results (${filteredCodes.length})` : 'All Source Codes'}
        </h2>
        <span className="result-count">
          {loading ? 'Loading...' : `${filteredCodes.length} available`}
        </span>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => fetchSourceCodes(searchTerm)}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <LoadingSpinner message="Loading source codes..." />
      )}

      {/* Source Codes Grid */}
      {!loading && !error && (
        <motion.div 
          className="sourcecodes-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCodes.map((code) => (
            <motion.div 
              key={code.id}
              variants={itemVariants}
            >
              <SourceCodeCard code={code} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCodes.length === 0 && (
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
            onClick={() => {
              setSearchTerm('')
              fetchSourceCodes('')
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
