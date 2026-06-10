import { useState, useRef } from 'react'
import styles from './GalleryCard.module.css'

export default function GalleryCard({ work, onClick }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const tiltX = (y / (rect.height / 2)) * -10 // tilt max 10deg
    const tiltY = (x / (rect.width / 2)) * 10
    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const attributes = work.attributes || work
  const coverUrl = attributes.cover?.data?.attributes?.url
    ? `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}${attributes.cover.data.attributes.url}`
    : attributes.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      <div className={styles.imageWrap}>
        <img src={coverUrl} alt={attributes.title} className={styles.image} />
        {attributes.type && <span className={styles.typeBadge}>{attributes.type}</span>}
      </div>
      <div className={styles.info}>
        <h4 className={styles.title}>{attributes.title}</h4>
        <p className={styles.desc}>{attributes.description}</p>
        <div className={styles.tags}>
          {attributes.tags && attributes.tags.split(',').map((tag, i) => (
            <span key={i} className="tag">{tag.trim()}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
