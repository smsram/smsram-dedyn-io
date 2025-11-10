'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Github } from 'lucide-react'
import Link from 'next/link'

export default function SourceCodeCard({ code }) {
  const [formattedDate, setFormattedDate] = useState('')
  const [technologies, setTechnologies] = useState([])

  // Format date on client only to avoid hydration mismatch
  useEffect(() => {
    if (code.updated_at) {
      const date = new Date(code.updated_at)
      setFormattedDate(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }))
    }
  }, [code.updated_at])

  // Safely parse technologies JSON - handles all formats
  useEffect(() => {
    if (!code.technologies) {
      setTechnologies([])
      return
    }

    try {
      // If it's already an array, use it directly
      if (Array.isArray(code.technologies)) {
        setTechnologies(code.technologies)
        return
      }

      // If it's a string, try to parse as JSON
      if (typeof code.technologies === 'string') {
        // Try JSON parse first
        try {
          const parsed = JSON.parse(code.technologies)
          setTechnologies(Array.isArray(parsed) ? parsed : [String(parsed)])
          return
        } catch {
          // If JSON parse fails, try comma-separated fallback
          const split = code.technologies.split(',').map(tech => tech.trim()).filter(Boolean)
          setTechnologies(split)
          return
        }
      }

      // If it's an object but not array, convert to array
      setTechnologies([String(code.technologies)])
    } catch (error) {
      console.warn('Failed to parse technologies:', code.technologies, error)
      setTechnologies([])
    }
  }, [code.technologies])

  return (
    <motion.div 
      className="sourcecode-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Section */}
      <div className="sourcecode-header">
        <Link 
          href={`/dashboard/source-codes/${code.id}`} 
          className="sourcecode-title-link"
        >
          <motion.h3 
            className="sourcecode-title"
            whileHover={{ color: 'var(--accent-orange)' }}
          >
            {code.title}
          </motion.h3>
        </Link>
        <p className="sourcecode-description">{code.description}</p>
      </div>

      {/* Tech Tags */}
      <div className="sourcecode-tech">
        {technologies.length > 0 ? (
          technologies.slice(0, 5).map((tech, index) => (
            <motion.span 
              key={index} 
              className="tech-tag"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {tech}
            </motion.span>
          ))
        ) : (
          <div className="tech-placeholder">
            No technologies listed
          </div>
        )}
        {technologies.length > 5 && (
          <span className="tech-tag tech-tag-more">
            +{technologies.length - 5}
          </span>
        )}
      </div>

      {/* Meta Information */}
      <div className="sourcecode-meta">
        {formattedDate && (
          <span className="meta-item">
            Updated {formattedDate}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="sourcecode-actions">
        <Link 
          href={`/dashboard/source-codes/${code.id}`} 
          className="action-btn view-btn"
        >
          View Details
        </Link>
        {code.github_url && (
          <motion.a 
            href={code.github_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-btn github-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View on GitHub"
            aria-label="View source code on GitHub"
          >
            <Github size={16} />
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}
