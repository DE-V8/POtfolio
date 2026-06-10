import { useState, useEffect } from 'react'
import { playSound } from '../../../utils/sounds'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './GuestBook.module.css'

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

  // Load from localStorage or Presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('debuuu-guestbook')
    if (saved) {
      setNotes(JSON.parse(saved))
    } else {
      setNotes(PRESETS)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !msg) {
      playSound('error')
      return
    }

    const newNote = {
      id: Date.now(),
      name,
      msg,
      date: new Date().toISOString().split('T')[0],
      color
    }

    const nextNotes = [newNote, ...notes]
    setNotes(nextNotes)
    localStorage.setItem('debuuu-guestbook', JSON.stringify(nextNotes))

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
