import { motion, AnimatePresence } from 'framer-motion'
import styles from './ContextMenu.module.css'

export default function ContextMenu({ x, y, onClose, onOpen }) {
  const items = [
    { label: 'Refresh', icon: '🔄', action: () => window.location.reload() },
    { label: 'Properties', icon: '🖼️', action: () => onOpen('wallpaper', 'WallpaperPicker', 'Display Properties', '🖼️', {}) },
    { divider: true },
    { label: 'About this PC', icon: '🖥️', action: () => onOpen('my-computer', 'MyComputer', 'My Computer', '🖥️', {}) },
    { label: 'Open Terminal', icon: '⌨️', action: () => onOpen('terminal', 'Terminal', 'cmd.exe', '⌨️', {}) },
    { label: 'Guest Book', icon: '📒', action: () => onOpen('guestbook', 'GuestBook', 'Guest Book', '📒', {}) },
    { divider: true },
    { label: 'New Folder (Empty)', icon: '📁', action: () => {} },
    { label: 'New Regret.txt', icon: '😬', action: () => {} },
  ]

  // Adjust position if near edge
  const adjX = x + 180 > window.innerWidth ? x - 180 : x
  const adjY = y + items.length * 28 > window.innerHeight - 36 ? y - items.length * 28 : y

  return (
    <motion.div
      className={styles.menu}
      style={{ left: adjX, top: adjY }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.1 }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.divider
          ? <div key={i} className={styles.divider} />
          : (
            <div key={i} className={styles.item} onClick={() => { item.action(); onClose() }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )
      )}
    </motion.div>
  )
}
