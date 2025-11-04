'use client'

import { useState, useCallback } from 'react'
import './style.css'
import TopBar from '../components/dashboard/TopBar'
import Sidebar from '../components/dashboard/Sidebar'

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleMenuToggle = useCallback((isOpen) => {
    setIsSidebarOpen(isOpen)
    if (isOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }, [])

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false)
    document.body.classList.remove('no-scroll')
  }, [])

  return (
    <div className="layout-container">
      <TopBar onMenuToggle={handleMenuToggle} isSidebarOpen={isSidebarOpen} />
      <div className="layout-content">
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}