"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  Brain,
  Palette,
  Rocket,
  Calendar,
  Clock,
  ArrowRight,
  Mail,
  MapPin,
  MessageSquare,
  Play,
  Eye,
  ArrowUp,
  Heart,
  Moon,
  Sun,
  Menu,
  X,
  ExternalLink,
  Download,
  Youtube,
  Github,
  Instagram,
  Send,
} from "lucide-react";
import { Toaster as SonnerToaster } from "sonner";
import "./style.css";
import {
  GlobeAltIcon,
  CpuChipIcon,
  CodeBracketIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Video Card Component
import LatestVideosCards from "../components/v2/LatestVideosCards";
// Projects Card Component
import ProjectsCards from "../components/v2/ProjectsCards";
// Blog Card Component
import BlogCards from "../components/v2/BlogCards";

// Theme Context
const ThemeContext = createContext({ theme: "dark", setTheme: () => null });

function ThemeProvider({ children, defaultTheme = "dark" }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") || defaultTheme;
    setTheme(stored);
  }, [defaultTheme]);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

// Toaster Component
function Toaster(props) {
  const { theme } = useTheme();
  return <SonnerToaster theme={theme} {...props} />;
}

// Image fallback
const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

function ImageWithFallback({ src, alt, className }) {
  const [didError, setDidError] = useState(false);
  if (didError)
    return <img src={ERROR_IMG_SRC} alt="Error" className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setDidError(true)}
    />
  );
}

// Skills and Timeline Data
const skills = [
  {
    category: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "Java", "C++"],
  },
  {
    category: "Web Development",
    items: ["React", "Next.js", "Node.js", "Tailwind CSS", "Express"],
  },
  {
    category: "AI/ML",
    items: ["TensorFlow", "PyTorch", "Scikit-learn", "OpenAI API", "Keras"],
  },
  {
    category: "Tools & Others",
    items: ["Git", "Docker", "MongoDB", "PostgreSQL", "AWS"],
  },
];

const timeline = [
  {
    year: "2025",
    title: "AI & ML Student",
    description:
      "Pursuing advanced studies in Artificial Intelligence and Machine Learning",
    icon: Brain,
  },
  {
    year: "2024",
    title: "YouTube Creator",
    description:
      "Started SMSRam channel sharing coding tutorials and tech content",
    icon: Rocket,
  },
  {
    year: "2023",
    title: "Full Stack Developer",
    description: "Building modern web applications and open source projects",
    icon: Code2,
  },
  {
    year: "2022",
    title: "Creative Journey",
    description:
      "Exploring the intersection of technology and creative content",
    icon: Palette,
  },
];

