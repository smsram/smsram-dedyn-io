"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, ExternalLink, Download, Sparkles, ArrowRight, Code2 } from "lucide-react";
import "./style/ProjectsCards.css";

const categories = ["All", "Web Dev", "Python", "AI/ML", "Full Stack"];

const projects = [
  {
    id: 1,
    title: "AI-Powered Chat Application",
    description: "Real-time chat app with AI assistant integration using OpenAI API and WebSockets.",
    category: "AI/ML",
    tech: ["React", "Node.js", "OpenAI", "WebSocket"],
    github: "#",
    demo: "#",
    color: "#8b5cf6",
    icon: "💬",
  },
  {
    id: 2,
    title: "E-commerce Platform",
    description: "Full-stack e-commerce solution with payment integration and admin dashboard.",
    category: "Full Stack",
    tech: ["Next.js", "MongoDB", "Stripe", "Tailwind"],
    github: "#",
    demo: "#",
    color: "#2563eb",
    icon: "🛍️",
  },
  {
    id: 3,
    title: "Machine Learning Model Trainer",
    description: "Visual tool for training and deploying ML models with no-code interface.",
    category: "AI/ML",
    tech: ["Python", "TensorFlow", "Flask", "React"],
    github: "#",
    demo: "#",
    color: "#ec4899",
    icon: "🤖",
  },
  {
    id: 4,
    title: "Portfolio Template Generator",
    description: "Dynamic portfolio generator with customizable themes and components.",
    category: "Web Dev",
    tech: ["React", "Tailwind", "Framer Motion"],
    github: "#",
    demo: "#",
    color: "#10b981",
    icon: "🎨",
  },
  {
    id: 5,
    title: "Task Automation Scripts",
    description: "Collection of Python scripts for automating daily development tasks.",
    category: "Python",
    tech: ["Python", "Selenium", "BeautifulSoup"],
    github: "#",
    demo: "#",
    color: "#f59e0b",
    icon: "⚙️",
  },
  {
    id: 6,
    title: "Real-time Analytics Dashboard",
    description: "Interactive dashboard for visualizing real-time data with beautiful charts.",
    category: "Web Dev",
    tech: ["React", "D3.js", "WebSocket", "Node.js"],
    github: "#",
    demo: "#",
    color: "#06b6d4",
    icon: "📊",
  },
];

export default function ProjectsCards() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="source-codes" className="projects-section">
      <div className="projects-container">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="projects-section-header"
        >
          <motion.div
            className="projects-header-top"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="projects-header-sparkle" />
            <span className="projects-header-label">My Portfolio</span>
            <Sparkles className="projects-header-sparkle" />
          </motion.div>

          <motion.h2
            className="projects-section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Source Codes & Projects
          </motion.h2>

          <motion.p
            className="projects-section-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Open source projects and tutorials source code
          </motion.p>

          <motion.div
            className="projects-title-underline"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="category-filters"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.08 }}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
            >
              <motion.span
                animate={{
                  color: selectedCategory === category ? "#ffffff" : "inherit",
                }}
                transition={{ duration: 0.3 }}
              >
                {category}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>

        {/* Project Grid */}
        <div className="project-grid">
          <AnimatePresence mode="wait">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.8 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                layout
                onHoverStart={() => setHoveredCard(project.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <motion.div
                  className="project-card"
                  whileHover={{
                    y: -12,
                    boxShadow: `0 30px 60px ${project.color}40`,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Background Shape */}
                  <motion.div
                    className="project-bg-shape"
                    style={{ backgroundColor: project.color }}
                    animate={{
                      scale: hoveredCard === project.id ? 1.3 : 1,
                      opacity: hoveredCard === project.id ? 0.15 : 0.05,
                    }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="project-icon"
                    animate={{
                      y: hoveredCard === project.id ? [0, -10, 0] : 0,
                      rotate: hoveredCard === project.id ? 360 : 0,
                    }}
                    transition={{
                      y: {
                        duration: hoveredCard === project.id ? 2 : 0.3,
                        repeat: hoveredCard === project.id ? Infinity : 0,
                      },
                      rotate: {
                        duration: hoveredCard === project.id ? 2 : 0,
                      },
                    }}
                  >
                    {project.icon}
                  </motion.div>

                  {/* Header */}
                  <div className="project-header">
                    <motion.span
                      className="project-badge"
                      style={{ backgroundColor: project.color }}
                      whileHover={{ scale: 1.1 }}
                      animate={{
                        x: hoveredCard === project.id ? [0, 3, -3, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: hoveredCard === project.id ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      {project.category}
                    </motion.span>

                    <motion.h3
                      className="project-title"
                      animate={{
                        color:
                          hoveredCard === project.id ? project.color : "inherit",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {project.title}
                    </motion.h3>

                    <motion.p
                      className="project-description"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      {project.description}
                    </motion.p>
                  </div>

                  {/* Tech Stack */}
                  <motion.div
                    className="tech-stack"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {project.tech.map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        className="tech-tag"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.1 + techIndex * 0.05,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.15,
                          backgroundColor: project.color,
                          color: "white",
                        }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* Actions */}
                  <div className="project-footer">
                    <motion.button
                      className="action-btn github-btn"
                      onClick={() => window.open(project.github, "_blank")}
                      whileHover={{ scale: 1.08, x: -3 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        x: hoveredCard === project.id ? [-3, 0, -3] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: hoveredCard === project.id ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      <Github className="btn-icon" />
                      GitHub
                    </motion.button>

                    <motion.button
                      className="action-btn demo-btn"
                      style={{ backgroundColor: project.color }}
                      onClick={() => window.open(project.demo, "_blank")}
                      whileHover={{ scale: 1.08, x: 3 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        x: hoveredCard === project.id ? [3, 0, 3] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: hoveredCard === project.id ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      <ExternalLink className="btn-icon" />
                      Demo
                    </motion.button>
                  </div>

                  {/* Progress Bar */}
                  <motion.div
                    className="project-card-progress"
                    style={{ backgroundColor: project.color }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Glow Effect */}
                  <motion.div
                    className="project-card-glow"
                    style={{
                      background: `radial-gradient(circle, ${project.color}40, transparent)`,
                    }}
                    animate={{
                      opacity: hoveredCard === project.id ? [0.5, 0.8, 0.5] : 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="projects-section-footer"
        >
          <motion.button
            className="projects-view-all-btn"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Code2 className="btn-icon-lg" />
            View All Projects
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
