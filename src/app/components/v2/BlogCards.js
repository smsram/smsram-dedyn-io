"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import "./style/BlogCards.css";

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Machine Learning in 2025",
    excerpt: "A comprehensive guide to beginning your journey in machine learning with practical tips and resources.",
    image: "https://images.unsplash.com/photo-1695144244472-a4543101ef35?w=600",
    date: "Oct 25, 2025",
    readTime: "8 min read",
    category: "AI/ML",
    color: "#8b5cf6",
  },
  {
    id: 2,
    title: "Building Scalable Web Applications with Next.js",
    excerpt: "Learn how to architect and build production-ready web applications using Next.js and modern best practices.",
    image: "https://images.unsplash.com/photo-1593720213681-e9a8778330a7?w=600",
    date: "Oct 20, 2025",
    readTime: "12 min read",
    category: "Web Dev",
    color: "#2563eb",
  },
  {
    id: 3,
    title: "Python Best Practices for Clean Code",
    excerpt: "Discover essential Python coding patterns and practices to write maintainable and efficient code.",
    image: "https://images.unsplash.com/photo-1719400471588-575b23e27bd7?w=600",
    date: "Oct 15, 2025",
    readTime: "10 min read",
    category: "Python",
    color: "#10b981",
  },
  {
    id: 4,
    title: "The Future of AI in Software Development",
    excerpt: "Exploring how AI is transforming the way we build software and what it means for developers.",
    image: "https://images.unsplash.com/photo-1652212976547-16d7e2841b8c?w=600",
    date: "Oct 10, 2025",
    readTime: "15 min read",
    category: "AI/ML",
    color: "#ec4899",
  },
];

export default function BlogCards() {
  const [hoveredCard, setHoveredCard] = React.useState(null);

  return (
    <section id="blog" className="blog-section">
      <div className="blog-container">
        {/* Enhanced Header with Animations */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="blog-section-header"
        >
          <motion.div
            className="blog-header-top"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="blog-header-sparkle" />
            <span className="blog-header-label">Latest Content</span>
            <Sparkles className="blog-header-sparkle" />
          </motion.div>

          <motion.h2 
            className="blog-section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Blog & Updates
          </motion.h2>

          <motion.p 
            className="blog-section-subtitle"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Thoughts, tutorials, and insights on tech and development
          </motion.p>

          <motion.div
            className="blog-title-underline"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
          />
        </motion.div>

        {/* Blog Grid */}
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              onHoverStart={() => setHoveredCard(post.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <motion.div
                className="blog-card"
                whileHover={{ 
                  y: -12, 
                  boxShadow: `0 30px 60px ${post.color}40`,
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Image Section */}
                <div className="blog-image-wrapper">
                  <motion.img 
                    src={post.image} 
                    alt={post.title} 
                    className="blog-image"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <motion.div 
                    className="blog-image-overlay"
                    animate={{ opacity: hoveredCard === post.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div 
                    className="blog-category"
                    whileHover={{ scale: 1.1 }}
                    style={{ backgroundColor: post.color }}
                  >
                    {post.category}
                  </motion.div>

                  <motion.div
                    className="blog-card-icon"
                    animate={{ 
                      y: hoveredCard === post.id ? [0, -15, 0] : [0, -5, 0],
                      opacity: hoveredCard === post.id ? 1 : 0.6
                    }}
                    transition={{ 
                      y: { duration: hoveredCard === post.id ? 2 : 3, repeat: Infinity },
                    }}
                  >
                    <BookOpen className="floating-icon" style={{ color: post.color }} />
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="blog-content">
                  <motion.div 
                    className="blog-meta"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.15 }}
                  >
                    <div className="meta-item">
                      <Calendar className="meta-icon" />
                      <span>{post.date}</span>
                    </div>
                    <div className="meta-divider" />
                    <div className="meta-item">
                      <Clock className="meta-icon" />
                      <span>{post.readTime}</span>
                    </div>
                  </motion.div>

                  <motion.h3 
                    className="blog-title"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.15 }}
                    animate={{ 
                      color: hoveredCard === post.id ? post.color : 'inherit'
                    }}
                  >
                    {post.title}
                  </motion.h3>

                  <motion.p 
                    className="blog-excerpt"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.15 }}
                  >
                    {post.excerpt}
                  </motion.p>

                  <motion.button 
                    className="blog-read-more-btn"
                    whileHover={{ x: 5 }}
                    style={{ color: post.color }}
                  >
                    <span>Read More</span>
                    <motion.div
                      animate={{ 
                        x: hoveredCard === post.id ? [0, 5, 0] : 0,
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      <ArrowRight className="blog-arrow-icon" />
                    </motion.div>
                  </motion.button>
                </div>

                <motion.div 
                  className="blog-card-progress"
                  style={{ backgroundColor: post.color }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="blog-section-footer"
        >
          <motion.button 
            className="blog-view-all-btn"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Posts
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
