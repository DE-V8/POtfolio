import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../../store/desktopStore'
import styles from './StartMenu.module.css'

const MENU_APPS = [
  { id: 'about',       icon: '👤', label: 'About Me',       component: 'AboutWindow', w: 920, h: 620 },
  { id: 'contact',     icon: '📬', label: 'Contact Me',     component: 'ContactWindow' },
  { id: 'music',       icon: '🎵', label: 'Snorlax Player', component: 'MusicPlayer' },
  { id: 'guestbook',   icon: '📒', label: 'Guest Book',     component: 'GuestBook' },
]
const MENU_TOOLS = [
  { id: 'terminal',    icon: '⌨️', label: 'cmd.exe',        component: 'Terminal' },
  { id: 'my-computer', icon: '🖥️', label: 'My Computer',   component: 'MyComputer' },
  { id: 'notepad',     icon: '📝', label: 'Notepad',        component: 'Notepad' },
  { id: 'paint',       icon: '🎨', label: 'MS Paint',       component: 'MSPaint' },
  { id: 'minesweeper', icon: '💣', label: 'Minesweeper',    component: 'Minesweeper' },
  { id: 'solitaire',   icon: '🃏', label: 'Solitaire',      component: 'Solitaire' },
  { id: 'recycle',     icon: '🗑️', label: 'Recycle Bin',   component: 'RecycleBin' },
  { id: 'wallpaper',   icon: '🖼️', label: 'Display Props', component: 'WallpaperPicker' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } }
}
const item = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0 }
}

export default function StartMenu({ onOpen, data }) {
  const { startMenuOpen, closeStartMenu, setTheme, theme } = useDesktopStore()
  const THEMES = ['luna','silver','olive','dark']

  const handleOpen = (app) => {
    closeStartMenu()
    onOpen(app.id, app.component, app.label, app.icon, app.props || {}, app.w, app.h)
  }

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <motion.div
          className={styles.menu}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw3rHOns7jSUSmNbLcc-IqCHx4bPxPlUa_mnVAIr_dnMRUsuZQuohuoNVNvO8a6_Ke8eisd9SdORWmmK_6lF4yhrIZWrmFmKeJlMcttZBM3g9naPyQZQ1IOaV8AjYwrpZC5luLRPY8W7VRmHOHEWFLs0JedSloWabSNOwpCaT7gjM08dCNOKpRo_zrKamnWE2lp_UIls4sB1YRe6ycYC8sBKNQY7vcN0Jr84BZEpGcbUH0wv5u6q1pq9gVrOQgXOA67GxUkFDzcnbU" alt="avatar" className={styles.avatar} />
            <div>
              <div className={styles.username}>Debjit Debnath</div>
              <div className={styles.usertag}>@debuuu</div>
            </div>
          </div>

          <div className={styles.body}>
            {/* Left col — portfolio */}
            <motion.div className={styles.col} variants={container} initial="hidden" animate="show">
              <div className={styles.colLabel}>Portfolio</div>
              {MENU_APPS.map(app => (
                <motion.div key={app.id} className={styles.menuItem} variants={item} onClick={() => handleOpen(app)}>
                  <span>{app.icon}</span> {app.label}
                </motion.div>
              ))}
              <div className={styles.divider} />

              {/* Dynamic Strapi apps */}
              {data?.apps?.map(a => (
                <motion.div
                  key={a.id}
                  className={styles.menuItem}
                  variants={item}
                  onClick={() => handleOpen({
                    id: `app-${a.attributes?.slug}`,
                    icon: a.attributes?.icon,
                    label: a.attributes?.name,
                    component: 'GalleryWindow',
                    props: { appSlug: a.attributes?.slug, appName: a.attributes?.name, works: data?.works?.filter(w => w.attributes?.app?.data?.attributes?.slug === a.attributes?.slug) || [] }
                  })}
                >
                  <span>{a.attributes?.icon}</span> {a.attributes?.name}
                </motion.div>
              ))}
            </motion.div>

            {/* Right col — tools + themes */}
            <motion.div className={`${styles.col} ${styles.colRight}`} variants={container} initial="hidden" animate="show">
              <div className={styles.colLabel}>Tools</div>
              {MENU_TOOLS.map(app => (
                <motion.div key={app.id} className={styles.menuItem} variants={item} onClick={() => handleOpen(app)}>
                  <span>{app.icon}</span> {app.label}
                </motion.div>
              ))}

              <div className={styles.divider} />
              <div className={styles.colLabel}>Theme</div>
              <div className={styles.themes}>
                {THEMES.map(t => (
                  <button key={t} className={`${styles.themeBtn} ${theme === t ? styles.themeBtnActive : ''}`} onClick={() => setTheme(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.shutdownBtn} onClick={() => { closeStartMenu(); window.location.reload() }}>
              🔄 Restart
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
