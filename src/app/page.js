"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Code2,
  Sparkles,
  ArrowRight,
  Github,
  Youtube,
  Mail,
  Instagram,
  Heart,
  Zap,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Notification from "./components/ui/Notification";
import VideoCard from "@/app/components/dashboard/VideoCard";
import ProjectCard from "@/app/components/dashboard/ProjectCard";
import SourceCodeCard from "@/app/components/dashboard/SourceCodeCard";
import "./style.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ===== FOOTER COMPONENT =====
function PageFooter() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setNotification({
        type: "warning",
        title: "Email Required",
        message: "Please enter your email address",
      });
      return;
    }

    setSubscribing(true);

    try {
      const response = await fetch(`${BASE_URL}/mail/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: "success",
          title: "Successfully Subscribed!",
          message: "Check your email for confirmation",
        });
        setEmail("");
      } else {
        setNotification({
          type: "error",
          title: "Subscription Failed",
          message: data.error || "Something went wrong",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        title: "Network Error",
        message: "Please try again later",
      });
    } finally {
      setSubscribing(false);
    }
  };

  const footerLinks = {
    Navigation: [
      { label: "Home", href: "#home" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Videos", href: "/dashboard/videos" },
      { label: "Source Codes", href: "/dashboard/source-codes" },
    ],
    Resources: [
      { label: "Tutorials", href: "#videos" },
      { label: "Projects", href: "#projects" },
      { label: "Blog", href: "#" },
      { label: "Newsletter", href: "#contact" },
    ],
    Connect: [
      { label: "YouTube", href: "https://youtube.com/@smsram" },
      { label: "GitHub", href: "https://github.com/smsram" },
      { label: "Instagram", href: "https://instagram.com/smsram" },
    ],
  };

  const socialLinks = [
    {
      icon: Youtube,
      href: "https://youtube.com/@smsram",
      label: "YouTube",
    },
    {
      icon: Github,
      href: "https://github.com/smsram",
      label: "GitHub",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/smsram",
      label: "Instagram",
    },
  ];

  return (
    <footer id="contact" className="footer-main-wrapper">
      <div className="footer-inner-container">
        <div className="footer-upper-grid">
          <div className="footer-brand-section">
            <motion.div
              whileHover={{ scale: 1.06 }}
              className="footer-brand-box"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 107, 53, 0.3)",
                    "0 0 30px rgba(255, 107, 53, 0.5)",
                    "0 0 20px rgba(255, 107, 53, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="footer-logo-glow"
              >
                <div className="footer-logo-circle">
                  <Image
                    src="/smsram.jpg"
                    alt="SMSRam"
                    width={40}
                    height={40}
                    style={{ borderRadius: "8px" }}
                  />
                </div>
              </motion.div>
              <span className="footer-brand-name">SMSRam</span>
            </motion.div>

            <p className="footer-brand-description">
              Empowering developers with AI, Machine Learning, and modern coding
              education.
            </p>

            <div className="footer-social-links-row">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon-link"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links], sectionIdx) => (
            <div key={title} className="footer-link-column">
              <h4 className="footer-column-heading">{title}</h4>
              <ul className="footer-link-list">
                {links.map((link, i) => (
                  <motion.li
                    key={i}
                    className="footer-link-item"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: sectionIdx * 0.08 + i * 0.05 }}
                  >
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link-anchor"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="footer-link-anchor">
                        {link.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="footer-newsletter-wrapper"
        >
          <div className="footer-newsletter-inner">
            <Mail
              className="footer-newsletter-icon"
              style={{ color: "var(--accent-purple)" }}
            />
            <h4 className="footer-newsletter-title">Stay Updated</h4>
            <p className="footer-newsletter-text">
              Subscribe to get notified about new videos and projects
            </p>

            {notification && (
              <Notification
                {...notification}
                onClose={() => setNotification(null)}
                duration={5000}
              />
            )}

            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-newsletter-input"
                disabled={subscribing}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: subscribing ? 1 : 1.06 }}
                whileTap={{ scale: subscribing ? 1 : 0.96 }}
                className="footer-newsletter-button"
                style={{ background: "var(--accent-orange)" }}
                disabled={subscribing}
              >
                {subscribing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <div className="footer-bottom-section">
          <p className="footer-copyright">
            © 2025 SMSRam. All rights reserved.
          </p>

          <motion.div
            className="footer-credit-badge"
            whileHover={{ scale: 1.06 }}
          >
            Made with{" "}
            <Heart
              size={16}
              className="footer-heart-icon"
              style={{ color: "var(--accent-orange)" }}
            />{" "}
            by <span className="footer-credit-name">SMSRam</span>
          </motion.div>

          <div className="footer-legal-links">
            <a href="#" className="footer-legal-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-legal-link">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ===== MAIN HOME PAGE =====
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const menuRef = useRef(null);

  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    videos: 0,
    projects: 0,
    sourceCodes: 0,
    emailSubscribers: 0,
  });
  const [youtubeStats, setYoutubeStats] = useState({
    subscribers: 0,
    totalVideos: 0,
    totalViews: 0,
  });
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredSourceCodes, setFeaturedSourceCodes] = useState([]);

  // Floating icons for hero background animation
  const floatingIcons = [
    { Icon: Code2, delay: 0, color: "var(--accent-orange)" },
    { Icon: Play, delay: 0.5, color: "var(--accent-purple)" },
    { Icon: Sparkles, delay: 0.8, color: "var(--accent-cyan)" },
    { Icon: Zap, delay: 1.5, color: "var(--accent-orange)" },
  ];

  // Fetch homepage data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dataRes, statsRes, youtubeRes] = await Promise.all([
          fetch(`${BASE_URL}/main-page/homepage-data`),
          fetch(`${BASE_URL}/main-page/stats`),
          fetch(`${BASE_URL}/main-page/youtube-channel-stats`),
        ]);

        const data = await dataRes.json();
        const statsData = await statsRes.json();
        const youtubeData = await youtubeRes.json();

        if (data.success) {
          setFeaturedVideos(data.data.videos || []);
          setFeaturedProjects(data.data.projects || []);
          setFeaturedSourceCodes(data.data.sourceCodes || []);
        }

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (youtubeData.success) {
          setYoutubeStats(youtubeData.data);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll and active section tracking
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ["home", "videos", "projects", "sourcecodes", "about"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, mounted]);

  if (!mounted) return <div className="page-loading-placeholder" />;

  // Format numbers helper
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const displayStats = [
    {
      value: formatNumber(youtubeStats.subscribers) + "+",
      label: "Subscribers",
    },
    {
      value:
        youtubeStats.totalVideos > 0
          ? youtubeStats.totalVideos + "+"
          : stats.videos + "+",
      label: "Videos",
    },
    {
      value: stats.projects + "+",
      label: "Projects",
    },
    {
      value: formatNumber(youtubeStats.totalViews) + "+",
      label: "Views",
    },
  ];

  const skills = [
    "AI & ML",
    "Web Development",
    "Python",
    "JavaScript",
    "React",
    "TensorFlow",
    "Data Science",
    "Cloud Computing",
  ];

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.08 },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      x: 300,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: i * 0.05,
      },
    }),
  };

  const navItems = [
    { href: "#home", label: "Home", id: "home" },
    { href: "#videos", label: "Videos", id: "videos" },
    { href: "#projects", label: "Projects", id: "projects" },
    { href: "#sourcecodes", label: "Source Codes", id: "sourcecodes" },
    { href: "#about", label: "About", id: "about" },
  ];

  return (
    <div className="landing-page-root">
      {/* ===== HEADER ===== */}
      <motion.header
        className={`landing-header ${scrolled ? "landing-header-scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-inner-flex">
          <motion.div
            className="header-logo-group"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="header-logo-icon">
              <Image
                src="/smsram.jpg"
                alt="SR"
                width={35}
                height={35}
                style={{ borderRadius: "8px" }}
              />
            </div>
            <span className="header-logo-text">SMSRam</span>
          </motion.div>

          <nav className="header-nav-menu">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`header-nav-item ${
                  activeSection === item.id ? "active" : ""
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-controls">
            <Link href="/dashboard">
              <motion.button
                className="header-dashboard-button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                Dashboard
              </motion.button>
            </Link>

            <motion.button
              className="burger-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {!mobileMenuOpen ? (
                  <motion.div
                    key="menu-icon"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="close-icon"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                ref={menuRef}
                className="mobile-menu-panel"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="mobile-menu-content">
                  <nav className="mobile-menu-nav">
                    {navItems.map((item, idx) => (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        className={`mobile-menu-item ${
                          activeSection === item.id ? "active" : ""
                        }`}
                        custom={idx}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </motion.a>
                    ))}
                  </nav>

                  <div className="mobile-menu-divider" />

                  <motion.div
                    className="mobile-menu-bottom"
                    custom={navItems.length}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <Link href="/dashboard">
                      <motion.button
                        className="mobile-dashboard-btn"
                        onClick={() => setMobileMenuOpen(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Go to Dashboard
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="hero-main-area">
        <div className="hero-animated-bg">
          {floatingIcons.map((item, idx) => (
            <motion.div
              key={`float-${idx}`}
              className="hero-float-element"
              style={{ left: `${15 + idx * 25}%`, top: `${25 + idx * 18}%` }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 360],
                opacity: [0.12, 0.25, 0.12],
              }}
              transition={{
                duration: 5 + idx,
                repeat: Infinity,
                delay: item.delay,
              }}
            >
              <item.Icon size={80} style={{ color: item.color }} />
            </motion.div>
          ))}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="hero-float-line"
              style={{
                width: `${150 + i * 60}px`,
                left: `${i * 18}%`,
                top: `${22 + i * 14}%`,
              }}
              animate={{ x: [0, 120, 0], opacity: [0.06, 0.2, 0.06] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
        </div>

        <div className="hero-content-box">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="hero-badge"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(147, 112, 219, 0.3)",
                  "0 0 50px rgba(147, 112, 219, 0.6)",
                  "0 0 20px rgba(147, 112, 219, 0.3)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Sparkles size={14} style={{ marginRight: "0.5rem" }} />
              <span>AI • Machine Learning • Coding</span>
            </motion.div>

            <h1 className="hero-main-heading">
              Welcome to <span className="hero-brand-accent">SMSRam</span>
            </h1>

            <p className="hero-description">
              Watch tutorials, explore source codes, and learn hands-on
              development in AI, Machine Learning, and modern coding practices.
            </p>

            <div className="hero-action-buttons">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/dashboard">
                  <button className="btn btn-primary">
                    <Code2 size={20} /> <span>View Dashboard</span>
                  </button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <a
                  href="https://youtube.com/@smsram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btn btn-secondary">
                    <Play size={20} /> <span>Subscribe on YouTube</span>
                  </button>
                </a>
              </motion.div>
            </div>

            <div className="hero-stats-box">
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={32}
                  style={{ margin: "0 auto", color: "var(--accent-cyan)" }}
                />
              ) : (
                displayStats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="stat-cell"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.85 + idx * 0.12 }}
                  >
                    <div className="stat-number">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== VIDEOS SECTION ===== */}
      <section
        id="videos"
        className="content-cards-section videos-content-area"
      >
        <div className="section-wrapper">
          <motion.div
            className="section-header-group"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-main-title">Latest Videos</h2>
            <p className="section-subtitle">
              Watch our newest tutorials and learn cutting-edge technologies
            </p>
            <Link href="/dashboard/videos">
              <motion.button
                className="section-view-button"
                whileHover={{ scale: 1.08, x: 8 }}
              >
                View All Videos <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "3rem",
              }}
            >
              <Loader2
                className="animate-spin"
                size={48}
                style={{ color: "var(--accent-cyan)" }}
              />
            </div>
          ) : (
            <motion.div
              className="videos-grid"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {featuredVideos && featuredVideos.length > 0 ? (
                featuredVideos.map((video) => (
                  <motion.div key={video.id} variants={cardItemVariants}>
                    <VideoCard video={video} />
                  </motion.div>
                ))
              ) : (
                <p className="no-content-message">No videos available yet</p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== PROJECTS SECTION ===== */}
      <section
        id="projects"
        className="content-cards-section projects-content-area"
      >
        <div className="section-wrapper">
          <motion.div
            className="section-header-group"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-main-title">Featured Projects</h2>
            <p className="section-subtitle">
              Explore our latest portfolio projects and real-world applications
            </p>
            <Link href="/dashboard/projects">
              <motion.button
                className="section-view-button"
                whileHover={{ scale: 1.08, x: 8 }}
              >
                View All Projects <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "3rem",
              }}
            >
              <Loader2
                className="animate-spin"
                size={48}
                style={{ color: "var(--accent-purple)" }}
              />
            </div>
          ) : (
            <motion.div
              className="videos-grid"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <motion.div key={project.id} variants={cardItemVariants}>
                    <ProjectCard project={project} />
                  </motion.div>
                ))
              ) : (
                <p className="no-content-message">No projects available yet</p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== SOURCE CODES SECTION ===== */}
      <section
        id="sourcecodes"
        className="content-cards-section sourcecodes-content-area"
      >
        <div className="section-wrapper">
          <motion.div
            className="section-header-group"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-main-title">Source Codes</h2>
            <p className="section-subtitle">
              Download complete, production-ready source code
            </p>
            <Link href="/dashboard/source-codes">
              <motion.button
                className="section-view-button"
                whileHover={{ scale: 1.08, x: 8 }}
              >
                View All Codes <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "3rem",
              }}
            >
              <Loader2
                className="animate-spin"
                size={48}
                style={{ color: "var(--accent-orange)" }}
              />
            </div>
          ) : (
            <motion.div
              className="videos-grid"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {featuredSourceCodes && featuredSourceCodes.length > 0 ? (
                featuredSourceCodes.map((code) => (
                  <motion.div key={code.id} variants={cardItemVariants}>
                    <SourceCodeCard code={code} />
                  </motion.div>
                ))
              ) : (
                <p className="no-content-message">
                  No source codes available yet
                </p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="about-content-section">
        <div className="about-grid-container">
          <motion.div
            className="about-text-column"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="about-main-title">
              About <span className="about-brand-highlight">SMSRam</span>
            </h2>

            <div className="about-paragraphs">
              <p>
                Hi, I'm <strong>Meher Siva Ram</strong>, a passionate educator
                and developer specializing in Artificial Intelligence, Machine
                Learning, and modern web technologies.
              </p>
              <p>
                Through my YouTube channel and online platforms, I aim to make
                complex technical concepts accessible and practical. I believe
                in learning by doing.
              </p>
              <p>
                Whether you're a beginner or experienced, you'll find content
                tailored to accelerate your learning journey in AI, ML, and full
                stack development.
              </p>
            </div>

            <div className="skills-badges-container">
              {skills.map((skill, idx) => (
                <motion.div
                  key={skill}
                  className="skill-tag"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {skill}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="about-stats-column"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="stats-cards-grid">
              {displayStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="about-stat-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="about-stat-value">{stat.value}</h3>
                  <p className="about-stat-text">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-conversion-section">
        <motion.div
          className="cta-inner-box"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-main-heading">Ready to Start Learning?</h2>
          <p className="cta-description">
            Access all videos, source codes, and projects in one comprehensive
            dashboard
          </p>
          <Link href="/dashboard">
            <motion.button
              className="btn btn-cta-primary"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Dashboard <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <PageFooter />
    </div>
  );
}
