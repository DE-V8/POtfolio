import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '../../utils/sounds'
import styles from './Notifications.module.css'

export default function Notifications({ usingFallback }) {
  const [bubbles, setBubbles] = useState([])

  // Helper to trigger a notification bubble
  const triggerBubble = (title, text, icon = 'ℹ️') => {
    playSound('notification')
    const id = Date.now()
    setBubbles(prev => [...prev, { id, title, text, icon }])
    
    // Auto remove after 6 seconds
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== id))
    }, 6000)
  }

  useEffect(() => {
    // 1. Alert user if using fallback/Strapi is offline
    if (usingFallback) {
      const timer = setTimeout(() => {
        triggerBubble(
          'Strapi Offline / Cold Start',
          'Snorlax is sleeping so we loaded fallback data. Try deploying Strapi to Render or local start!',
          '💤'
        )
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [usingFallback])

  useEffect(() => {
    // 2. Listen to custom achievement unlock events
    const handleAchievement = (e) => {
      const { title, icon } = e.detail
      triggerBubble(
        'Achievement Unlocked! 🏆',
        `${icon} "${title}" has been added to your profile!`,
        '⭐'
      )
    }

    window.addEventListener('xp-achievement', handleAchievement)
    return () => window.removeEventListener('xp-achievement', handleAchievement)
  }, [])

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            className={styles.bubble}
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            {/* Balloon bubble close button */}
            <button className={styles.closeBtn} onClick={() => setBubbles(prev => prev.filter(x => x.id !== b.id))}>
              ✕
            </button>
            <div className={styles.content}>
              <span className={styles.icon}>{b.icon}</span>
              <div className={styles.textWrap}>
                <h4 className={styles.title}>{b.title}</h4>
                <p className={styles.text}>{b.text}</p>
              </div>
            </div>
            {/* Small pointer at bottom-right for tray alignment */}
            <div className={styles.pointer} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
