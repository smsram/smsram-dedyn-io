'use client'

import { createContext, useContext, useState } from 'react'
import Notification from './Notification'

const NotificationContext = createContext()

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = ({ title, message, type = 'info', duration = 5000 }) => {
    const id = Date.now()
    const notification = { id, title, message, type, duration }
    
    setNotifications(prev => [...prev, notification])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      
      {/* Fixed notification container at top */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '420px',
          width: '100%',
          pointerEvents: 'none'
        }}
      >
        {notifications.map((notif) => (
          <div key={notif.id} style={{ pointerEvents: 'auto' }}>
            <Notification
              title={notif.title}
              message={notif.message}
              type={notif.type}
              duration={0} // Handled by context
              onClose={() => removeNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
