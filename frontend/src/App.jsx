import { useEffect, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDesktopStore } from './store/desktopStore'
import { useStrapi } from './hooks/useStrapi'

import BootScreen from './components/BootScreen/BootScreen'
import CustomCursor from './components/CustomCursor/CustomCursor'
import DesktopIcon from './components/Desktop/DesktopIcon'
import XPWindow from './components/XPWindow/XPWindow'
import Taskbar from './components/Taskbar/Taskbar'
import StartMenu from './components/StartMenu/StartMenu'
import ContextMenu from './components/ContextMenu/ContextMenu'
import Notifications from './components/Notifications/Notifications'
import Achievements from './components/easter/Achievements/Achievements'
import ScreenSaver from './components/ScreenSaver/ScreenSaver'

// Portfolio Windows
import AboutWindow from './components/portfolio/AboutWindow/AboutWindow'
import ResumeWindow from './components/portfolio/ResumeWindow/ResumeWindow'
import ContactWindow from './components/portfolio/ContactWindow/ContactWindow'
import GalleryWindow from './components/portfolio/GalleryWindow/GalleryWindow'

// Easter Egg Windows
import Terminal from './components/easter/Terminal/Terminal'
import MyComputer from './components/easter/MyComputer/MyComputer'
import RecycleBin from './components/easter/RecycleBin/RecycleBin'
import Notepad from './components/easter/Notepad/Notepad'
import MSPaint from './components/easter/MSPaint/MSPaint'
import Minesweeper from './components/easter/Minesweeper/Minesweeper'
import Solitaire from './components/easter/Solitaire/Solitaire'
import GuestBook from './components/easter/GuestBook/GuestBook'

// Power Features
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import WallpaperPicker from './components/WallpaperPicker/WallpaperPicker'

// Browser / Social Windows
import BrowserWindow from './components/BrowserWindow/BrowserWindow'
import GitHubProfileWindow from './components/GitHubProfileWindow/GitHubProfileWindow'
import InstagramWindow from './components/InstagramWindow/InstagramWindow'

// Konami Code easter egg
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

// Static icons always on desktop
const STATIC_ICONS = [
  { id: 'about',       icon: '👤', label: 'About Me',      component: 'AboutWindow',          x: null, y: null, w: 920, h: 620 },
  { id: 'contact',     icon: '📬', label: 'Contact',       component: 'ContactWindow',        x: null, y: null },
  { id: 'music',       icon: '🎵', label: 'Snorlax Player',component: 'MusicPlayer',          x: null, y: null },
  { id: 'my-computer', icon: '🖥️', label: 'My Computer',  component: 'MyComputer',           x: null, y: null },
  { id: 'recycle',     icon: '🗑️', label: 'Recycle Bin',  component: 'RecycleBin',           x: null, y: null },
  { id: 'terminal',    icon: '⌨️', label: 'cmd.exe',       component: 'Terminal',             x: null, y: null },
  { id: 'notepad',     icon: '📝', label: 'README.txt',    component: 'Notepad',              x: null, y: null },
  { id: 'paint',       icon: '🎨', label: 'MS Paint',      component: 'MSPaint',              x: null, y: null },
  { id: 'minesweeper', icon: '💣', label: 'Minesweeper',   component: 'Minesweeper',          x: null, y: null },
  { id: 'solitaire',   icon: '🃏', label: 'Solitaire',     component: 'Solitaire',            x: null, y: null },
  { id: 'guestbook',   icon: '📒', label: 'Guest Book',    component: 'GuestBook',            x: null, y: null },
  { id: 'achievements',icon: '🏆', label: 'Achievements',  component: 'Achievements',         x: null, y: null },
]

const WINDOW_COMPONENTS = {
  AboutWindow, ResumeWindow, ContactWindow, GalleryWindow,
  Terminal, MyComputer, RecycleBin, Notepad, MSPaint,
  Minesweeper, Solitaire, GuestBook, MusicPlayer, WallpaperPicker,
  Achievements,
  BrowserWindow,
  GitHubProfileWindow,
  InstagramWindow,
}

