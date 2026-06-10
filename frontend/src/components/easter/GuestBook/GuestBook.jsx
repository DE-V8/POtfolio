import { useState, useEffect } from 'react'
import { playSound } from '../../../utils/sounds'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './GuestBook.module.css'

const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

const PRESETS = [
  { id: 1, name: 'Ash Ketchum', msg: 'Snorlax, wake up! We need to train!', date: '2026-06-01', color: '#ffeb3b' },
  { id: 2, name: 'Misty', msg: 'Love the desktop layout. Snorlax theme is so cute! 🌊', date: '2026-06-03', color: '#ff9800' },
  { id: 3, name: 'Professor Oak', msg: 'Fascinating! A portfolio operating system. Keep up the scientific coding work!', date: '2026-06-05', color: '#e91e63' }
]

export default function GuestBook() {
  const { unlock } = useDesktopStore()
  const [notes, setNotes] = useState([])
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [color, setColor] = useState('#ffeb3b') // default yellow
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)

  // Fetch from Strapi or fallback to localStorage
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${BASE}/api/guestbooks?sort=createdAt:desc`)
      if (!res.ok) throw new Error('Failed to fetch from Strapi')
      const json = await res.json()
      
      // Support both Strapi v4 (.attributes) and Strapi v5 (flat) shapes
      const fetchedNotes = json.data.map(item => {
        const attrs = item.attributes || item
        return {
          id: item.id,
          name: attrs.name,
          msg: attrs.msg,
          color: attrs.color || '#ffeb3b',
          date: attrs.date || new Date(attrs.createdAt).toISOString().split('T')[0]
        }
      })
      
      setNotes(fetchedNotes)
      setIsFallback(false)
    } catch (err) {
      console.warn('Strapi offline or guestbooks failed to load, using localStorage:', err.message)
      const saved = localStorage.getItem('debuuu-guestbook')
      if (saved) {
        setNotes(JSON.parse(saved))
      } else {
        setNotes(PRESETS)
      }
      setIsFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !msg) {
      playSound('error')
      return
    }

    const payload = {
      name,
      msg,
      color,
      date: new Date().toISOString().split('T')[0]
    }

    // Try sending to Strapi first
    let success = false
    try {
      const res = await fetch(`${BASE}/api/guestbooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: payload })
      })
      if (res.ok) {
        success = true
        await fetchNotes() // reload list
      }
    } catch (err) {
      console.error('Failed to post entry to Strapi, falling back to local:', err)
    }

    // Fallback if Strapi is offline or post failed
    if (!success) {
      const newNote = {
        id: Date.now(),
        ...payload
      }
      const nextNotes = [newNote, ...notes]
      setNotes(nextNotes)
      localStorage.setItem('debuuu-guestbook', JSON.stringify(nextNotes))
    }

    setName('')
    setMsg('')
    playSound('notification')
    unlock('guestbook-post', 'Guestbook Signer', '📒')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.sidebar}>
        <h4>Sign the Guestbook</h4>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="gb-name">Name:</label>
            <input
              id="gb-name"
              type="text"
              className="xp-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="gb-msg">Message:</label>
            <textarea
              id="gb-msg"
              className="xp-input"
              style={{ minHeight: 60, resize: 'vertical' }}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              required
            />
          </div>

          <div className={styles.colorSelect}>
            <span style={{ fontSize: 11, fontWeight: 'bold' }}>Color:</span>
            <div className={styles.colorGrid}>
              {['#ffeb3b', '#ff9800', '#e91e63', '#4caf50', '#00bcd4'].map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorBox} ${color === c ? styles.selectedColor : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="xp-btn xp-btn-primary" style={{ marginTop: 8 }}>
            Post Sticky Note
          </button>
        </form>
      </div>

      <div className={styles.board}>
        {notes.map(note => (
          <div key={note.id} className={styles.sticky} style={{ backgroundColor: note.color }}>
            <p className={styles.msg}>&ldquo;{note.msg}&rdquo;</p>
            <div className={styles.meta}>
              <span className={styles.name}>— {note.name}</span>
              <span className={styles.date}>{note.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
