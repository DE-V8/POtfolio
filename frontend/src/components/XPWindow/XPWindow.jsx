import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../../store/desktopStore'
import { playSound } from '../../utils/sounds'
import styles from './XPWindow.module.css'

const springConfig = { type: 'spring', stiffness: 380, damping: 28 }

export default function XPWindow({ id, title, icon = '🗂️', children, minW = 300, minH = 160, defaultW = 640, defaultH = 480 }) {
  const { windows, closeWindow, minimizeWindow, toggleMaximize, bringToFront, updatePosition } = useDesktopStore()
  const win = windows[id]
  if (!win || win.minimized) return null

  const handleClose = (e) => {
    e.stopPropagation()
    playSound('error')
    closeWindow(id)
  }
  const handleMin = (e) => {
    e.stopPropagation()
    playSound('minimize')
    minimizeWindow(id)
  }
  const handleMax = (e) => {
    e.stopPropagation()
    playSound('maximize')
    toggleMaximize(id)
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.window} ${win.maximized ? styles.maximized : ''}`}
        style={{
          left: win.maximized ? 0 : win.x,
          top: win.maximized ? 0 : win.y,
          width: win.maximized ? '100vw' : (win.w || defaultW),
          height: win.maximized ? `calc(100vh - var(--taskbar-h))` : (win.h || defaultH),
          zIndex: win.zIndex,
          minWidth: minW, minHeight: minH,
        }}
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={springConfig}
        onMouseDown={() => bringToFront(id)}
        drag={!win.maximized}
        dragMomentum={false}
        dragListener={false}
        dragElastic={0}
      >
        {/* Title Bar */}
        <TitleBar
          id={id}
          icon={icon}
          title={title}
          maximized={win.maximized}
          onClose={handleClose}
          onMin={handleMin}
          onMax={handleMax}
          bringToFront={bringToFront}
          updatePosition={updatePosition}
          win={win}
        />

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Draggable Title Bar ──────────────────────────────────────
function TitleBar({ id, icon, title, maximized, onClose, onMin, onMax, bringToFront, updatePosition, win }) {
  const dragRef = useRef(null)
  const startRef = useRef(null)

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return
    if (maximized) return
    bringToFront(id)
    startRef.current = {
      mx: e.clientX, my: e.clientY,
      wx: win.x, wy: win.y
    }

    const onMove = (mv) => {
      const dx = mv.clientX - startRef.current.mx
      const dy = mv.clientY - startRef.current.my
      const nx = Math.max(0, startRef.current.wx + dx)
      const ny = Math.max(0, Math.min(startRef.current.wy + dy, window.innerHeight - 60))
      updatePosition(id, nx, ny)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [id, maximized, win.x, win.y])

  return (
    <div className={styles.titlebar} ref={dragRef} onMouseDown={onMouseDown}>
      <div className={styles.titleLeft}>
        <span className={styles.winIcon}>{icon}</span>
        <span className={styles.winTitle}>{title}</span>
      </div>
      <div className={styles.chrome}>
        <button className={`${styles.chromeBtn} ${styles.minBtn}`} onClick={onMin} title="Minimize">_</button>
        <button className={`${styles.chromeBtn} ${styles.maxBtn}`} onClick={onMax} title="Maximize">□</button>
        <button className={`${styles.chromeBtn} ${styles.closeBtn}`} onClick={onClose} title="Close">✕</button>
      </div>
    </div>
  )
}
