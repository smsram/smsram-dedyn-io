'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  CheckCircle, AlertTriangle, X, 
  Info, Download, Play, Code 
} from 'lucide-react'

export default function Notification({
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose = () => {},
  showIcon = true
}) {
  const [visible, setVisible] = useState(true)

  // Auto-hide after duration
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        // Callback after animation
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  const getTypeData = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'var(--accent-green)',
          text: 'var(--accent-green)'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          bg: 'rgba(251, 191, 36, 0.15)',
          border: 'var(--accent-orange)',
          text: 'var(--accent-orange)'
        }
      case 'error':
        return {
          icon: AlertTriangle,
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#ef4444',
          text: '#ef4444'
        }
      case 'info':
      default:
        return {
          icon: Info,
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'var(--accent-blue)',
          text: 'var(--accent-blue)'
        }
    }
  }

  const typeData = getTypeData(type)
  const Icon = typeData.icon

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        background: typeData.bg,
        border: `2px solid ${typeData.border}`,
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        margin: '0 0 1rem 0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
      initial={{ 
        y: -50, 
        opacity: 0,
        scale: 0.95
      }}
      animate={{
        y: 0,
        opacity: 1,
        scale: 1
      }}
      exit={{
        y: -50,
        opacity: 0,
        scale: 0.95
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut'
      }}
    >
      {showIcon && (
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            flexShrink: 0,
            background: `${typeData.border}20`,
            borderRadius: '8px',
            marginRight: '0.5rem'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon 
            size={20} 
            style={{ 
              color: typeData.text 
            }} 
          />
        </motion.div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 0.25rem 0',
            lineHeight: '1.3'
          }}>
            {title}
          </div>
        )}
        
        {message && (
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            wordBreak: 'break-word'
          }}>
            {message}
          </div>
        )}
      </div>

      <motion.button
        onClick={() => {
          setVisible(false)
          setTimeout(onClose, 300)
        }}
        style={{
          background: 'none',
          border: 'none',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          opacity: 0.7,
          transition: 'all 0.2s',
          flexShrink: 0,
          marginLeft: '0.5rem'
        }}
        whileHover={{
          background: 'rgba(255, 255, 255, 0.1)',
          opacity: 1
        }}
        whileTap={{
          scale: 0.9
        }}
        title="Close notification"
      >
        <X size={16} />
      </motion.button>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: `${typeData.border}40`,
            overflow: 'hidden'
          }}
          initial={{ width: '100%' }}
          animate={{ 
            width: 0 
          }}
          transition={{
            duration: duration / 1000,
            ease: 'linear'
          }}
        />
      )}
    </motion.div>
  )
}
