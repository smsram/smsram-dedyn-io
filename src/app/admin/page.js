'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  Video, 
  Code, 
  Briefcase, 
  FolderTree,
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Folder
} from 'lucide-react'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('videos')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState([
    { label: 'Total Videos', value: 0, icon: Video, color: 'orange' },
    { label: 'Source Codes', value: 0, icon: Code, color: 'cyan' },
    { label: 'Projects', value: 0, icon: Briefcase, color: 'purple' },
    { label: 'Root Folders', value: 0, icon: FolderTree, color: 'green' },
  ])

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'source-codes', label: 'Source Codes', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'files-folders', label: 'Files & Folders', icon: FolderTree },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [videosRes, sourceCodesRes, projectsRes, filesRes] = await Promise.all([
        fetch(`${BASE_URL}/create/videos`),
        fetch(`${BASE_URL}/create/source-codes`),
        fetch(`${BASE_URL}/create/projects`),
        fetch(`${BASE_URL}/create/files-folders?is_root=true`) // Only count root folders
      ])

      const [videos, sourceCodes, projects, files] = await Promise.all([
        videosRes.json(),
        sourceCodesRes.json(),
        projectsRes.json(),
        filesRes.json()
      ])

      setStats([
        { label: 'Total Videos', value: videos.count || 0, icon: Video, color: 'orange' },
        { label: 'Source Codes', value: sourceCodes.count || 0, icon: Code, color: 'cyan' },
        { label: 'Projects', value: projects.count || 0, icon: Briefcase, color: 'purple' },
        { label: 'Root Folders', value: files.count || 0, icon: FolderTree, color: 'green' },
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <motion.div 
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-header-content">
          <div className="admin-title-section">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage your content</p>
          </div>
          <Link href="/dashboard">
            <motion.button
              className="admin-btn admin-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye size={18} />
              <span>View Site</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`admin-stat-card stat-${stat.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="admin-stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="admin-stat-info">
              <p className="admin-stat-value">{stat.value}</p>
              <p className="admin-stat-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <motion.div 
        className="admin-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content Section */}
      <motion.div
        className="admin-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Search & Create */}
        <div className="admin-content-header">
          <div className="admin-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <motion.button
                className="admin-search-clear"
                onClick={() => setSearchTerm('')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕
              </motion.button>
            )}
          </div>
          <Link href={`/admin/create/${activeTab}`}>
            <motion.button
              className="admin-btn admin-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>Create New</span>
            </motion.button>
          </Link>
        </div>

        {/* Content Tables */}
        {activeTab === 'videos' && <VideosTable searchTerm={searchTerm} />}
        {activeTab === 'source-codes' && <SourceCodesTable searchTerm={searchTerm} />}
        {activeTab === 'projects' && <ProjectsTable searchTerm={searchTerm} />}
        {activeTab === 'files-folders' && <FilesFoldersTable searchTerm={searchTerm} onUpdate={fetchStats} />}
      </motion.div>
    </div>
  )
}

// Videos Table Component
function VideosTable({ searchTerm }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/videos`)
      const data = await response.json()
      setVideos(data.data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`${BASE_URL}/create/video/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setVideos(videos.filter(v => v.id !== id))
        alert('Video deleted successfully')
      } else {
        alert('Error deleting video')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting video')
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="admin-loading">Loading videos...</div>
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Views</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVideos.map((video, index) => (
            <motion.tr
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <td className="admin-table-title">{video.title}</td>
              <td>{video.views || 0}</td>
              <td>{video.category || '-'}</td>
              <td>
                <div className="admin-table-actions">
                  <Link href={`/admin/edit/videos/${video.id}`}>
                    <motion.button
                      className="admin-action-btn edit"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </motion.button>
                  </Link>
                  <motion.button
                    className="admin-action-btn delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {filteredVideos.length === 0 && (
        <div className="admin-empty-state">
          <Video size={48} />
          <p className="admin-empty-state-title">No videos found</p>
          <p className="admin-empty-state-subtitle">
            {searchTerm ? 'Try a different search term' : 'Create your first video to get started'}
          </p>
        </div>
      )}
    </div>
  )
}

// Source Codes Table Component
function SourceCodesTable({ searchTerm }) {
  const [sourceCodes, setSourceCodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSourceCodes()
  }, [])

  const fetchSourceCodes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/source-codes`)
      const data = await response.json()
      setSourceCodes(data.data || [])
    } catch (error) {
      console.error('Error fetching source codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this source code?')) return

    try {
      const response = await fetch(`${BASE_URL}/create/source-code/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSourceCodes(sourceCodes.filter(sc => sc.id !== id))
        alert('Source code deleted successfully')
      } else {
        alert('Error deleting source code')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting source code')
    }
  }

  const filteredCodes = sourceCodes.filter(code =>
    code.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="admin-loading">Loading source codes...</div>
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Files</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCodes.map((code, index) => (
            <motion.tr
              key={code.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <td className="admin-table-title">{code.title}</td>
              <td>{code.file_count || 0}</td>
              <td>{code.total_size || '-'}</td>
              <td>
                <div className="admin-table-actions">
                  <Link href={`/admin/edit/source-codes/${code.id}`}>
                    <motion.button
                      className="admin-action-btn edit"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </motion.button>
                  </Link>
                  <motion.button
                    className="admin-action-btn delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                    onClick={() => handleDelete(code.id)}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {filteredCodes.length === 0 && (
        <div className="admin-empty-state">
          <Code size={48} />
          <p className="admin-empty-state-title">No source codes found</p>
          <p className="admin-empty-state-subtitle">
            {searchTerm ? 'Try a different search term' : 'Create your first source code to get started'}
          </p>
        </div>
      )}
    </div>
  )
}

// Projects Table Component
function ProjectsTable({ searchTerm }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/projects`)
      const data = await response.json()
      setProjects(data.data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`${BASE_URL}/create/project/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id))
        alert('Project deleted successfully')
      } else {
        alert('Error deleting project')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting project')
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="admin-loading">Loading projects...</div>
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project, index) => (
            <motion.tr
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <td className="admin-table-title">{project.title}</td>
              <td>{project.year}</td>
              <td>
                <span className={`admin-status-badge status-${project.status}`}>
                  {project.status}
                </span>
              </td>
              <td>
                <div className="admin-table-actions">
                  <Link href={`/admin/edit/projects/${project.id}`}>
                    <motion.button
                      className="admin-action-btn edit"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </motion.button>
                  </Link>
                  <motion.button
                    className="admin-action-btn delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {filteredProjects.length === 0 && (
        <div className="admin-empty-state">
          <Briefcase size={48} />
          <p className="admin-empty-state-title">No projects found</p>
          <p className="admin-empty-state-subtitle">
            {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
        </div>
      )}
    </div>
  )
}

// Files & Folders Table Component (UPDATED - Root Folders Only)
function FilesFoldersTable({ searchTerm, onUpdate }) {
  const [rootFolders, setRootFolders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRootFolders()
  }, [])

  const fetchRootFolders = async () => {
    try {
      // Fetch only root folders (is_root = 1)
      const response = await fetch(`${BASE_URL}/create/files-folders?is_root=true`)
      const data = await response.json()
      setRootFolders(data.data || [])
    } catch (error) {
      console.error('Error fetching root folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    const confirmMessage = `Are you sure you want to delete the root folder "${name}"?\n\n⚠️ This will also delete ALL files and subfolders inside it!`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`${BASE_URL}/create/file-folder/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        setRootFolders(rootFolders.filter(folder => folder.id !== id))
        alert(`Successfully deleted root folder and ${result.data?.deleted_count || 'all'} children`)
        onUpdate() // Update stats
      } else {
        alert(result.error || 'Error deleting root folder')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting root folder')
    }
  }

  const filteredFolders = rootFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="admin-loading">Loading root folders...</div>
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Root Folder Name</th>
            <th>Path</th>
            <th>Total Size</th>
            <th>Source Code</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFolders.map((folder, index) => (
            <motion.tr
              key={folder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <td className="admin-table-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={18} style={{ color: 'var(--accent-orange)' }} />
                  <strong>{folder.name}</strong>
                </div>
              </td>
              <td>
                <code style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-tertiary)',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {folder.path}
                </code>
              </td>
              <td>
                <span style={{ 
                  color: 'var(--accent-cyan)',
                  fontWeight: '500'
                }}>
                  {folder.size_formatted || '0 Bytes'}
                </span>
              </td>
              <td>
                {folder.source_code_id ? (
                  <span className="admin-status-badge status-available">
                    Attached
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    -
                  </span>
                )}
              </td>
              <td style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '-'}
              </td>
              <td>
                <div className="admin-table-actions">
                  <Link href={`/admin/view/files-folders/${folder.id}`}>
                    <motion.button
                      className="admin-action-btn view"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="View Contents"
                    >
                      <Eye size={16} />
                    </motion.button>
                  </Link>
                  <motion.button
                    className="admin-action-btn delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete (including all children)"
                    onClick={() => handleDelete(folder.id, folder.name)}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {filteredFolders.length === 0 && (
        <div className="admin-empty-state">
          <FolderTree size={48} />
          <p className="admin-empty-state-title">No root folders found</p>
          <p className="admin-empty-state-subtitle">
            {searchTerm 
              ? 'Try a different search term' 
              : 'Import from GitHub, ZIP, or local folder to create a root folder'}
          </p>
          <Link href="/admin/create/files-folders">
            <motion.button
              className="admin-btn admin-btn-primary"
              style={{ marginTop: '16px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>Import Files</span>
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  )
}
