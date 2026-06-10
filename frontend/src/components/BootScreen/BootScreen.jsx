import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '../../utils/sounds'
import styles from './BootScreen.module.css'

const STEPS = [
  { pct: 8,  msg: 'Starting Snorlax OS...' },
  { pct: 22, msg: 'Loading creative assets...' },
  { pct: 40, msg: 'Initialising portfolio modules...' },
  { pct: 58, msg: 'Waking up Snorlax...' },
  { pct: 72, msg: 'Rendering your imagination...' },
  { pct: 88, msg: 'Almost there... Zzz...' },
  { pct: 100, msg: 'Welcome, Debuuu.' },
]

export default function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Starting up...')
  const [visible, setVisible] = useState(true)
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    // Skip boot on subsequent visits in same session
    if (sessionStorage.getItem('booted')) {
      onDone()
      return
    }
    playSound('startup')

    let i = 0
    const interval = setInterval(() => {
      if (i >= STEPS.length) {
        clearInterval(interval)
        setTimeout(() => {
          setVisible(false)
          setTimeout(onDone, 800)
          sessionStorage.setItem('booted', '1')
        }, 600)
        return
      }
      setProgress(STEPS[i].pct)
      setStatus(STEPS[i].msg)
      setStepIdx(i)
      i++
    }, 420)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.boot}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Floating XP particles */}
          <div className={styles.particles}>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.particle}
                animate={{ y: [-20, -80], opacity: [0, 0.6, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
                style={{ left: `${8 + i * 7}%` }}
              />
            ))}
          </div>

          <div className={styles.inner}>
            {/* Logo */}
            <motion.div
              className={styles.logo}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
              <motion.img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw3rHOns7jSUSmNbLcc-IqCHx4bPxPlUa_mnVAIr_dnMRUsuZQuohuoNVNvO8a6_Ke8eisd9SdORWmmK_6lF4yhrIZWrmFmKeJlMcttZBM3g9naPyQZQ1IOaV8AjYwrpZC5luLRPY8W7VRmHOHEWFLs0JedSloWabSNOwpCaT7gjM08dCNOKpRo_zrKamnWE2lp_UIls4sB1YRe6ycYC8sBKNQY7vcN0Jr84BZEpGcbUH0wv5u6q1pq9gVrOQgXOA67GxUkFDzcnbU"
                alt="Snorlax"
                className={styles.snorlax}
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className={styles.titleWrap}>
                <motion.div
                  className={styles.title}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Snorlax OS
                </motion.div>
                <div className={styles.subtitle}>Portfolio Edition · debuuu</div>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              className={styles.progressWrap}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
                {/* Moving highlight */}
                <motion.div
                  className={styles.progressShine}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <motion.p
                key={status}
                className={styles.status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {status}
              </motion.p>
            </motion.div>

            {/* ZZZ */}
            <div className={styles.zzz}>
              {['Z', 'z', 'Z'].map((z, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [-4, -20], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  style={{ fontSize: 14 - i * 2 }}
                >
                  {z}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
