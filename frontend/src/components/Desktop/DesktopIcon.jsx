import { motion } from 'framer-motion'
import { useDesktopStore } from '../../store/desktopStore'
import { playSound } from '../../utils/sounds'
import styles from './DesktopIcon.module.css'

export default function DesktopIcon({ id, icon, label, onOpen, color }) {
  const { unlock } = useDesktopStore()

  const handleDoubleClick = () => {
    playSound('click')
    onOpen()
    unlock('first-open', 'Explorer!', '🗂️')
  }

  const isImg = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('assets/') || icon.includes('.'))

  // Portfolio app folder style (when color is passed) — plain, no background
  if (color) {
    return (
      <motion.div
        className={styles.appFolder}
        tabIndex={0}
        role="button"
        aria-label={`Open ${label}`}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleDoubleClick()}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <div className={styles.folderIcon}>
          {isImg ? <img src={icon} alt="" className={styles.folderImg} /> : icon}
        </div>
        <span className={styles.folderLabel}>{label}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={styles.icon}
      tabIndex={0}
      role="button"
      aria-label={`Open ${label}`}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleDoubleClick()}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className={styles.iconImg} aria-hidden="true">
        {isImg ? (
          <img src={icon} alt="" className={styles.imgSrc} />
        ) : (
          icon
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </motion.div>
  )
}
