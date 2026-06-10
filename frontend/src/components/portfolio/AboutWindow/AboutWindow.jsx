import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDesktopStore } from '../../../store/desktopStore'
import { useOpenUrl } from '../../../hooks/useOpenUrl'
import styles from './AboutWindow.module.css'

const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

function parseGhUser(url) {
  if (!url) return null
  try { return new URL(url).pathname.replace(/^\//, '').split('/')[0] } catch { return url }
}

const SKILLS = [
  { label: 'Photoshop', pct: 90, color: '#31A8FF' },
  { label: 'Video Edit', pct: 85, color: '#EA77FF' },
  { label: '3D Art',    pct: 75, color: '#FF6B35' },
  { label: 'UI/UX',     pct: 80, color: '#5F27CD' },
  { label: 'React/JS',  pct: 78, color: '#61DAFB' },
  { label: 'Blender',   pct: 70, color: '#EA7600' },
]

export default function AboutWindow({ data }) {
  const { unlock, openWindow } = useDesktopStore()
  const openUrl = useOpenUrl()

  // Support both Strapi v4 (data.attributes) and v5 (flat) shapes
  const rawAbout  = data?.about?.data?.attributes || data?.about?.data || data?.about || {}
  const about     = rawAbout

  const name      = about.name     || 'Debjit Debnath'
  const tagline   = about.tagline  || 'Creative Developer · Digital Artist · Video Editor · 3D Artist'
  const bio       = about.bio      || "Hey! I'm Debuuu — a creative developer who lives at the intersection of code and art. I make things that look good and work even better."

  // Avatar image URL
  const avatarMedia = about.avatar?.data || about.avatar
  const avatarUrl   = avatarMedia?.attributes?.url || avatarMedia?.url
  const avatarFull  = avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `${BASE}${avatarUrl}`) : null

  // Resume PDF URL
  const pdfMedia  = about.resumePdf?.data || about.resumePdf
  const pdfUrl    = pdfMedia?.attributes?.url || pdfMedia?.url
  const pdfFull   = pdfUrl ? (pdfUrl.startsWith('http') ? pdfUrl : `${BASE}${pdfUrl}`) : '/resume.pdf'

  useEffect(() => {
    const t = setTimeout(() => unlock('stalker', 'Thorough Reader!', '🔍'), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={styles.wrap}>

      {/* ── LEFT PANEL: Pokédex card ── */}
      <div className={styles.leftPanel}>
        <div className={styles.dexHeader}>
          <span className={styles.dexNum}>#143</span>
          <span className={styles.dexName}>DEBUUU</span>
          <span className={styles.dexType}>Creative / Developer</span>
        </div>

        <div className={styles.avatarFrame}>
          {avatarFull
            ? <img src={avatarFull} alt={name} className={styles.avatarImg} />
            : <span style={{ fontSize: 64 }}>😴</span>
          }
        </div>

        <div className={styles.name}>{name}</div>
        <div className={styles.tagline}>{tagline}</div>

        {/* Socials */}
        <div className={styles.socials}>
          {about.instagram && (
            <button className={styles.social} onClick={() => openUrl(about.instagram, 'Instagram')} title="Instagram">📸</button>
          )}
          {about.twitter && (
            <button className={styles.social} onClick={() => openUrl(about.twitter, 'Twitter / X')} title="Twitter">🐦</button>
          )}
          {about.github && (
            <button
              className={styles.social}
              title="GitHub"
              onClick={() => {
                const username = parseGhUser(about.github)
                openWindow({ id: 'github-profile', title: `GitHub — @${username}`, icon: '🐙', component: 'GitHubProfileWindow', props: { githubUrl: about.github, username }, w: 860, h: 560 })
              }}
            >💻</button>
          )}
          {about.linkedin && (
            <button className={styles.social} onClick={() => openUrl(about.linkedin, 'LinkedIn')} title="LinkedIn">🔗</button>
          )}
        </div>

        {/* Pokédex Bio */}
        <div className={styles.dexEntry}>
          <strong>Pokédex Entry:</strong><br />
          {bio}
        </div>

        {/* Skill bars */}
        <div className={styles.statsLabel}>— BASE STATS —</div>
        <div className={styles.skills}>
          {SKILLS.map((sk, i) => (
            <div key={sk.label} className={styles.skillRow}>
              <span className={styles.skillLabel}>{sk.label}</span>
              <div className={styles.skillBar}>
                <motion.div
                  className={styles.skillFill}
                  style={{ background: sk.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${sk.pct}%` }}
                  transition={{ delay: i * 0.12, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className={styles.skillPct}>{sk.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className={styles.divider} />

      {/* ── RIGHT PANEL: Resume doc ── */}
      <div className={styles.rightPanel}>
        <div className={styles.docHeader}>
          <span>📄 {name.replace(' ', '_')}_Resume.pdf</span>
          <a
            className="xp-btn xp-btn-primary"
            href={pdfFull}
            download
            onClick={() => unlock('resume-dl', 'Are You Hiring?', '📄')}
            style={{ fontSize: 11, padding: '3px 12px', textDecoration: 'none', display: 'inline-block' }}
          >
            💾 Download PDF
          </a>
        </div>

        <div className={`${styles.doc} ${pdfUrl ? styles.docPdfActive : ''}`}>
          {pdfUrl ? (
            /* ── Embedded PDF from Strapi ── */
            <iframe
              src={pdfFull}
              title="Resume PDF"
              className={styles.pdfEmbed}
            />
          ) : (
            /* ── Static fallback content ── */
            <>
              <h1 className={styles.docName}>{name}</h1>
              <p className={styles.docMeta}>
                {tagline}<br />
                {about.github && <span>🐙 {about.github} &nbsp;|&nbsp; </span>}
                {about.linkedin && <span>🔗 {about.linkedin}</span>}
              </p>
              <hr className={styles.docHr} />

              <h2 className={styles.docSection}>About</h2>
              <p className={styles.docText}>{bio}</p>

              <h2 className={styles.docSection}>Skills</h2>
              <div className={styles.skillTags}>
                {SKILLS.map(sk => (
                  <span key={sk.label} className={styles.skillTag}>{sk.label}</span>
                ))}
              </div>

              <h2 className={styles.docSection}>Contact</h2>
              <p className={styles.docText}>
                📧 debjitdebnath2978@gmail.com
                {about.instagram && <span><br />📸 {about.instagram}</span>}
              </p>

              <div className={styles.tip}>
                💡 <strong>Tip:</strong> Upload your resume PDF in Strapi Admin → <strong>About</strong> → <code>resumePdf</code> field to display it here.
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
