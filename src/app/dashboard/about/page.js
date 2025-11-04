'use client'

import { motion } from 'motion/react'
import { Mail, Briefcase, Award, Users, Code, Zap, Heart, Target, Github, Youtube, Instagram } from 'lucide-react'
import Link from 'next/link'

export default function About() {
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

  const stats = [
    { icon: Code, label: 'Projects Built', value: '50+' },
    { icon: Users, label: 'Community Members', value: '5K+' },
    { icon: Award, label: 'Tutorials Created', value: '80+' },
    { icon: Zap, label: 'Active Since', value: '2022' }
  ]

  const features = [
    {
      icon: Code,
      title: 'Quality Code',
      description: 'Well-documented, production-ready source code examples for all tutorials'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Learn and grow with thousands of developers in our active community'
    },
    {
      icon: Zap,
      title: 'Latest Tech',
      description: 'Always up-to-date with the latest frameworks and best practices'
    },
    {
      icon: Heart,
      title: 'Passion Driven',
      description: 'Created with passion to help developers succeed and grow their skills'
    }
  ]

  const team = [
    {
      name: 'Sher Ram',
      role: 'Founder & Lead Developer',
      bio: 'Full-stack developer passionate about web technologies',
      specialties: ['React', 'Node.js', 'Next.js'],
      socials: [
        { icon: Github, link: 'https://github.com', label: 'GitHub' },
        { icon: Youtube, link: 'https://youtube.com', label: 'YouTube' },
        { icon: Instagram, link: 'https://instagram.com', label: 'Instagram' }
      ]
    }
  ]

  return (
    <div className="about-page">
      {/* Hero Section */}
      <motion.section 
        className="about-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <h1 className="about-title">About SMSRam</h1>
          <p className="about-subtitle">
            Your ultimate destination for web development tutorials, source code, and community learning
          </p>
          <p className="about-description">
            SMSRam is dedicated to providing high-quality web development tutorials, complete source code examples, and fostering a vibrant community of learners. We believe in making web development accessible and enjoyable for everyone.
          </p>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="about-stats"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div 
              key={index}
              className="stat-item"
              variants={itemVariants}
            >
              <div className="stat-icon-wrapper">
                <Icon size={32} />
              </div>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.section>

      {/* Mission & Vision Section */}
      <motion.section 
        className="about-mission"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="mission-container">
          <motion.div 
            className="mission-card"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Target size={40} className="mission-icon" />
            <h2>Our Mission</h2>
            <p>
              To empower developers worldwide by providing comprehensive, high-quality web development tutorials and resources that help them master modern technologies and build amazing applications.
            </p>
          </motion.div>

          <motion.div 
            className="mission-card vision-card"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Briefcase size={40} className="mission-icon" />
            <h2>Our Vision</h2>
            <p>
              To create a world where learning web development is accessible, affordable, and enjoyable for everyone, regardless of their background or experience level.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="about-features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div 
          className="section-header"
          variants={itemVariants}
        >
          <h2>Why Choose SMSRam?</h2>
          <p>We're committed to excellence in every aspect</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div 
                key={index}
                className="feature-card"
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <div className="feature-icon">
                  <Icon size={28} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="about-team"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div 
          className="section-header"
          variants={itemVariants}
        >
          <h2>Meet the Team</h2>
          <p>Passionate developers creating amazing content</p>
        </motion.div>

        <div className="team-grid">
          {team.map((member, index) => (
            <motion.div 
              key={index}
              className="team-card"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <div className="team-avatar">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
              
              <div className="team-specialties">
                {member.specialties.map((specialty, idx) => (
                  <span key={idx} className="specialty-tag">{specialty}</span>
                ))}
              </div>

              <div className="team-socials">
                {member.socials.map((social, idx) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={idx}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title={social.label}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon size={20} />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="about-values"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="values-container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Our Core Values</h2>
          </motion.div>

          <div className="values-grid">
            {[
              { title: 'Quality', description: 'We never compromise on the quality of our content and code examples' },
              { title: 'Transparency', description: 'We believe in open communication and honest feedback with our community' },
              { title: 'Innovation', description: 'We constantly explore new technologies and teaching methodologies' },
              { title: 'Community', description: 'We foster a supportive environment where everyone can learn and grow' }
            ].map((value, index) => (
              <motion.div 
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="about-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of developers who are already mastering web development with SMSRam</p>
          <div className="cta-buttons">
            <Link href="/dashboard/videos" className="cta-btn primary-btn">
              Explore Tutorials
            </Link>
            <Link href="/dashboard/contact" className="cta-btn secondary-btn">
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}
