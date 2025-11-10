'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, MessageSquare, Send, Github, Youtube, Instagram, Clock, ArrowRight } from 'lucide-react'
import { useNotification } from '@/app/components/ui/NotificationContext'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { showNotification } = useNotification()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`${BASE_URL}/mail/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Show success notification (fixed at top)
      showNotification({
        type: 'success',
        title: 'Message Sent Successfully!',
        message: 'Thank you for reaching out. We\'ll get back to you soon.',
        duration: 5000
      })

      // Clear form
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      console.error('Error sending message:', err)
      
      // Show error notification (fixed at top)
      showNotification({
        type: 'error',
        title: 'Failed to Send Message',
        message: err.message || 'Please try again later.',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'meher@smsram.dedyn.io',
      description: 'Send us an email anytime, we usually respond within 24 hours',
      link: 'mailto:meher@smsram.dedyn.io'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      content: 'Start a conversation',
      description: 'Chat with our support team in real-time during business hours',
      link: '#'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon - Fri, 9AM - 6PM',
      description: 'We\'re here to help during these hours. Holidays excluded.',
      link: '#'
    }
  ]

  const socialLinks = [
    { icon: Github, label: 'GitHub', url: 'https://github.com/smsram', color: 'purple' },
    { icon: Youtube, label: 'YouTube', url: 'https://youtube.com/smsram', color: 'orange' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/smsram', color: 'cyan' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <motion.section 
        className="contact-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </motion.section>

      {/* Contact Container */}
      <div className="contact-container">
        {/* Contact Info Cards */}
        <motion.div 
          className="contact-info-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contactInfo.map((info, index) => {
            const Icon = info.icon
            return (
              <motion.a
                key={index}
                href={info.link}
                className="contact-info-card"
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <div className={`contact-card-icon icon-${['orange', 'purple', 'cyan'][index]}`}>
                  <Icon size={28} />
                </div>
                <div className="contact-card-content">
                  <h3>{info.title}</h3>
                  <p className="contact-card-main">{info.content}</p>
                  <p className="contact-card-desc">{info.description}</p>
                </div>
                <ArrowRight size={20} className="contact-card-arrow" />
              </motion.a>
            )
          })}
        </motion.div>

        {/* Form Section */}
        <motion.div 
          className="contact-form-section"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="contact-form-header">
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is this about?"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Your message..."
                className="form-textarea"
                disabled={isLoading}
              />
            </div>

            <motion.button 
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Social Section */}
      <motion.section 
        className="contact-social-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="social-content">
          <h2>Follow Us</h2>
          <p>Connect with us on social media for updates and announcements</p>
          <div className="social-links">
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`social-link social-${social.color}`}
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.label}
                >
                  <Icon size={24} />
                </motion.a>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        className="contact-faq-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {[
            {
              q: 'How quickly will I get a response?',
              a: 'We aim to respond to all messages within 24 hours during business days.'
            },
            {
              q: 'Can I sponsor or partner with SMSRam?',
              a: 'Yes! We\'re open to collaborations. Please mention it in your message.'
            },
            {
              q: 'Do you offer private consultations?',
              a: 'We do offer consulting services. Contact us for more details and pricing.'
            },
            {
              q: 'How can I contribute to SMSRam?',
              a: 'We welcome contributors! Check out our GitHub for open source opportunities.'
            }
          ].map((faq, index) => (
            <motion.div 
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
