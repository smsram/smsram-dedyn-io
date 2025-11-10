'use client'

import { motion } from 'motion/react'
import { Play, Code, Eye, Folder, Film, Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = "Loading videos...", size = "large" }) {
  const isSmall = size === 'small'

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '1.5rem',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        fontWeight: '500'
      }}
    >
      <motion.div 
        style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          margin: '0 auto 1rem',
        }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: '0%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            color: 'var(--accent-cyan)',
            animationDelay: '0s'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0 }}
        >
          <Play size={isSmall ? 20 : 24} />
        </motion.div>
        
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '100%',
            transform: 'translate(-50%, -50%)',
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            color: 'var(--accent-green)',
            animationDelay: '0.1s'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Code size={isSmall ? 20 : 24} />
        </motion.div>
        
        <motion.div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            color: 'var(--accent-purple)',
            animationDelay: '0.2s'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Eye size={isSmall ? 20 : 24} />
        </motion.div>
        
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '0%',
            transform: 'translate(-50%, -50%)',
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            color: 'var(--accent-orange)',
            animationDelay: '0.3s'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Folder size={isSmall ? 20 : 24} />
        </motion.div>
        
        <motion.div
          style={{
            position: 'absolute',
            top: '0%',
            left: '0%',
            transform: 'translate(-50%, -50%)',
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            color: 'var(--accent-pink)',
            animationDelay: '0.4s'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Film size={isSmall ? 20 : 24} />
        </motion.div>
        
        <motion.div
          style={{
            position: 'absolute',
            top: '0%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isSmall ? '20px' : '24px',
            height: isSmall ? '20px' : '24px',
            color: 'var(--accent-cyan)',
            animationDelay: '0.5s'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Loader2 size={isSmall ? 20 : 24} />
        </motion.div>
      </motion.div>

      <motion.div 
        style={{
          color: 'var(--text-secondary)',
          fontSize: isSmall ? '0.95rem' : '1.1rem',
          fontWeight: '500',
          margin: '0'
        }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {message}
      </motion.div>

      <motion.div 
        style={{
          width: '200px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '1rem'
        }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div 
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-green) 25%, var(--accent-purple) 50%, var(--accent-orange) 75%, var(--accent-pink) 100%)',
            borderRadius: '2px'
          }}
          animate={{ x: [0, '100%'] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />
      </motion.div>
    </div>
  )
}
