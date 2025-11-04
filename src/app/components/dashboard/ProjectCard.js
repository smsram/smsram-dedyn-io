'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink, Github, Code2, Star, Calendar } from 'lucide-react'
import Link from 'next/link'
import "../style/cards.css";

export default function ProjectCard({ project }) {
  const [isHovering, setIsHovering] = useState(false)

  const cardVariants = {
    rest: { y: 0 },
    hover: { y: -12 }
  }

  const shadowVariants = {
    rest: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
    hover: { boxShadow: '0 16px 40px rgba(0, 212, 255, 0.2)' }
  }

  const previewVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 }
  }

  const overlayVariants = {
    rest: { opacity: 0 },
    hover: { opacity: 1 }
  }

  const contentVariants = {
    rest: { y: 0, opacity: 1 },
    hover: { y: -8, opacity: 0.9 }
  }

  // Count available buttons
  const availableButtons = [project.liveUrl, project.githubUrl, project.sourceCodeId].filter(Boolean).length

  const handlePreviewClick = () => {
    if (project.liveUrl) {
      window.open(project.liveUrl, '_blank')
    }
  }

  return (
    <motion.div
      className="project-card"
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={shadowVariants}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Website Preview Section - Clickable */}
      <motion.div
        className={`project-preview ${project.liveUrl ? 'clickable' : ''}`}
        variants={previewVariants}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={handlePreviewClick}
        role={project.liveUrl ? 'button' : undefined}
        tabIndex={project.liveUrl ? 0 : undefined}
        onKeyDown={(e) => {
          if (project.liveUrl && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handlePreviewClick()
          }
        }}
      >
        {/* Preview Background - Animated Grid */}
        <div className="preview-grid">
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item"></div>
        </div>

        {/* Animated Lines */}
        <motion.div className="preview-lines">
          <motion.div
            className="line line-1"
            animate={{ scaleX: isHovering ? 1 : 0.7 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="line line-2"
            animate={{ scaleX: isHovering ? 1 : 0.8 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
          <motion.div
            className="line line-3"
            animate={{ scaleX: isHovering ? 1 : 0.6 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        </motion.div>

        {/* Preview Overlay */}
        <motion.div
          className="preview-overlay"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="preview-icon"
            animate={{ scale: isHovering ? 1 : 0.8, opacity: isHovering ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            <ExternalLink size={32} />
          </motion.div>
          <p>Visit Project</p>
        </motion.div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        className="project-content"
        variants={contentVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Project Header */}
        <div className="project-header">
          <div className="project-title-section">
            <h3 className="project-title">{project.title}</h3>
            {project.featured && (
              <motion.div
                className="project-badge"
                animate={{ scale: isHovering ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Star size={12} />
              </motion.div>
            )}
          </div>
          <motion.div
            className="project-year"
            animate={{ color: isHovering ? 'var(--accent-cyan)' : 'var(--text-tertiary)' }}
            transition={{ duration: 0.2 }}
          >
            <Calendar size={14} />
            <span>{project.year}</span>
          </motion.div>
        </div>

        {/* Project Description */}
        <p className="project-description">{project.description}</p>

        {/* Technologies */}
        <div className="project-techs">
          {project.technologies.slice(0, 5).map((tech, idx) => (
            <motion.span
              key={idx}
              className="tech-badge"
              animate={{
                y: isHovering ? -2 : 0,
                color: isHovering ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              {tech}
            </motion.span>
          ))}
          {project.technologies.length > 5 && (
            <span className="tech-badge tech-more">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>

        {/* Actions - Only show if buttons exist */}
        {availableButtons > 0 && (
          <div className={`project-actions project-actions-${availableButtons}`}>
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-btn project-btn-primary"
                animate={{
                  scale: isHovering ? 1.05 : 1,
                  boxShadow: isHovering 
                    ? '0 8px 20px rgba(0, 212, 255, 0.3)' 
                    : '0 2px 8px rgba(0, 212, 255, 0.1)'
                }}
                transition={{ duration: 0.2 }}
                whileTap={{ scale: 0.95 }}
                title="Open Live Project"
              >
                <ExternalLink size={14} />
                <span>Open</span>
              </motion.a>
            )}

            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-btn project-btn-secondary"
                animate={{
                  scale: isHovering ? 1.05 : 1,
                  boxShadow: isHovering 
                    ? '0 8px 20px rgba(147, 112, 219, 0.3)' 
                    : '0 2px 8px rgba(147, 112, 219, 0.1)'
                }}
                transition={{ duration: 0.2, delay: 0.05 }}
                whileTap={{ scale: 0.95 }}
                title="View on GitHub"
              >
                <Github size={14} />
                <span>GitHub</span>
              </motion.a>
            )}

            {project.sourceCodeId && (
              <Link href={`/dashboard/source-codes?id=${project.sourceCodeId}`}>
                <motion.button
                  className="project-btn project-btn-code"
                  animate={{
                    scale: isHovering ? 1.05 : 1,
                    boxShadow: isHovering 
                      ? '0 8px 20px rgba(255, 107, 53, 0.3)' 
                      : '0 2px 8px rgba(255, 107, 53, 0.1)'
                  }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="View Source Code"
                >
                  <Code2 size={14} />
                  <span>Code</span>
                </motion.button>
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
