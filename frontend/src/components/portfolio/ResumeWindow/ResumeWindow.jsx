import { useDesktopStore } from '../../../store/desktopStore'
import styles from './ResumeWindow.module.css'

export default function ResumeWindow() {
  const { unlock } = useDesktopStore()
  return (
    <div className={styles.wrap}>
      <div className={styles.docHeader}>
        <span>📄 Debjit_Debnath_Resume.docx</span>
        <a
          className="xp-btn xp-btn-primary"
          href="/resume.pdf"
          download
          onClick={() => unlock('resume-dl', 'Are You Hiring?', '📄')}
          style={{ fontSize: 11, padding: '3px 12px', textDecoration: 'none', display: 'inline-block' }}
        >
          💾 Download PDF
        </a>
      </div>
      <div className={styles.doc}>
        <h1 style={{ fontSize: 20, marginBottom: 4, color: '#0a246a' }}>Debjit Debnath</h1>
        <p style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>
          Creative Developer · Digital Artist · Video Editor · 3D Artist<br/>
          📧 your@email.com &nbsp;|&nbsp; 🌐 debuuu.github.io
        </p>
        <hr style={{ marginBottom: 12, borderColor: '#0a246a' }} />

        <h2 style={{ fontSize: 13, color: '#0a246a', marginBottom: 6 }}>About</h2>
        <p style={{ fontSize: 11, lineHeight: 1.7, marginBottom: 14 }}>
          A multi-disciplinary creative professional with expertise spanning digital art, motion design,
          3D modeling, UI/UX design, and software development. I bring ideas to life visually and technically.
        </p>

        <h2 style={{ fontSize: 13, color: '#0a246a', marginBottom: 6 }}>Skills</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {['Adobe Photoshop','Adobe Premiere','After Effects','Blender','Figma','React','JavaScript','HTML/CSS','Node.js','Three.js'].map(s => (
            <span key={s} className="tag" style={{ fontSize: 10 }}>{s}</span>
          ))}
        </div>

        <h2 style={{ fontSize: 13, color: '#0a246a', marginBottom: 6 }}>Experience</h2>
        <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>
          Add your experience here — edit content.json or update Strapi's About single type.
        </p>

        <div style={{ marginTop: 24, padding: 10, background: '#f0f4ff', border: '1px solid #c0c8f0', fontSize: 10, color: '#555' }}>
          💡 <strong>Tip:</strong> Replace this content with your actual resume in the Strapi admin panel or upload a real PDF to <code>public/resume.pdf</code>
        </div>
      </div>
    </div>
  )
}