export default function App() {
  const [booted, setBooted] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const { openWindow, windows, init, unlock, setKonami, konamiActive, screensaverActive, wallpaperUrl } = useDesktopStore()
  const { data, loading, usingFallback } = useStrapi()

  const desktopRef = useRef(null)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const rowHeight = 85
  const colWidth = 85
  const taskbarH = 40
  const padding = 12
  const numRows = Math.max(1, Math.floor((windowHeight - taskbarH - padding * 2) / rowHeight))

  // Konami code detector
  const konamiRef = { seq: [] }
  useEffect(() => {
    let seq = []
    const handler = (e) => {
      seq = [...seq.slice(-9), e.key]
      if (seq.join(',') === KONAMI.join(',')) {
        setKonami(true)
        unlock('konami', 'Secret Discovered!', '🎮')
        setTimeout(() => setKonami(false), 6000)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Screensaver 3-minute idle detector
  const { setScreensaver } = useDesktopStore()
  useEffect(() => {
    let timeoutId

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setScreensaver(true)
      }, 180000) // 3 minutes
    }

    // Event listeners for user activity
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('mousedown', resetTimer)
    window.addEventListener('scroll', resetTimer)
    window.addEventListener('touchstart', resetTimer)

    // Initial start
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('mousedown', resetTimer)
      window.removeEventListener('scroll', resetTimer)
      window.removeEventListener('touchstart', resetTimer)
    }
  }, [setScreensaver])

  // Init store from localStorage
  useEffect(() => { init() }, [])

  // Set default wallpaper from Strapi if none is configured yet
  useEffect(() => {
    if (data?.wallpapers && data.wallpapers.length > 0) {
      const activeUrl = useDesktopStore.getState().wallpaperUrl
      if (!activeUrl) {
        const first = data.wallpapers[0]
        const attrs = first.attributes || first
        const imageMedia = attrs.image?.data || attrs.image
        const imageUrl = imageMedia?.attributes?.url || imageMedia?.url
        if (imageUrl) {
          const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE}${imageUrl}`
          useDesktopStore.getState().setWallpaper(`strapi-${first.id}`, fullUrl)
        }
      }
    }
  }, [data])

  // Right-click context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleOpenWindow = useCallback((id, component, title, icon, props, w, h) => {
    openWindow({ id, component, title, icon, props, w, h })
  }, [openWindow])

  // Dynamic Strapi apps + static icons merged
  const dynamicApps = data?.apps?.map(app => {
    const attrs = app.attributes || app
    const appSlug = attrs.slug || ''
    const appName = attrs.name || 'App'
    
    // Resolve iconImage media first
    let iconVal = '📁'
    const imageMedia = attrs.iconImage?.data || attrs.iconImage
    const mediaUrl = imageMedia?.attributes?.url || imageMedia?.url
    
    if (mediaUrl) {
      iconVal = mediaUrl.startsWith('http') ? mediaUrl : `${BASE}${mediaUrl}`
    } else if (attrs.icon) {
      iconVal = attrs.icon
      // Check if it's an image path
      if (typeof iconVal === 'string' && (iconVal.startsWith('/') || iconVal.includes('.') || iconVal.startsWith('assets/'))) {
        if (!iconVal.startsWith('http') && !iconVal.startsWith('assets/')) {
          iconVal = `${BASE}${iconVal}`
        }
      }
    }

    // Filter works for this app
    const appWorks = data?.works?.filter(w => {
      const wAttrs = w.attributes || w
      const wApp = wAttrs.app?.data || wAttrs.app
      const wAppAttrs = wApp?.attributes || wApp
      return wAppAttrs?.slug === appSlug
    }) || []

    return {
      id: `app-${appSlug || app.id}`,
      icon: iconVal,
      label: appName,
      component: 'GalleryWindow',
      props: { appSlug, appName, works: appWorks }
    }
  }) || []

  // Dynamic browser-shortcut icons from Strapi "Link" collection
  const dynamicLinks = data?.links?.map(link => {
    const attrs = link.attributes || link
    const linkName = attrs.name || 'Link'
    const linkUrl  = attrs.url  || '#'

    let iconVal = '🌐'
    const imageMedia = attrs.iconImage?.data || attrs.iconImage
    const mediaUrl   = imageMedia?.attributes?.url || imageMedia?.url
    if (mediaUrl) {
      iconVal = mediaUrl.startsWith('http') ? mediaUrl : `${BASE}${mediaUrl}`
    } else if (attrs.icon) {
      iconVal = attrs.icon
    }

    return {
      id: `link-${link.id}`,
      icon: iconVal,
      label: linkName,
      component: 'BrowserWindow',
      props: { url: linkUrl, title: linkName }
    }
  }) || []

  // Wallpaper
  const wallpaperStyle = {
    backgroundImage: wallpaperUrl
      ? `url(${wallpaperUrl})`
      : `url(https://lh3.googleusercontent.com/aida-public/AB6AXuAaKYYodda17rfnFG8zRNkr2NQDeAhDDFPyHQ9dgJK7DBLP-upV0octQ14H3s5zwmglsI_YuALi84tBbJkU_i57Vvys1pps_mOZnDVM7BL5h_Jl-5qi2C5A7n_vhjdstQ5AhptWQjUuIE9f7EkLHqDLJzusK3wxaLUVy7NQyNVEDsj3Bvas5SIlTEbHjxGLIU7ghcR0ynHVW0daYW7MFl1uptXQzu4pdHWcauzx8rIelR6Gg3nlpBmXJRhAIGh7X0esZnpFQ6qYnhh1)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  if (!booted) return <BootScreen loading={loading} onDone={() => setBooted(true)} />

  return (
    <div
      ref={desktopRef}
      style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', ...wallpaperStyle }}
      onContextMenu={handleContextMenu}
      onClick={() => {
        setContextMenu(null)
        useDesktopStore.getState().closeStartMenu()
      }}
    >
      {/* Custom Snorlax cursor */}
      <CustomCursor />

      {/* Snorlax ZZZ floaters */}
      <ZzzFloaters />

      {/* Konami overlay */}
      <AnimatePresence>
        {konamiActive && <KonamiOverlay />}
      </AnimatePresence>

      {/* Desktop icons — single unified grid */}
      {loading && <div style={{ position: 'absolute', top: 12, left: 12, color: '#fff', fontSize: 10, zIndex: 10 }}>Loading...</div>}

      {[...dynamicApps, ...dynamicLinks, ...STATIC_ICONS].map((ico, i) => {
        const r    = i % numRows
        const c    = Math.floor(i / numRows)
        const left = padding + c * colWidth
        const top  = padding + r * rowHeight
        return (
          <motion.div
            key={ico.id}
            drag
            dragConstraints={desktopRef}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
            style={{ position: 'absolute', left, top, width: 80, zIndex: 10 }}
          >
            <DesktopIcon
              id={ico.id}
              icon={ico.icon}
              label={ico.label}
              onOpen={() => handleOpenWindow(ico.id, ico.component, ico.label, ico.icon, ico.props || {}, ico.w, ico.h)}
            />
          </motion.div>
        )
      })}

      {/* All Windows */}
      <AnimatePresence>
        {Object.values(windows).map(win => {
          const Component = WINDOW_COMPONENTS[win.component]
          if (!Component) return null
          return (
            <XPWindow key={win.id} id={win.id} title={win.title} icon={win.icon}>
              <Component {...win.props} data={data} windowId={win.id} />
            </XPWindow>
          )
        })}
      </AnimatePresence>

      {/* Taskbar */}
      <Taskbar onStartClick={() => useDesktopStore.getState().toggleStartMenu()} />

      {/* Start Menu */}
      <StartMenu onOpen={handleOpenWindow} data={data} />

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onOpen={handleOpenWindow}
          />
        )}
      </AnimatePresence>

      {/* Notifications */}
      <Notifications usingFallback={usingFallback} />

      {/* Screen Saver */}
      {screensaverActive && <ScreenSaver />}
    </div>
  )
}

// ── ZZZ Floaters ─────────────────────────────────────────────
function ZzzFloaters() {
  const zzzs = ['Z', 'z', 'Z', 'z', 'Zzz']
  return (
    <div style={{ position: 'absolute', left: 60, bottom: 50, pointerEvents: 'none', zIndex: 5 }}>
      {zzzs.map((z, i) => (
        <motion.span
          key={i}
          style={{ position: 'absolute', color: 'rgba(255,255,255,0.55)', fontSize: 13 - i, fontFamily: 'var(--font-pixel)', left: i * 4 }}
          animate={{ y: [0, -70], opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
        >
          {z}
        </motion.span>
      ))}
    </div>
  )
}

// ── Konami Battle Overlay ────────────────────────────────────
function KonamiOverlay() {
  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{ fontSize: 80 }}
        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      >
        😴
      </motion.div>
      <motion.div
        style={{ fontFamily: 'var(--font-pixel)', color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 2 }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        WILD SNORLAX appeared!<br/>
        <span style={{ color: '#7B8FC7', fontSize: 10 }}>Snorlax used REST. It&apos;s super effective!</span>
      </motion.div>
      <motion.div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
        Click anywhere to return to game
      </motion.div>
    </motion.div>
  )
}
