import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring gives a slight lag — feels alive, like Snorlax is waddling
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 })

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <motion.div
      className={styles.cursor}
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      {/* Snorlax GIF — place your gif at public/cursor/snorlax.gif */}
      <img
        src="/cursor/snorlax.gif"
        alt=""
        className={styles.gif}
        onError={(e) => {
          // Fallback: show emoji if gif not found
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'block'
        }}
      />
      <span className={styles.fallback} style={{ display: 'none' }}>😴</span>
    </motion.div>
  )
}
