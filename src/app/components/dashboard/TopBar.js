'use client'

import { useState } from 'react'
import { Moon, Sun, Menu, X } from 'lucide-react'

export default function TopBar({ onMenuToggle, isSidebarOpen }) {
  const [theme, setTheme] = useState('dark')

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleMenuClick = () => {
    onMenuToggle?.(!isSidebarOpen)
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Burger Menu / X Toggle */}
        <button 
          className="menu-toggle"
          onClick={handleMenuClick}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          type="button"
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* SMSRam logo - Desktop on left, Mobile on right of burger */}
        <h1 className="topbar-logo">SMSRam</h1>

        {/* Mobile logo - Right of burger */}
        <h1 className="topbar-mobile-logo">SMSRam</h1>
      </div>

      <div className="topbar-right">
        {/* Theme Switcher */}
        <button 
          className="topbar-icon theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          type="button"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  )
}
