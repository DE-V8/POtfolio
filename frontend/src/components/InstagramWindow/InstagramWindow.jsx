import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './InstagramWindow.module.css'

function extractHandle(url) {
  if (!url) return 'ifdebuu'
  try {
    return new URL(url).pathname.replace(/\//g, '') || url
  } catch {
    return url.replace(/\//g, '')
  }
}

// Placeholder post grid — 9 slots styled like Instagram
const POST_COLORS = [
  '#ee2a7b', '#f9ce34', '#6228d7',
  '#ee2a7b88', '#833ab4', '#fd1d1d',
  '#fcb045', '#6228d788', '#ee2a7b66',
]
const POST_ICONS = ['🎨', '🎬', '✨', '📷', '🌙', '🎭', '💫', '🖌️', '🎞️']

export default function InstagramWindow({ instagramUrl, handle: handleProp }) {
  const handle = handleProp || extractHandle(instagramUrl)
  const profileUrl = `https://www.instagram.com/${handle}/`
  const [hoveredPost, setHoveredPost] = useState(null)

  const openProfile = () =>
    window.open(profileUrl, '_blank', 'noopener,noreferrer')

  return (
    <div className={styles.wrap}>

      {/* ── Header gradient bar ── */}
      <div className={styles.gradientBar} />

      {/* ── Profile section ── */}
      <div className={styles.profile}>

        {/* Avatar with story ring */}
        <div className={styles.avatarRing} onClick={openProfile} title="View on Instagram">
          <div className={styles.avatarInner}>
            <span className={styles.avatarEmoji}>📸</span>
          </div>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.handleRow}>
            <span className={styles.handle}>@{handle}</span>
            <motion.button
              className={styles.followBtn}
              onClick={openProfile}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Follow
            </motion.button>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <Stat label="Posts"     value="—" />
            <Stat label="Followers" value="—" />
            <Stat label="Following" value="—" />
          </div>

          <p className={styles.bio}>
            View the full profile on Instagram ✨
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Posts grid label ── */}
      <div className={styles.postsLabel}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
        POSTS
      </div>

      {/* ── Post grid ── */}
      <div className={styles.grid}>
        {POST_COLORS.map((color, i) => (
          <motion.div
            key={i}
            className={styles.post}
            style={{ background: color }}
            onHoverStart={() => setHoveredPost(i)}
            onHoverEnd={() => setHoveredPost(null)}
            onClick={openProfile}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 22 }}
          >
            <span className={styles.postIcon}>{POST_ICONS[i]}</span>
            {hoveredPost === i && (
              <motion.div
                className={styles.postOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span>♥</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Open button ── */}
      <div className={styles.footer}>
        <motion.button
          className={styles.openBtn}
          onClick={openProfile}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2.2"/>
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2.2"/>
            <circle cx="17.5" cy="6.5" r="1.4" fill="white"/>
          </svg>
          Open @{handle} on Instagram ↗
        </motion.button>
      </div>

    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  )
}
