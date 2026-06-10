import { useState } from 'react'
import { playSound } from '../../../utils/sounds'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './ContactWindow.module.css'

export default function ContactWindow() {
  const { unlock } = useDesktopStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Wake up Snorlax!',
    message: ''
  })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      playSound('error')
      alert('Please fill out all fields!')
      return
    }

    // Play a happy notification/USB sound
    playSound('notification')
    
    // Perform mailto action or mock success
    const mailtoUri = `mailto:debjitdebnath2978@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Hi Debuuu,\n\n${formData.message}\n\nFrom,\n${formData.name} (${formData.email})`)}`
    window.location.href = mailtoUri

    setSent(true)
    unlock('contact', 'First Contact Made!', '📬')
  }

  return (
    <div className={styles.wrap}>
      {!sent ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.banner}>
            <div className={styles.snorlaxImg}>😴</div>
            <div className={styles.bannerText}>
              <h3>Send a Message to Debuuu</h3>
              <p>Leave a note, a feedback, or a job offer. Snorlax might wake up to read it!</p>
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="contact-name">Your Name:</label>
            <input
              id="contact-name"
              type="text"
              className="xp-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.row}>
            <label htmlFor="contact-email">Your Email:</label>
            <input
              id="contact-email"
              type="email"
              className="xp-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.row}>
            <label htmlFor="contact-subj">Subject:</label>
            <select
              id="contact-subj"
              className="xp-input"
              style={{ height: 26, padding: '2px 4px' }}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            >
              <option value="Wake up Snorlax!">😴 Wake up Snorlax!</option>
              <option value="Job Opportunity">💼 Job Opportunity</option>
              <option value="Collab Request">🚀 Collaboration Request</option>
              <option value="Just saying Hi">👋 Just Saying Hi!</option>
            </select>
          </div>

          <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <label htmlFor="contact-msg" style={{ marginBottom: 4 }}>Message:</label>
            <textarea
              id="contact-msg"
              className="xp-input"
              style={{ minHeight: 100, resize: 'vertical' }}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div className={styles.footer}>
            <button type="submit" className="xp-btn xp-btn-primary">Send Message</button>
            <button type="button" className="xp-btn" onClick={() => setFormData({ name: '', email: '', subject: 'Wake up Snorlax!', message: '' })}>Clear</button>
          </div>
        </form>
      ) : (
        <div className={styles.success}>
          <div className={styles.successIcon}>📬</div>
          <h2>Message Sent!</h2>
          <p>Redirecting to your default email client... If it did not open, please write to:</p>
          <code className={styles.emailCode}>debjitdebnath2978@gmail.com</code>
          <button className="xp-btn" style={{ marginTop: 20 }} onClick={() => setSent(false)}>Send Another Message</button>
        </div>
      )}
    </div>
  )
}
