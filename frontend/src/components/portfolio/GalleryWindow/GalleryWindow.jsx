import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import GalleryCard from '../GalleryCard/GalleryCard'
import Lightbox from '../Lightbox/Lightbox'
import styles from './GalleryWindow.module.css'

export default function GalleryWindow({ appSlug, appName, works }) {
  const [selectedWork, setSelectedWork] = useState(null)

  // Filter works by the selected appSlug just in case, but they are already pre-filtered by App.jsx
  // If there are no works, display a nice empty state
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3>📁 {appName}</h3>
        <span className={styles.count}>{works.length} object(s) found</span>
      </div>

      {works.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <p>No projects found in this folder.</p>
          <span style={{ fontSize: 10, color: '#999' }}>If this is your first time loading, check if your Strapi API is active or enter items in the admin panel!</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {works.map((work) => (
            <GalleryCard
              key={work.id}
              work={work}
              onClick={() => setSelectedWork(work)}
            />
          ))}
        </div>
      )}

      {/* Lightbox for full screen image/video */}
      <AnimatePresence>
        {selectedWork && (
          <Lightbox
            work={selectedWork}
            onClose={() => setSelectedWork(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
