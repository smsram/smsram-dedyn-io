'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'

export default function SourceCodeCard({ code }) {
  const [formattedDate, setFormattedDate] = useState('')

  // Format date on client only to avoid hydration mismatch
  useEffect(() => {
    const date = new Date(code.lastUpdated)
    setFormattedDate(date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }))
  }, [code.lastUpdated])

  return (
    <motion.div 
      className="sourcecode-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Section */}
      <div className="sourcecode-header">
        <Link href={`/dashboard/source-codes/${code.id}`} className="sourcecode-title-link">
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
        {code.technologies.map((tech, index) => (
          <motion.span 
            key={index} 
            className="tech-tag"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {tech}
          </motion.span>
        ))}
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
        <Link href={`/dashboard/source-codes/${code.id}`} className="action-btn view-btn">
          View Details
        </Link>
        {code.githubUrl && (
          <motion.a 
            href={code.githubUrl} 
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
