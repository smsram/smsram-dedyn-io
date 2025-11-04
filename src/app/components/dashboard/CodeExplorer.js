'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronRight,
  File,
  Folder,
  Copy,
  X,
  Download,
  Archive,
  Menu,
  ChevronLeft,
} from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import "../style/CodeExplorer.css";

export default function CodeExplorer({ files }) {
  const [expandedFolders, setExpandedFolders] = useState({})
  const [openTabs, setOpenTabs] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [highlightedLines, setHighlightedLines] = useState([])

  const codeRef = useRef(null)
  const preRef = useRef(null)
  const lineNumbersRef = useRef(null)

  // Detect if mobile (≤900px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getPrismLanguage = (language) => {
    if (!language) return 'javascript'
    const map = {
      javascript: 'javascript',
      js: 'javascript',
      jsx: 'jsx',
      tsx: 'tsx',
      typescript: 'typescript',
      ts: 'typescript',
      css: 'css',
      html: 'markup',
      markup: 'markup',
      xml: 'markup',
      json: 'json',
      python: 'python',
      py: 'python',
      bash: 'bash',
      sh: 'bash',
      sql: 'sql',
    }
    return map[language.toLowerCase()] || language.toLowerCase()
  }

  const getLanguageClass = (language) => {
    const prismLang = getPrismLanguage(language)
    return `language-${prismLang === 'markup' ? 'markup' : prismLang}`
  }

  const escapeHtml = (str) => {
    if (str == null) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const loadPrismAndLanguage = async (lang) => {
    const Prism =
      (await import('prismjs')).default || (await import('prismjs'))

    const langLoaders = {
      javascript: async () => import('prismjs/components/prism-javascript'),
      jsx: async () => import('prismjs/components/prism-jsx'),
      typescript: async () => import('prismjs/components/prism-typescript'),
      tsx: async () => {
        await import('prismjs/components/prism-typescript')
        return import('prismjs/components/prism-jsx')
      },
      python: async () => import('prismjs/components/prism-python'),
      css: async () => import('prismjs/components/prism-css'),
      markup: async () => import('prismjs/components/prism-markup'),
      json: async () => import('prismjs/components/prism-json'),
      bash: async () => import('prismjs/components/prism-bash'),
      sql: async () => import('prismjs/components/prism-sql'),
    }

    const loader = langLoaders[lang]
    try {
      if (loader) {
        await loader()
      } else {
        await langLoaders.javascript()
      }
    } catch (err) {
      // Silent fallback
    }

    return Prism
  }

  // Highlight code with proper timing
  useEffect(() => {
    const activeFile = openTabs.find((t) => t.path === activeTab)
    if (!activeFile) {
      setHighlightedLines([])
      return
    }

    const prismLang = getPrismLanguage(activeFile.language)

    let mounted = true
    
    // Delay for animation
    const timer = setTimeout(() => {
      ;(async () => {
        try {
          const Prism = await loadPrismAndLanguage(prismLang)
          if (!mounted) return

          const langObj =
            Prism.languages[prismLang] ||
            Prism.languages.javascript ||
            Prism.languages.markup
          const raw = activeFile.content ?? ''

          // Highlight with Prism
          const highlighted = Prism.highlight(raw, langObj, prismLang)

          // Split into lines
          const lines = highlighted
            .split(/\r\n|\n/)
            .map((l) => (l === '' ? ' ' : l))

          if (!mounted) return
          setHighlightedLines(lines)
        } catch (err) {
          console.error('Prism error:', err)
          // Fallback
          const fallbackLines = (activeFile.content || '')
            .split(/\r\n|\n/)
            .map((l) => escapeHtml(l) || ' ')
          setHighlightedLines(fallbackLines)
        }
      })()
    }, 50) // 50ms delay for animation

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [activeTab, openTabs])

  const handleCodeScroll = () => {
    if (preRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = preRef.current.scrollTop
    }
  }

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  const openFile = (file) => {
    const tabId = file.path
    if (!openTabs.find((t) => t.path === tabId)) {
      setOpenTabs([...openTabs, file])
    }
    setActiveTab(tabId)
  }

  const closeTab = (path) => {
    const newTabs = openTabs.filter((t) => t.path !== path)
    setOpenTabs(newTabs)
    if (activeTab === path) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].path : null)
    }
  }

  const copyCode = () => {
    const activeFile = openTabs.find((t) => t.path === activeTab)
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadSingleFile = () => {
    const activeFile = openTabs.find((t) => t.path === activeTab)
    if (activeFile) {
      const element = document.createElement('a')
      element.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(activeFile.content)}`
      )
      element.setAttribute('download', activeFile.name)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const downloadAsZip = async () => {
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()

      const addFilesToZip = (items, folder = null) => {
        items.forEach((item) => {
          if (item.type === 'folder' && item.children) {
            const folderPath = folder ? `${folder}/${item.name}` : item.name
            addFilesToZip(item.children, folderPath)
          } else if (item.type === 'file') {
            const filePath = folder ? `${folder}/${item.name}` : item.name
            zip.file(filePath, item.content)
          }
        })
      }

      addFilesToZip(files)
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'source-code.zip')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error creating zip:', error)
    }
  }

  const renderFileTree = (items, depth = 0) => {
    return items.map((item) => {
      const isExpanded = expandedFolders[item.path]

      return (
        <div key={item.path}>
          {item.type === 'folder' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="file-tree-item folder"
                onClick={() => toggleFolder(item.path)}
                style={{ paddingLeft: `${depth * 14}px` }}
                whileHover={{ backgroundColor: 'var(--hover-bg)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="item-icon">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="chevron-icon"
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                  <Folder size={14} />
                </div>
                <span className="item-name">{item.name}</span>
              </motion.div>

              <AnimatePresence>
                {isExpanded && item.children && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderFileTree(item.children, depth + 1)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className={`file-tree-item file ${activeTab === item.path ? 'active' : ''}`}
                onClick={() => {
                  openFile(item)
                  if (isMobile) setSidebarOpen(false)
                }}
                style={{ paddingLeft: `${depth * 14}px` }}
                whileHover={{ backgroundColor: 'var(--hover-bg)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="item-icon">
                  <File size={14} className={`file-icon file-${item.language}`} />
                </div>
                <span className="item-name">{item.name}</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      )
    })
  }

  const activeFile = openTabs.find((t) => t.path === activeTab)
  const lineCount = activeFile ? activeFile.content.split('\n').length : 0

  return (
    <div className="code-explorer-enhanced">
      {/* Left Sidebar - Desktop Only */}
      {!isMobile && (
        <motion.div
          className="code-explorer-sidebar"
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="sidebar-header">
            <h3>📁 Files</h3>
          </div>
          <div className="file-tree">{renderFileTree(files)}</div>
          <div className="sidebar-footer">
            <motion.button
              className="download-zip-btn-desktop"
              onClick={downloadAsZip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Download all files as ZIP"
            >
              <Archive size={16} />
              <span>Download ZIP</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Right Side - Code Viewer */}
      <motion.div
        className="code-explorer-editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Mobile Sidebar - Inside Code Editor Container */}
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              className="mobile-sidebar-overlay-editor"
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="code-explorer-sidebar-mobile"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="sidebar-header">
                <h3>📁 Files</h3>
                <motion.button
                  className="sidebar-close-btn"
                  onClick={() => setSidebarOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div className="file-tree">{renderFileTree(files)}</div>
            </motion.div>
          </>
        )}

        {/* Top Bar - Tabs & Menu */}
        <div className="editor-top-bar">
          {isMobile && (
            <motion.button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Browse files"
            >
              <Menu size={18} />
            </motion.button>
          )}

          {openTabs.length > 0 && (
            <div className="editor-tabs">
              <div className="tabs-scroll-container">
                <AnimatePresence mode="popLayout">
                  {openTabs.map((tab) => (
                    <motion.div
                      key={tab.path}
                      className={`editor-tab ${activeTab === tab.path ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.path)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: 'var(--hover-bg)' }}
                      layout
                    >
                      <File size={13} className={`tab-icon file-${tab.language}`} />
                      <span className="tab-name">{tab.name}</span>
                      <motion.button
                        className="tab-close"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.path)
                        }}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={11} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {isMobile && openTabs.length === 0 && (
            <motion.div
              className="mobile-hint-message"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft size={16} />
              <span>Click to see files</span>
            </motion.div>
          )}
        </div>

        {/* Empty State */}
        {openTabs.length === 0 && !isMobile && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Folder size={64} />
            </motion.div>
            <p>No file selected</p>
          </motion.div>
        )}

        {openTabs.length === 0 && isMobile && (
          <motion.div
            className="empty-state-mobile"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Folder size={64} />
            </motion.div>
            <p>No file selected</p>
          </motion.div>
        )}

        {/* Code Content */}
        <AnimatePresence mode="wait">
          {activeFile && (
            <motion.div
              key={activeFile.path}
              className="editor-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="code-header">
                <div className="code-info">
                  <span className="file-language">
                    {activeFile.language.toUpperCase()}
                  </span>
                  <span className="file-size">{lineCount} lines</span>
                </div>
                <div className="code-actions">
                  <motion.button
                    className="action-icon"
                    onClick={downloadSingleFile}
                    title="Download this file"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Download size={15} />
                  </motion.button>
                  <motion.div className="copy-wrapper" whileHover={{ scale: 1.05 }}>
                    <motion.button
                      className="action-icon copy-btn"
                      onClick={copyCode}
                      title="Copy to clipboard"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy size={15} />
                    </motion.button>
                    <AnimatePresence>
                      {copied && (
                        <motion.span
                          className="copy-tooltip"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              <div className="code-display-wrapper">
                <div className="line-numbers" ref={lineNumbersRef} aria-hidden>
                  {Array.from({ length: highlightedLines.length }, (_, i) => (
                    <div key={i} className="line-number">
                      {i + 1}
                    </div>
                  ))}
                </div>

                <pre
                  className="code-content-wrapper"
                  ref={preRef}
                  onScroll={handleCodeScroll}
                >
                  <code className={getLanguageClass(activeFile.language)}>
                    {highlightedLines.map((lineHtml, idx) => (
                      <div
                        key={idx}
                        className="code-line"
                        dangerouslySetInnerHTML={{ __html: lineHtml }}
                      />
                    ))}
                  </code>
                </pre>
              </div>

              {isMobile && (
                <motion.button
                  className="code-editor-download-zip-btn"
                  onClick={downloadAsZip}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Download all files as ZIP"
                >
                  <Archive size={16} />
                  <span>Download ZIP</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {openTabs.length === 0 && isMobile && (
          <motion.button
            className="code-editor-download-zip-btn-empty"
            onClick={downloadAsZip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Download all files as ZIP"
          >
            <Archive size={16} />
            <span>Download ZIP</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
