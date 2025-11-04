"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, Code, Mail, Info, X, Briefcase } from "lucide-react";
import { useEffect } from "react";
import "../style/cards.css";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // Auto-close when pathname changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname, onClose]);

  const isActive = (path) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = () => {
    onClose();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleCloseClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleOverlayClick();
          }}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        id="sidebar"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar header with close button */}
        <div className="sidebar-header">
          <button
            className="sidebar-close"
            onClick={handleCloseClick}
            aria-label="Close sidebar"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          <Link
            href="/dashboard"
            className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
            onClick={handleLinkClick}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/videos"
            className={`sidebar-link ${
              isActive("/dashboard/videos") ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <Video size={20} />
            <span>Videos</span>
          </Link>

          <Link
            href="/dashboard/source-codes"
            className={`sidebar-link ${
              isActive("/dashboard/source-codes") ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <Code size={20} />
            <span>Source Codes</span>
          </Link>

          <Link
            href="/dashboard/projects"
            className={`sidebar-link ${
              isActive("/dashboard/projects") ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <Briefcase size={20} />
            <span>Projects</span>
          </Link>

          <Link
            href="/dashboard/about"
            className={`sidebar-link ${
              isActive("/dashboard/about") ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <Info size={20} />
            <span>About</span>
          </Link>

          <Link
            href="/dashboard/contact"
            className={`sidebar-link ${
              isActive("/dashboard/contact") ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <Mail size={20} />
            <span>Contact</span>
          </Link>
        </nav>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <p className="sidebar-version">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
