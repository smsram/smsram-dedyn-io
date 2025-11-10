'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Save, X, Youtube, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function EditVideo() {
  const router = useRouter()
  const params = useParams()
  const videoId = params.id

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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
    fetchVideo()
    fetchSourceCodes()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const response = await fetch(`${BASE_URL}/edit/video/${videoId}`)
      const data = await response.json()

      if (data.success) {
        const video = data.data
        setFormData({
          ...video,
          has_source_code: Boolean(video.has_source_code),
          topics: video.topics || ''
        })
      } else {
        alert('Video not found')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      alert('Error loading video')
      router.push('/admin')
    } finally {
      setFetching(false)
    }
  }

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

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
      
      if (apiKey) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics`
        )
        const data = await response.json()
        
        if (data.items && data.items.length > 0) {
          const video = data.items[0]
          
          setFormData(prev => ({
            ...prev,
            thumbnail: thumbnailUrl,
            title: video.snippet.title,
            description: video.snippet.description.substring(0, 200),
            full_description: video.snippet.description,
            published_date: video.snippet.publishedAt.split('T')[0],
            views: parseInt(video.statistics.viewCount || 0),
            likes: parseInt(video.statistics.likeCount || 0),
            duration: formatDuration(video.contentDetails.duration),
            topics: video.snippet.tags ? video.snippet.tags.join(', ') : ''
          }))
        }
      } else {
        setFormData(prev => ({
          ...prev,
          thumbnail: thumbnailUrl
        }))
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error)
      alert('Error fetching video data')
    } finally {
      setFetchingYouTube(false)
    }
  }

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    const hours = (match[1] || '').replace('H', '')
    const minutes = (match[2] || '').replace('M', '')
    const seconds = (match[3] || '').replace('S', '')
    
    return [hours, minutes.padStart(2, '0'), seconds.padStart(2, '0')]
      .filter(Boolean)
      .join(':')
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

  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, youtube_url: url }))
    
    if (url && extractYouTubeId(url)) {
      fetchYouTubeData(url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/edit/video/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Video updated successfully!')
        router.push('/admin')
      } else {
        alert(`❌ ${data.error || 'Error updating video'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error updating video')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`⚠️ Are you sure you want to delete "${formData.title}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/edit/video/${videoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ Video deleted successfully!')
        router.push('/admin')
      } else {
        alert('❌ Error deleting video')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error deleting video')
    }
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  if (fetching) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">Loading video...</div>
      </div>
    )
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
            <h1 className="admin-form-title">Edit Video</h1>
            <p className="admin-form-subtitle">Update video information</p>
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
              />
              {fetchingYouTube && (
                <span className="input-loading">Fetching...</span>
              )}
            </div>
          </div>

          {formData.thumbnail && (
            <div className="admin-form-group">
              <label className="admin-form-label">Thumbnail Preview</label>
              <div className="admin-thumbnail-preview">
                <img src={formData.thumbnail} alt="Video thumbnail" />
                <a href={formData.youtube_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Watch on YouTube
                </a>
              </div>
            </div>
          )}

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
              placeholder="video-slug"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Short Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Brief description (200 chars)"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Published Date</label>
              <input
                type="date"
                name="published_date"
                value={formData.published_date}
                onChange={handleChange}
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="00:00"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Views</label>
              <input
                type="number"
                name="views"
                value={formData.views}
                onChange={handleChange}
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Likes</label>
              <input
                type="number"
                name="likes"
                value={formData.likes}
                onChange={handleChange}
                className="admin-form-input"
              />
            </div>
          </div>

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

          <div className="admin-form-group">
            <label className="admin-form-label">Topics (comma-separated)</label>
            <input
              type="text"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Next.js, React, TypeScript"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              <input
                type="checkbox"
                name="has_source_code"
                checked={formData.has_source_code}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              Has Source Code
            </label>
          </div>

          {formData.has_source_code && (
            <div className="admin-form-group">
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
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label">Full Description</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleChange}
              className="admin-form-textarea"
              placeholder="Full video description"
              rows={6}
            />
          </div>

          <div className="admin-form-actions">
            <motion.button
              type="button"
              onClick={handleDelete}
              className="admin-btn admin-btn-danger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </motion.button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
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
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
