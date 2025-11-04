'use client'

import { motion } from 'motion/react'
import "../style/cards.css";

export default function StatCard({ icon: Icon, value, label, variant = 'orange' }) {
  return (
    <motion.div 
      className={`stat-card stat-${variant}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stat-icon">
        <Icon size={28} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  )
}
