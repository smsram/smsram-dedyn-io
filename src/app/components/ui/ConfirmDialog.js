'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { Play, Code, Trash2, Download, AlertTriangle, Check, Folder } from 'lucide-react'

export default function ConfirmDialog({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {},
  icon = 'warning',
  theme = 'danger'
}) {
  const [localOpen, setLocalOpen] = useState(false)
  
  // Sync local state with prop
  useEffect(() => {
    setLocalOpen(isOpen)
  }, [isOpen])

  if (!localOpen) return null

  const icons = {
    play: Play,
    code: Code,
    delete: Trash2,
    download: Download,
    warning: AlertTriangle,
    success: Check,
    folder: Folder
  }

  const getThemeColors = (theme) => {
    switch (theme) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
          text: 'var(--accent-green)'
        }
      case 'warning':
        return {
          bg: 'rgba(251, 191, 36, 0.1)',
          border: 'rgba(251, 191, 36, 0.3)',
          text: 'var(--accent-orange)'
        }
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
          text: 'var(--accent-blue)'
        }
      default:
      case 'danger':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: '#ef4444'
        }
    }
  }

  const themeColors = getThemeColors(theme)
  const Icon = icons[icon] || AlertTriangle

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)'
  }

  const modalStyle = {
    background: 'var(--bg-secondary)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }

  const headerStyle = {
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.1)'
  }

  const bodyStyle = {
    padding: '1.5rem',
    color: 'var(--text-secondary)'
  }

  const footerStyle = {
    padding: '1rem 1.5rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  }

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    minWidth: '80px',
    justifyContent: 'center'
  }

  const confirmBtnStyle = {
    background: themeColors.text,
    color: 'white',
    borderColor: themeColors.text
  }

  const cancelBtnStyle = {
    background: 'transparent',
    color: 'var(--text-primary)',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  }

  return (
    <motion.div
      style={overlayStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onCancel()}
    >
      <motion.div
        style={modalStyle}
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon size={24} style={{ color: themeColors.text, flexShrink: 0 }} />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={() => onCancel()}
            style={{
              background: 'none',
              border: 'none',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 1)}
            onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
          >
            <X size={20} />
          </button>
        </div>

        <div style={bodyStyle}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {message}
            </p>
            
            {theme === 'warning' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '1rem',
                background: 'rgba(251, 191, 36, 0.1)',
                borderLeft: '4px solid var(--accent-orange)',
                borderRadius: '4px',
                color: 'var(--accent-orange)',
                fontWeight: '500'
              }}>
                <AlertTriangle size={20} />
                <span>This action cannot be undone!</span>
              </div>
            )}

            {theme === 'danger' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '4px solid #ef4444',
                borderRadius: '4px',
                color: '#ef4444',
                fontWeight: '500'
              }}>
                <AlertTriangle size={20} />
                <span>This will permanently delete all associated data.</span>
              </div>
            )}
          </div>
        </div>

        <div style={footerStyle}>
          <button
            style={{
              ...buttonStyle,
              ...cancelBtnStyle,
              marginRight: '0.5rem'
            }}
            onClick={() => onCancel()}
          >
            {cancelText}
          </button>
          
          <button
            style={{
              ...buttonStyle,
              ...confirmBtnStyle
            }}
            onClick={() => {
              onConfirm()
              onCancel()
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
