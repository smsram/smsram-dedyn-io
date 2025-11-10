'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ArrowLeft, Save, X, Folder, File, FolderTree, 
  Edit2, Trash2, Plus, ChevronRight, ChevronDown,
  FileCode, Image as ImageIcon, Download, ExternalLink,
  RefreshCw, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function EditFilesAndFolders() {
  const router = useRouter()
  const params = useParams()
  const rootId = params.id

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [treeData, setTreeData] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [editingItem, setEditingItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (rootId) {
      fetchTree()
    }
  }, [rootId])

  const fetchTree = async () => {
    setFetching(true)
    setError(null)
    
    try {
      console.log(`📦 Fetching tree for root: ${rootId}`);
      
      const response = await fetch(`${BASE_URL}/edit/files-folders/tree/${rootId}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Response received:', data);

      if (data.success && data.data) {
        console.log(`✅ Loaded ${data.total_items} items`);
        setTreeData(data.data)
        setExpandedFolders(new Set([rootId]))
      } else {
        throw new Error(data.error || 'Failed to load tree structure')
      }
    } catch (error) {
      console.error('❌ Error fetching tree:', error)
      setError(error.message)
    } finally {
      setFetching(false)
    }
  }

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const expandAll = () => {
    if (!treeData) return
    const allIds = new Set()
    const collectIds = (node) => {
      if (node.type === 'folder') {
        allIds.add(node.id)
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => collectIds(child))
        }
      }
    }
    collectIds(treeData)
    setExpandedFolders(allIds)
  }

  const collapseAll = () => {
    setExpandedFolders(new Set([rootId]))
  }

  const startEdit = (item) => {
    setEditingItem(item.id)
    setEditName(item.name)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditName('')
  }

  const saveEdit = async (itemId) => {
    if (!editName.trim()) {
      alert('❌ Name cannot be empty')
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/edit/file-folder/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      })

      if (response.ok) {
        await fetchTree()
        setEditingItem(null)
        setEditName('')
        alert('✅ Renamed successfully!')
      } else {
        const data = await response.json()
        alert(`❌ Error: ${data.error || 'Failed to rename'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error renaming item: ' + error.message)
    }
  }

  const confirmDelete = (item) => {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      const response = await fetch(`${BASE_URL}/edit/file-folder/${deleteTarget.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        // If deleting root, go back to admin
        if (deleteTarget.is_root === 1) {
          alert(`✅ Deleted root folder and ${data.data?.deleted_count || 'all'} children`)
          router.push('/admin')
        } else {
          await fetchTree()
          alert(`✅ Deleted ${data.data?.deleted_count || 1} item(s)`)
        }
      } else {
        alert(`❌ Error: ${data.error || 'Failed to delete'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error deleting item: ' + error.message)
    } finally {
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  const selectItem = (item) => {
    setSelectedItem(item)
  }

  const renderTree = (node, depth = 0) => {
    if (!node) return null

    const isExpanded = expandedFolders.has(node.id)
    const isEditing = editingItem === node.id
    const isSelected = selectedItem?.id === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="tree-item">
        <motion.div
          className={`tree-item-content ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => selectItem(node)}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          {/* Toggle folder */}
          {node.type === 'folder' && hasChildren && (
            <button
              className="tree-toggle"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(node.id)
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {(!hasChildren || node.type === 'file') && <span className="tree-spacer"></span>}

          {/* Icon */}
          {node.type === 'folder' ? (
            <Folder size={18} className="item-icon folder" />
          ) : (node.language && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(node.language.toLowerCase())) ? (
            <ImageIcon size={18} className="item-icon image" />
          ) : (
            <FileCode size={18} className="item-icon file" />
          )}

          {/* Name / Edit Input */}
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(node.id)
                if (e.key === 'Escape') cancelEdit()
              }}
              onClick={(e) => e.stopPropagation()}
              className="tree-edit-input"
              autoFocus
            />
          ) : (
            <span className="item-name">{node.name}</span>
          )}

          {/* Metadata */}
          <div className="item-metadata">
            {node.type === 'file' && (
              <span className="item-size">{node.size_formatted}</span>
            )}
            {node.type === 'folder' && hasChildren && (
              <span className="item-count">({node.children.length})</span>
            )}
            {node.is_root === 1 && (
              <span className="item-badge root">ROOT</span>
            )}
          </div>

          {/* Actions */}
          <div className="item-actions" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <>
                <motion.button
                  className="action-btn save"
                  onClick={() => saveEdit(node.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Save"
                >
                  <Save size={14} />
                </motion.button>
                <motion.button
                  className="action-btn cancel"
                  onClick={cancelEdit}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Cancel"
                >
                  <X size={14} />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  className="action-btn edit"
                  onClick={() => startEdit(node)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Rename"
                >
                  <Edit2 size={14} />
                </motion.button>
                <motion.button
                  className="action-btn delete"
                  onClick={() => confirmDelete(node)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Children */}
        {node.type === 'folder' && hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const getTotalStats = (node) => {
    let fileCount = 0
    let folderCount = 0
    let totalSize = 0

    const traverse = (item) => {
      if (item.type === 'file') {
        fileCount++
        totalSize += item.size || 0
      } else {
        folderCount++
        if (item.children) {
          item.children.forEach(child => traverse(child))
        }
      }
    }

    if (node) traverse(node)
    return { fileCount, folderCount, totalSize }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Loading State
  if (fetching) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading folder structure...</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            This may take a moment for large folders
          </p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <div className="error-icon">
            <AlertCircle size={64} />
          </div>
          <h2>Error Loading Folder</h2>
          <p>{error}</p>
          <div className="error-actions">
            <motion.button 
              onClick={fetchTree} 
              className="admin-btn admin-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={18} />
              <span>Retry</span>
            </motion.button>
            <motion.button 
              onClick={() => router.push('/admin')} 
              className="admin-btn admin-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
          <details style={{ marginTop: '24px', textAlign: 'left', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }}>
              Debug Information
            </summary>
            <pre style={{ 
              background: 'var(--bg-tertiary)', 
              padding: '12px', 
              borderRadius: '6px',
              fontSize: '0.75rem',
              overflow: 'auto',
              marginTop: '8px'
            }}>
Root ID: {rootId}
API URL: {BASE_URL}/edit/files-folders/tree/{rootId}
Error: {error}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  // No data state
  if (!treeData) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <div className="error-icon">📂</div>
          <h2>No Folder Data</h2>
          <p>Unable to load folder structure</p>
          <motion.button 
            onClick={() => router.push('/admin')} 
            className="admin-btn admin-btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>
      </div>
    )
  }

  const stats = getTotalStats(treeData)

  return (
    <div className="admin-dashboard">
      <motion.div
        className="admin-form-container admin-form-container-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="admin-form-header">
          <Link href="/admin">
            <motion.button
              className="admin-back-btn"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <div className="admin-form-title-section">
            <h1 className="admin-form-title">📁 {treeData.name}</h1>
            <p className="admin-form-subtitle">
              {stats.fileCount} files, {stats.folderCount} folders • {formatBytes(stats.totalSize)}
            </p>
          </div>
          <motion.button
            onClick={fetchTree}
            className="admin-btn-icon"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            title="Refresh"
          >
            <RefreshCw size={20} />
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="file-manager-stats">
          <div className="stat-card">
            <File size={20} />
            <div>
              <span className="stat-value">{stats.fileCount}</span>
              <span className="stat-label">Files</span>
            </div>
          </div>
          <div className="stat-card">
            <Folder size={20} />
            <div>
              <span className="stat-value">{stats.folderCount}</span>
              <span className="stat-label">Folders</span>
            </div>
          </div>
          <div className="stat-card">
            <Download size={20} />
            <div>
              <span className="stat-value">{formatBytes(stats.totalSize)}</span>
              <span className="stat-label">Total Size</span>
            </div>
          </div>
        </div>

        {/* Tree View */}
        <div className="file-manager-container">
          <div className="file-tree">
            <div className="file-tree-header">
              <FolderTree size={18} />
              <h3>Folder Structure</h3>
              <button className="tree-action-btn" onClick={expandAll} title="Expand All">
                Expand All
              </button>
              <button className="tree-action-btn" onClick={collapseAll} title="Collapse All">
                Collapse All
              </button>
            </div>
            <div className="file-tree-content">
              {renderTree(treeData)}
            </div>
          </div>

          {/* Details Panel */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                className="file-details-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="details-header">
                  <h3>Details</h3>
                  <button onClick={() => setSelectedItem(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="details-content">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedItem.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value detail-badge">{selectedItem.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Path:</span>
                    <span className="detail-value detail-path">{selectedItem.path}</span>
                  </div>
                  {selectedItem.type === 'file' && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{selectedItem.size_formatted}</span>
                      </div>
                      {selectedItem.language && (
                        <div className="detail-item">
                          <span className="detail-label">Extension:</span>
                          <span className="detail-value detail-badge">.{selectedItem.language}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value detail-code">{selectedItem.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Updated:</span>
                    <span className="detail-value">
                      {new Date(selectedItem.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="admin-form-actions">
          <motion.button
            onClick={() => confirmDelete(treeData)}
            className="admin-btn admin-btn-danger"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={18} />
            <span>Delete Entire Folder</span>
          </motion.button>
          <motion.button
            onClick={() => router.push('/admin')}
            className="admin-btn admin-btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginLeft: 'auto' }}
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>⚠️ Confirm Delete</h3>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
                </p>
                {deleteTarget.type === 'folder' && (
                  <p className="warning-text">
                    ⚠️ This will also delete ALL files and subfolders inside it!
                  </p>
                )}
                {deleteTarget.is_root === 1 && (
                  <p className="danger-text">
                    🚨 This is a ROOT folder! Deleting it will remove the entire structure and return you to the dashboard.
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn delete"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