// Main Page Component
export default function Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    "Home",
    "Videos",
    "Source Codes",
    "Blog",
    "About",
    "Contact",
  ];

  const scrollToSection = (section) => {
    const id = section.toLowerCase().replace(" ", "-");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const currentYear = mounted ? new Date().getFullYear() : 2025;

  const footerLinks = {
    Quick: ["Home", "Videos", "Projects", "Blog"],
    Resources: ["Tutorials", "Source Codes", "Documentation", "Community"],
    Connect: ["YouTube", "GitHub", "Instagram", "Contact"],
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="app-container">
        {/* Navbar */}
        <Navbar
          mounted={mounted}
          menuItems={menuItems}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          scrollToSection={scrollToSection}
        />

        <main>
          {/* Hero Section */}
          <Hero mounted={mounted} />

          {/* Latest Videos Section - Card Component */}
          <LatestVideosCards />

          {/* Projects Section - Card Component */}
          <ProjectsCards />

          {/* Blog Section - Card Component */}
          <BlogCards />

          {/* About Section */}
          <AboutSection />

          {/* Contact Section */}
          <ContactSection
            formData={formData}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />
        </main>

        {/* Footer */}
        <FooterSection
          currentYear={currentYear}
          footerLinks={footerLinks}
          scrollToTop={scrollToTop}
        />

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

// Fixed Navbar Component with Active Section Highlighting
function Navbar({
  mounted,
  menuItems,
  mobileMenuOpen,
  setMobileMenuOpen,
  scrollToSection,
}) {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("Home");

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect current section on scroll
      const sections = menuItems.map((item) => ({
        name: item,
        id: item.toLowerCase().replace(" ", "-"),
      }));

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in viewport (with offset for navbar)
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.name);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuItems]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`main-navbar ${scrolled ? "navbar-scrolled" : ""}`}
    >
      <div className="navbar-inner-container">
        <div className="navbar-flex-wrapper">
          {/* Logo with Pulse Animation */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="navbar-logo-brand"
            onClick={() => {
              scrollToSection("Home");
              setActiveSection("Home");
            }}
          >
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="logo-text"
            >
              SMSRam
            </motion.span>
            {/* Animated dots instead of underline */}
            <div className="logo-dots">
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="logo-dot"
              />
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="logo-dot"
              />
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                className="logo-dot"
              />
            </div>
          </motion.div>

          {/* Desktop Menu with Underline Animation */}
          <div className="navbar-desktop-menu">
            {menuItems.map((item, index) => {
              const isActive = activeSection === item;
              return (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    scrollToSection(item);
                    setActiveSection(item);
                  }}
                  className={`navbar-menu-link ${isActive ? "active" : ""}`}
                >
                  <span>{item}</span>
                  <motion.div
                    className="menu-link-underline"
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    initial={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className="menu-link-active-dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="navbar-right-actions">
            {/* Social Links with Glow Effect */}
            <div className="navbar-social-links">
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://youtube.com/@smsram"
                target="_blank"
                rel="noopener noreferrer"
                className="navbar-social-icon-link youtube-icon"
              >
                <Youtube className="standard-icon" />
                <span className="icon-tooltip">YouTube</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://github.com/smsram"
                target="_blank"
                rel="noopener noreferrer"
                className="navbar-social-icon-link github-icon"
              >
                <Github className="standard-icon" />
                <span className="icon-tooltip">GitHub</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://instagram.com/smsram"
                target="_blank"
                rel="noopener noreferrer"
                className="navbar-social-icon-link instagram-icon"
              >
                <Instagram className="standard-icon" />
                <span className="icon-tooltip">Instagram</span>
              </motion.a>
            </div>

            {/* Theme Toggle with Smooth Transition */}
            {mounted && (
              <motion.button
                className="base-button button-ghost-style button-icon-size theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <Sun className="standard-icon theme-icon-sun" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <Moon className="standard-icon theme-icon-moon" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            {/* Mobile Menu Toggle with Hamburger Animation */}
            <motion.button
              className="base-button button-ghost-style button-icon-size navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="standard-icon" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="standard-icon" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown with Slide Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="navbar-mobile-dropdown"
          >
            <div className="navbar-mobile-menu-content">
              {menuItems.map((item, index) => {
                const isActive = activeSection === item;
                return (
                  <motion.button
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => {
                      scrollToSection(item);
                      setActiveSection(item);
                      setMobileMenuOpen(false);
                    }}
                    className={`navbar-mobile-menu-item ${isActive ? "active" : ""}`}
                    whileHover={{
                      x: 5,
                      backgroundColor: "rgba(37, 99, 235, 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{item}</span>
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="mobile-menu-arrow" />
                    </motion.div>
                  </motion.button>
                );
              })}
              <motion.div
                className="navbar-mobile-social-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://youtube.com/@smsram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-social-link youtube"
                >
                  <Youtube className="standard-icon" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://github.com/smsram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-social-link github"
                >
                  <Github className="standard-icon" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://instagram.com/smsram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-social-link instagram"
                >
                  <Instagram className="standard-icon" />
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// Hero Component - Fixed with proper overflow and visibility
function Hero({ mounted }) {
  return (
    <section id="home" className="hero-main-section">
      {/* Animated Background Layers */}
      <div className="hero-gradient-background">
        {/* Animated gradient orbs */}
        <div className="hero-animated-orb hero-orb-1"></div>
        <div className="hero-animated-orb hero-orb-2"></div>
        <div className="hero-animated-orb hero-orb-3"></div>
        <div className="hero-animated-orb hero-orb-4"></div>

        {/* Floating particles */}
        {mounted && (
          <div className="hero-particles-container">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="hero-floating-particle"
                initial={{
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  x: [
                    Math.random() * 100,
                    Math.random() * 100 + 50,
                    Math.random() * 100,
                  ],
                  y: [
                    Math.random() * 100,
                    Math.random() * 100 + 50,
                    Math.random() * 100,
                  ],
                  scale: [
                    Math.random() * 0.5 + 0.5,
                    Math.random() * 0.8 + 0.8,
                    Math.random() * 0.5 + 0.5,
                  ],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* Grid pattern overlay */}
        <div className="hero-grid-pattern"></div>

        {/* Animated lines */}
        <div className="hero-animated-lines">
          <div className="hero-line hero-line-1"></div>
          <div className="hero-line hero-line-2"></div>
          <div className="hero-line hero-line-3"></div>
        </div>
      </div>

      <div className="hero-content-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Welcome Badge - Fixed overflow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="hero-welcome-badge-container"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.4)",
                  "0 0 0 15px rgba(59, 130, 246, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="hero-badge-pulse-wrapper"
            >
              <span className="hero-badge-text">
                Welcome to SMSRam&apos;s Tech Hub
              </span>
            </motion.div>
            <div className="hero-badge-shimmer"></div>
          </motion.div>

          {/* Main Title - Fixed text visibility */}
          <motion.h1
            className="hero-main-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {["Hey,", "I'm", "Meher", "Siva", "Ram"].map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  delay: 0.5 + wordIndex * 0.1,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                }}
                className="hero-title-word"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="hero-subtitle-wrapper"
          >
            <p className="hero-subtitle-text">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                Sharing coding tutorials, AI projects, and creative tech
                content.
              </motion.span>
              <br />
              <motion.span
                className="hero-role-highlight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                AI & ML Student | Developer | Content Creator
              </motion.span>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, type: "spring" }}
            className="hero-cta-buttons"
          >
            <motion.button
              className="base-button button-large-size gradient-bg-button hero-primary-cta"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(37, 99, 235, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Youtube className="standard-icon" />
              </motion.div>
              Watch on YouTube
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="standard-icon" />
              </motion.div>
            </motion.button>

            <motion.button
              className="base-button button-large-size button-outline-style hero-secondary-cta"
              whileHover={{
                scale: 1.05,
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Code2 className="standard-icon" />
              View Source Codes
              <ArrowRight className="standard-icon" />
            </motion.button>
          </motion.div>

          {/* Feature Cards with Heroicons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="hero-features-grid"
          >
            {[
              {
                title: "Web Dev",
                icon: GlobeAltIcon,
                color: "#3b82f6",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "AI/ML",
                icon: CpuChipIcon,
                color: "#8b5cf6",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Python",
                icon: CodeBracketIcon,
                color: "#10b981",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                title: "Creative",
                icon: SparklesIcon,
                color: "#f59e0b",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: 2 + index * 0.15,
                  type: "spring",
                  stiffness: 150,
                  damping: 12,
                }}
                whileHover={{
                  scale: 1.15,
                  y: -15,
                  rotate: 5,
                  boxShadow: `0 25px 50px ${item.color}44`,
                  transition: { duration: 0.3 },
                }}
                className="hero-feature-card"
              >
                <motion.div
                  className="hero-feature-icon-wrapper"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.2,
                      rotate: 180,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon
                      className="hero-feature-icon"
                      style={{ color: item.color }}
                    />
                  </motion.div>

                  <motion.div
                    className="hero-icon-ring"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ borderColor: item.color }}
                  />
                </motion.div>

                <motion.div
                  className="hero-feature-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 + index * 0.15 }}
                >
                  {item.title}
                </motion.div>

                <div
                  className={`hero-feature-card-gradient bg-gradient-to-br ${item.gradient}`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8 }}
            className="hero-scroll-indicator"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="hero-scroll-mouse"
            >
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  opacity: [1, 0.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="hero-scroll-wheel"
              />
            </motion.div>
            <motion.span
              className="hero-scroll-text"
              animate={{
                opacity: [0.5, 1, 0.5],
                y: [0, 2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Scroll Down
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Enhanced About Section with Dynamic Animations
function AboutSection() {
  return (
    <section id="about" className="about-main-section">
      <div className="main-container">
        {/* Header with Fade In */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="section-heading-wrapper"
        >
          <motion.h2
            className="section-main-title"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            About Me
          </motion.h2>
          <motion.p
            className="section-description"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Developer, Content Creator, AI Enthusiast
          </motion.p>
        </motion.div>

        <div className="about-content-grid">
          {/* Profile Card with Enhanced Animation */}
          <motion.div
            initial={{ opacity: 0, x: -80, rotateY: -15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
          >
            <motion.div
              className="about-profile-card-wrapper"
              whileHover={{
                y: -8,
                boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="about-profile-header">
                <div className="about-profile-image-container">
                  {/* Animated Glow Effect */}
                  <motion.div
                    className="about-profile-glow-effect"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Profile Photo with Hover Effect */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src="/smsram.jpg"
                      alt="Meher Siva Ram"
                      className="about-profile-photo"
                    />
                  </motion.div>

                  {/* Orbiting Particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="about-profile-particle"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        transformOrigin: `${100 + i * 20}px center`,
                      }}
                    />
                  ))}
                </div>

                <motion.h3
                  className="about-profile-name"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Meher Siva Ram
                </motion.h3>

                <motion.p
                  className="about-profile-title"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  AI & ML Student | YouTuber | Developer
                </motion.p>
              </div>

              <motion.p
                className="about-profile-bio-text"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                Hey there! I&apos;m Meher Siva Ram, a passionate developer and
                content creator focused on making technology accessible to
                everyone. Through my YouTube channel SMSRam, I share coding
                tutorials, AI projects, and tech insights.
              </motion.p>

              <motion.p
                className="about-profile-bio-text"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                I&apos;m currently pursuing studies in Artificial Intelligence
                and Machine Learning, while building open-source projects and
                exploring the creative side of technology. My goal is to inspire
                and help others learn to code and build amazing things.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Timeline with Stagger Animation */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
          >
            <div className="about-timeline-list">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  <motion.div
                    className="about-timeline-card"
                    whileHover={{
                      x: 10,
                      boxShadow: "0 15px 30px rgba(37, 99, 235, 0.2)",
                      borderColor: "#2563eb",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="about-timeline-card-content">
                      <div className="about-timeline-icon-wrapper">
                        <motion.div
                          className="about-timeline-icon-circle"
                          whileHover={{
                            scale: 1.1,
                            rotate: 360,
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <motion.div
                            animate={{
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <item.icon className="standard-icon" />
                          </motion.div>
                        </motion.div>

                        {/* Pulsing Ring */}
                        <motion.div
                          className="timeline-pulse-ring"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.3,
                          }}
                        />
                      </div>

                      <div className="about-timeline-text-content">
                        <div className="about-timeline-header">
                          <motion.span
                            className="about-timeline-year"
                            whileHover={{ scale: 1.1 }}
                          >
                            {item.year}
                          </motion.span>
                          <motion.h4
                            className="about-timeline-event-title"
                            whileHover={{ x: 5 }}
                          >
                            {item.title}
                          </motion.h4>
                        </div>
                        <p className="about-timeline-description">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Skills Section with Grid Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="about-skills-section"
        >
          <motion.h3
            className="about-skills-heading"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Skills & Technologies
          </motion.h3>

          <div className="about-skills-grid">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <motion.div
                  className="about-skill-category-card"
                  whileHover={{
                    y: -8,
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h4
                    className="about-skill-category-name"
                    whileHover={{ x: 5 }}
                  >
                    {skillGroup.category}
                  </motion.h4>

                  <div className="about-skill-tags-wrapper">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        className="about-skill-tag"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.1 + skillIndex * 0.05,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.15,
                          y: -3,
                        }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Enhanced Contact Section with Dynamic Animations
function ContactSection({ formData, handleSubmit, handleChange }) {
  const [focusedField, setFocusedField] = React.useState(null);

  return (
    <section id="contact" className="contact-main-section">
      <div className="main-container">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-heading-wrapper"
        >
          <motion.h2
            className="section-main-title"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Get In Touch
          </motion.h2>
          <motion.p
            className="section-description"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Let&apos;s collaborate and build something amazing together
          </motion.p>
        </motion.div>

        <div className="contact-content-grid">
          {/* Form Card with Enhanced Animation */}
          <motion.div
            initial={{ opacity: 0, x: -80, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
          >
            <motion.div
              className="contact-form-card"
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)",
              }}
            >
              <form onSubmit={handleSubmit} className="contact-form-wrapper">
                {/* Name Field */}
                <motion.div
                  className="contact-form-field"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="name" className="contact-form-label">
                    <motion.span
                      animate={{
                        color: focusedField === "name" ? "#2563eb" : "#374151",
                      }}
                    >
                      Name
                    </motion.span>
                  </label>
                  <motion.input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your name"
                    required
                    className="contact-form-input"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div
                  className="contact-form-field"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="email" className="contact-form-label">
                    <motion.span
                      animate={{
                        color: focusedField === "email" ? "#2563eb" : "#374151",
                      }}
                    >
                      Email
                    </motion.span>
                  </label>
                  <motion.input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your.email@example.com"
                    required
                    className="contact-form-input"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>

                {/* Message Field */}
                <motion.div
                  className="contact-form-field"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="message" className="contact-form-label">
                    <motion.span
                      animate={{
                        color:
                          focusedField === "message" ? "#2563eb" : "#374151",
                      }}
                    >
                      Message
                    </motion.span>
                  </label>
                  <motion.textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Tell me about your project or just say hi..."
                    rows={6}
                    required
                    className="contact-form-textarea"
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="base-button button-large-size contact-submit-button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Send className="standard-icon" />
                  </motion.div>
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </motion.div>

          {/* Info Cards with Stagger Animation */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
            className="contact-info-cards-wrapper"
          >
            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="contact-info-card"
            >
              <div className="contact-info-card-content">
                <motion.div
                  className="contact-info-icon-wrapper"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Mail className="standard-icon" />
                </motion.div>
                <div>
                  <h3 className="contact-info-heading">Email</h3>
                  <motion.p
                    className="contact-info-text"
                    whileHover={{ x: 5, color: "#2563eb" }}
                  >
                    smsram@example.com
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="contact-info-card"
            >
              <div className="contact-info-card-content">
                <motion.div
                  className="contact-info-icon-wrapper"
                  whileHover={{ scale: 1.1 }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MapPin className="standard-icon" />
                </motion.div>
                <div>
                  <h3 className="contact-info-heading">Location</h3>
                  <p className="contact-info-text">
                    Remote / Available Worldwide
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Collaboration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="contact-info-card"
            >
              <div className="contact-info-card-content">
                <motion.div
                  className="contact-info-icon-wrapper"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <MessageSquare className="standard-icon" />
                </motion.div>
                <div>
                  <h3 className="contact-info-heading">
                    Open for Collaborations
                  </h3>
                  <p className="contact-info-text">
                    Sponsorships, partnerships, and project collaborations
                    welcome
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Subscribe Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="contact-subscribe-card"
            >
              <motion.h3
                className="contact-subscribe-title"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Join the Community
              </motion.h3>
              <p className="contact-subscribe-description">
                Subscribe to get the latest tutorials and updates
              </p>
              <div className="contact-subscribe-form">
                <input
                  placeholder="Enter your email"
                  className="contact-form-input contact-subscribe-input"
                />
                <motion.button
                  className="base-button contact-subscribe-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Enhanced Footer Section with Dynamic Animations
function FooterSection({ currentYear, footerLinks, scrollToTop }) {
  return (
    <footer className="main-footer">
      <div className="footer-container-wrapper">
        <div className="footer-columns-grid">
          {/* Brand Section */}
          <motion.div
            className="footer-brand-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 2 }}
              className="footer-brand-logo"
            >
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                SMSRam
              </motion.span>
            </motion.div>

            <motion.p
              className="footer-brand-tagline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Empowering developers with quality tutorials and open-source
              projects.
            </motion.p>

            <div className="footer-social-links-wrapper">
              <motion.a
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href="https://youtube.com/@smsram"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link-item youtube-link"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Youtube className="standard-icon" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href="https://github.com/smsram"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link-item github-link"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Github className="standard-icon" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href="https://instagram.com/smsram"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link-item instagram-link"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Instagram className="standard-icon" />
              </motion.a>
            </div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links], columnIndex) => (
            <motion.div
              key={title}
              className="footer-links-column"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: columnIndex * 0.1 }}
            >
              <h3 className="footer-column-heading">{title} Links</h3>
              <ul className="footer-links-list">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: columnIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <motion.a
                      href="#"
                      className="footer-link-item"
                      whileHover={{ x: 5, color: "#2563eb" }}
                    >
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section with Separator */}
        <motion.div
          className="footer-bottom-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.p
            className="footer-copyright-text"
            whileHover={{ scale: 1.05 }}
            suppressHydrationWarning
          >
            © {currentYear} SMSRam. Made with{" "}
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              style={{ display: "inline-flex" }}
            >
              <Heart className="footer-heart-icon" />
            </motion.span>{" "}
            for the dev community
          </motion.p>

          <div className="footer-legal-links">
            <motion.a
              href="#"
              className="footer-legal-link"
              whileHover={{ scale: 1.05, color: "#2563eb" }}
            >
              Privacy Policy
            </motion.a>
            <span className="footer-legal-divider">•</span>
            <motion.a
              href="#"
              className="footer-legal-link"
              whileHover={{ scale: 1.05, color: "#2563eb" }}
            >
              Terms of Service
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button - Enhanced */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="scroll-top-button-wrapper"
        whileHover={{ scale: 1.1 }}
      >
        <motion.button
          onClick={scrollToTop}
          className="scroll-top-button"
          whileHover={{
            scale: 1.15,
            boxShadow: "0 20px 40px rgba(37, 99, 235, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <motion.div
            animate={{ rotate: [0, -20, 20, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          >
            <ArrowUp className="standard-icon" />
          </motion.div>
        </motion.button>
      </motion.div>
    </footer>
  );
}
