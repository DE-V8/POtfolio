import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOpenUrl } from '../../../hooks/useOpenUrl'
import styles from './Lightbox.module.css'

export default function Lightbox({ work, onClose }) {
  const openUrl = useOpenUrl()
  // Add escape key closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const attributes = work.attributes || work
  const coverUrl = attributes.cover?.data?.attributes?.url
    ? `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}${attributes.cover.data.attributes.url}`
    : attributes.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.dialog}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className={styles.titlebar}>
          <div className={styles.titlebarLeft}>
            <span>🖼️</span>
            <span>{attributes.title}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Dialog body */}
        <div className={styles.body}>
          <div className={styles.mediaWrap}>
            {attributes.videoUrl ? (
              <iframe
                title={attributes.title}
                src={attributes.videoUrl.replace('watch?v=', 'embed/')}
                className={styles.video}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={coverUrl} alt={attributes.title} className={styles.image} />
            )}
          </div>

          <div className={styles.details}>
            <h2>{attributes.title}</h2>
            <div className={styles.meta}>
              {attributes.date && <span className={styles.date}>📅 {new Date(attributes.date).toLocaleDateString()}</span>}
              <div className={styles.tags}>
                {attributes.tags && attributes.tags.split(',').map((tag, i) => (
                  <span key={i} className="tag">{tag.trim()}</span>
                ))}
              </div>
            </div>
            <p className={styles.description}>{attributes.description}</p>
            {attributes.projectUrl && (
              <button
                className="xp-btn xp-btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: 10 }}
                onClick={() => openUrl(attributes.projectUrl, attributes.title || 'Project')}
              >
                🌐 Visit Project / View Artwork
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
