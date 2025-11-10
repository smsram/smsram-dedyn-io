'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Save, X, Youtube, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function CreateVideo() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingYouTube, setFetchingYouTube] = useState(false)
  const [sourceCodes, setSourceCodes] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    youtube_url: '',
    thumbnail: '',
    published_date: '',
    views: 0,
    likes: 0,
    duration: '',
    category: '',
    level: '',
    has_source_code: false,
    source_code_id: '',
    full_description: '',
    topics: ''
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
      console.error('Error fetching source codes:', error)
      setSourceCodes([])
    }
  }

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  const fetchYouTubeData = async (url) => {
    setFetchingYouTube(true)
    
    try {
      const videoId = extractYouTubeId(url)
      
      if (!videoId) {
        alert('Invalid YouTube URL')
        setFetchingYouTube(false)
        return
      }

      // Call backend API to fetch YouTube data
      const response = await fetch(`${BASE_URL}/create/youtube-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtube_url: url }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch video data')
      }

      const videoData = result.data

      setFormData(prev => ({
        ...prev,
        thumbnail: videoData.thumbnail,
        title: videoData.title,
        description: videoData.description,
        full_description: videoData.full_description,
        published_date: videoData.published_date,
        views: videoData.views,
        likes: videoData.likes,
        duration: videoData.duration,
        topics: Array.isArray(videoData.topics) 
          ? videoData.topics.join(', ') 
          : videoData.topics,
      }))

      // Auto-generate slug from title
      const slug = videoData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      setFormData(prev => ({ ...prev, slug }))

      console.log('✅ Video data fetched successfully:', videoData.title)
    } catch (error) {
      console.error('Error fetching YouTube data:', error)
      alert('Error fetching video data: ' + error.message)
    } finally {
      setFetchingYouTube(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, youtube_url: url }))
    
    // Auto-fetch data when valid YouTube URL is entered
    if (url && extractYouTubeId(url)) {
      fetchYouTubeData(url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/create/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Video created successfully!')
        router.push('/admin')
      } else {
        alert(data.error || 'Error creating video')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating video')
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
            <h1 className="admin-form-title">Create New Video</h1>
            <p className="admin-form-subtitle">Add a new video tutorial</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* YouTube URL */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              YouTube URL <span className="required">*</span>
            </label>
            <div className="admin-form-input-group">
              <Youtube size={18} className="input-icon" />
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleYouTubeUrlChange}
                className="admin-form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={fetchingYouTube}
              />
              {fetchingYouTube && (
                <span className="input-loading">
                  <Loader2 size={16} className="animate-spin" />
                  Fetching...
                </span>
              )}
            </div>
            <p className="admin-form-hint">
              Paste a YouTube video URL to auto-fetch video details
            </p>
          </div>

          {/* Thumbnail Preview */}
          {formData.thumbnail && (
            <motion.div 
              className="admin-form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="admin-form-label">Thumbnail Preview</label>
              <div className="admin-thumbnail-preview">
                <img src={formData.thumbnail} alt="Video thumbnail" />
                <a 
                  href={formData.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="admin-thumbnail-link"
                >
                  <ExternalLink size={16} />
                  Watch on YouTube
                </a>
              </div>
            </motion.div>
          )}

          {/* Title */}
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
              placeholder="Enter video title"
              required
              disabled={fetchingYouTube}
            />
          </div>

          {/* Slug */}
          <div className="admin-form-group">
            <label className="admin-form-label">Slug (Auto-generated)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="video-slug"
              disabled={fetchingYouTube}
            />
            <p className="admin-form-hint">URL-friendly version of the title</p>
          </div>

          {/* Short Description */}
          <div className="admin-form-group">
            <label className="admin-form-label">Short Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Brief description (max 200 characters)"
              rows={3}
              maxLength={200}
              disabled={fetchingYouTube}
            />
            <p className="admin-form-hint">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Date and Duration Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Published Date (Auto)</label>
              <input
                type="date"
                name="published_date"
                value={formData.published_date}
                onChange={handleChange}
                className="admin-form-input"
                readOnly
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Duration (Auto)</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="00:00:00"
                readOnly
              />
            </div>
          </div>

          {/* Views and Likes Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Views (Auto)</label>
              <input
                type="number"
                name="views"
                value={formData.views}
                onChange={handleChange}
                className="admin-form-input"
                readOnly
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Likes (Auto)</label>
              <input
                type="number"
                name="likes"
                value={formData.likes}
                onChange={handleChange}
                className="admin-form-input"
                readOnly
              />
            </div>
          </div>

          {/* Category and Level Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="admin-form-select"
              >
                <option value="">Select category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Data Science">Data Science</option>
                <option value="DevOps">DevOps</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="admin-form-select"
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Topics */}
          <div className="admin-form-group">
            <label className="admin-form-label">Topics (Auto-fetched)</label>
            <input
              type="text"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Next.js, React, TypeScript (comma-separated)"
              disabled={fetchingYouTube}
            />
            <p className="admin-form-hint">
              Tags will be automatically fetched from YouTube
            </p>
          </div>

          {/* Has Source Code Checkbox */}
          <div className="admin-form-group">
            <label className="admin-form-checkbox-label">
              <input
                type="checkbox"
                name="has_source_code"
                checked={formData.has_source_code}
                onChange={handleChange}
                className="admin-form-checkbox"
              />
              <span>This video has source code available</span>
            </label>
          </div>

          {/* Source Code Selection */}
          {formData.has_source_code && (
            <motion.div 
              className="admin-form-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="admin-form-label">Select Source Code</label>
              <select
                name="source_code_id"
                value={formData.source_code_id}
                onChange={handleChange}
                className="admin-form-select"
              >
                <option value="">Choose source code...</option>
                {sourceCodes.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title} ({sc.id})
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Full Description */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              Full Description (Auto-fetched from YouTube)
            </label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Full video description will be fetched automatically"
              rows={8}
              disabled={fetchingYouTube}
            />
          </div>

          {/* Form Actions */}
          <div className="admin-form-actions">
            <motion.button
              type="button"
              onClick={handleCancel}
              className="admin-btn admin-btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              <X size={18} />
              <span>Cancel</span>
            </motion.button>
            <motion.button
              type="submit"
              className="admin-btn admin-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || fetchingYouTube}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Video</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
