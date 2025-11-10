'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Save, X, Plus, Minus, Folder } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function CreateSourceCode() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState([])
  const [rootFolders, setRootFolders] = useState([])
  const [technologies, setTechnologies] = useState([''])
  const [features, setFeatures] = useState([''])
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    full_description: '',
    video_id: '',
    github_url: '',
    download_url: '',
    download_available: false,
    file_count: 0,
    folder_count: 0,
    total_size: '',
    root_folder_id: ''
  })

  useEffect(() => {
    fetchVideos()
    fetchRootFolders()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/videos`)
      const data = await response.json()
      setVideos(data.data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      setVideos([])
    }
  }

  const fetchRootFolders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/files-folders?type=folder&parent_id=null`)
      const data = await response.json()
      setRootFolders(data.data || [])
    } catch (error) {
      console.error('Error fetching root folders:', error)
      setRootFolders([])
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (name === 'download_available' && !checked) {
      setFormData(prev => ({ ...prev, download_url: '' }))
    }

    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleArrayChange = (index, value, array, setArray) => {
    const newArray = [...array]
    newArray[index] = value
    setArray(newArray)
  }

  const addArrayItem = (array, setArray) => {
    setArray([...array, ''])
  }

  const removeArrayItem = (index, array, setArray) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        technologies: technologies.filter(t => t.trim()),
        features: features.filter(f => f.trim())
      }

      const response = await fetch(`${BASE_URL}/create/source-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Source code created successfully!')
        router.push('/admin')
      } else {
        alert(data.error || 'Error creating source code')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating source code')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  return (
    <div className="admin-dashboard">
      <motion.div
        className="admin-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            <h1 className="admin-form-title">Create New Source Code</h1>
            <p className="admin-form-subtitle">Add downloadable source code</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Next.js Dashboard Template"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Slug (Auto-generated)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="nextjs-dashboard-template"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Short Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Brief description of the source code"
              rows={3}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Full Description</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Detailed description, features, requirements, installation steps, etc."
              rows={6}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Related Video (Optional)</label>
            <select
              name="video_id"
              value={formData.video_id}
              onChange={handleChange}
              className="admin-form-select"
            >
              <option value="">No related video</option>
              {videos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.title} ({video.id})
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Technologies</label>
            {technologies.map((tech, index) => (
              <div key={index} className="admin-array-input">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => handleArrayChange(index, e.target.value, technologies, setTechnologies)}
                  className="admin-form-input"
                  placeholder="Next.js, React, TailwindCSS"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, technologies, setTechnologies)}
                  className="admin-array-btn remove"
                  disabled={technologies.length === 1}
                >
                  <Minus size={16} />
                </button>
                {index === technologies.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayItem(technologies, setTechnologies)}
                    className="admin-array-btn add"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Features</label>
            {features.map((feature, index) => (
              <div key={index} className="admin-array-input">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange(index, e.target.value, features, setFeatures)}
                  className="admin-form-input"
                  placeholder="Responsive UI, Dark Mode, Animations"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, features, setFeatures)}
                  className="admin-array-btn remove"
                  disabled={features.length === 1}
                >
                  <Minus size={16} />
                </button>
                {index === features.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addArrayItem(features, setFeatures)}
                    className="admin-array-btn add"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">GitHub URL</label>
            <input
              type="url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              <input
                type="checkbox"
                name="download_available"
                checked={formData.download_available}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              Download Available
            </label>
          </div>

          {formData.download_available && (
            <div className="admin-form-group">
              <label className="admin-form-label">
                Download URL <span className="required">*</span>
              </label>
              <input
                type="url"
                name="download_url"
                value={formData.download_url}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="https://drive.google.com/... or direct link"
                required={formData.download_available}
              />
              <p className="admin-form-hint">
                Link to downloadable file (Google Drive, Dropbox, etc.)
              </p>
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label">
              <Folder size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Root Folder (Optional)
            </label>
            <select
              name="root_folder_id"
              value={formData.root_folder_id}
              onChange={handleChange}
              className="admin-form-select"
            >
              <option value="">No root folder selected</option>
              {rootFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name} - {folder.path} ({folder.id})
                </option>
              ))}
            </select>
            <p className="admin-form-hint">
              Select the root folder containing this source code's file structure
            </p>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">File Count</label>
              <input
                type="number"
                name="file_count"
                value={formData.file_count}
                onChange={handleChange}
                className="admin-form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Folder Count</label>
              <input
                type="number"
                name="folder_count"
                value={formData.folder_count}
                onChange={handleChange}
                className="admin-form-input"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Total Size</label>
            <input
              type="text"
              name="total_size"
              value={formData.total_size}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="2.5 MB, 15 KB, etc."
            />
          </div>

          <div className="admin-form-actions">
            <motion.button
              type="button"
              onClick={handleCancel}
              className="admin-btn admin-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} />
              <span>Cancel</span>
            </motion.button>
            <motion.button
              type="submit"
              className="admin-btn admin-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Source Code'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
