import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../../store/desktopStore'
import { playSound } from '../../utils/sounds'
import styles from './Taskbar.module.css'

export default function Taskbar({ onStartClick }) {
  const { windows, toggleStartMenu, startMenuOpen, openWindow, minimizeWindow, bringToFront, soundEnabled, toggleSound } = useDesktopStore()
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      let h = d.getHours(), m = d.getMinutes()
      const ap = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      setTime(`${h}:${m < 10 ? '0' + m : m} ${ap}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const handleStartClick = (e) => {
    e.stopPropagation()
    playSound('click')
    toggleStartMenu()
  }

  const openWindows = Object.values(windows)

  return (
    <div className={styles.taskbar} onClick={(e) => e.stopPropagation()}>
      {/* Start Button */}
      <motion.button
        className={styles.startBtn}
        onClick={handleStartClick}
        whileTap={{ scale: 0.96 }}
        animate={{ boxShadow: startMenuOpen ? 'inset 2px 2px 4px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.3)' }}
      >
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw3rHOns7jSUSmNbLcc-IqCHx4bPxPlUa_mnVAIr_dnMRUsuZQuohuoNVNvO8a6_Ke8eisd9SdORWmmK_6lF4yhrIZWrmFmKeJlMcttZBM3g9naPyQZQ1IOaV8AjYwrpZC5luLRPY8W7VRmHOHEWFLs0JedSloWabSNOwpCaT7gjM08dCNOKpRo_zrKamnWE2lp_UIls4sB1YRe6ycYC8sBKNQY7vcN0Jr84BZEpGcbUH0wv5u6q1pq9gVrOQgXOA67GxUkFDzcnbU"
          alt="Start"
          className={styles.startLogo}
        />
        <span>Start</span>
      </motion.button>

      {/* Separator */}
      <div className={styles.sep} />

      {/* Open Window Buttons */}
      <div className={styles.winList}>
        <AnimatePresence>
          {openWindows.map(win => (
            <motion.button
              key={win.id}
              className={`${styles.winBtn} ${!win.minimized ? styles.winBtnActive : ''}`}
              onClick={() => {
                if (win.minimized) {
                  useDesktopStore.getState().openWindow({ ...win })
                } else {
                  minimizeWindow(win.id)
                }
              }}
              initial={{ opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <span>{win.icon}</span>
              <span className={styles.winBtnLabel}>{win.title}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* System Tray */}
      <div className={styles.tray}>
        <button
          className={styles.trayBtn}
          onClick={toggleSound}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <div className={styles.traySep} />
        <div className={styles.clock} title={new Date().toLocaleDateString()}>{time}</div>
      </div>
    </div>
  )
}
