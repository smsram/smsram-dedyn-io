'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Save, X, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function CreateProject() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sourceCodes, setSourceCodes] = useState([])
  const [technologies, setTechnologies] = useState([''])
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    year: new Date().getFullYear(),
    status: 'in-progress',
    featured: false,
    live_url: '',
    github_url: '',
    source_code_id: ''
  })

  useEffect(() => {
    fetchSourceCodes()
  }, [])

  const fetchSourceCodes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create/source-codes`)
      const data = await response.json()
      setSourceCodes(data.data || [])
    } catch (error) {
      console.error('Error:', error)
      setSourceCodes([])
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleArrayChange = (index, value) => {
    const newArray = [...technologies]
    newArray[index] = value
    setTechnologies(newArray)
  }

  const addTechnology = () => {
    setTechnologies([...technologies, ''])
  }

  const removeTechnology = (index) => {
    if (technologies.length > 1) {
      setTechnologies(technologies.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        technologies: technologies.filter(t => t.trim())
      }

      const response = await fetch(`${BASE_URL}/create/project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Project created successfully!')
        router.push('/admin')
      } else {
        alert(data.error || 'Error creating project')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating project')
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
            <h1 className="admin-form-title">Create New Project</h1>
            <p className="admin-form-subtitle">Add a portfolio project</p>
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
              placeholder="HireSmart AI Platform"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="hiresmart-ai-platform"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Brief project description"
              rows={4}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Technologies</label>
            {technologies.map((tech, index) => (
              <div key={index} className="admin-array-input">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => handleArrayChange(index, e.target.value)}
                  className="admin-form-input"
                  placeholder="Next.js, AI, Firebase"
                />
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="admin-array-btn remove"
                  disabled={technologies.length === 1}
                >
                  <Minus size={16} />
                </button>
                {index === technologies.length - 1 && (
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="admin-array-btn add"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="admin-form-input"
                min="2000"
                max="2100"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="admin-form-select"
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              Featured Project
            </label>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Live URL</label>
              <input
                type="url"
                name="live_url"
                value={formData.live_url}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="https://project-live-url.com"
              />
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
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Related Source Code (Optional)</label>
            <select
              name="source_code_id"
              value={formData.source_code_id}
              onChange={handleChange}
              className="admin-form-select"
            >
              <option value="">No source code</option>
              {sourceCodes.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title} ({sc.id})
                </option>
              ))}
            </select>
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
              <span>{loading ? 'Saving...' : 'Save Project'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
