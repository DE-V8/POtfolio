import { create } from 'zustand'

// ── Desktop / Window Manager Store ──────────────────────────
export const useDesktopStore = create((set, get) => ({
  // Windows
  windows: {},       // { id: { id, title, icon, component, props, minimized, maximized, zIndex, x, y, w, h } }
  topZ: 100,

  openWindow: (config) => {
    const { windows, topZ } = get()
    const newZ = topZ + 1
    if (windows[config.id]) {
      // Already open — un-minimize + bring to front
      set(s => ({
        topZ: newZ,
        windows: {
          ...s.windows,
          [config.id]: { ...s.windows[config.id], minimized: false, zIndex: newZ }
        }
      }))
      return
    }
    set(s => ({
      topZ: newZ,
      windows: {
        ...s.windows,
        [config.id]: {
          id: config.id,
          title: config.title || config.id,
          icon: config.icon || '🗂️',
          component: config.component,
          props: config.props || {},
          minimized: false,
          maximized: false,
          zIndex: newZ,
          x: config.x ?? 80 + Object.keys(s.windows).length * 22,
          y: config.y ?? 60 + Object.keys(s.windows).length * 22,
          w: config.w ?? 640,
          h: config.h ?? 480,
        }
      }
    }))
  },

  closeWindow: (id) => set(s => {
    const next = { ...s.windows }
    delete next[id]
    return { windows: next }
  }),

  minimizeWindow: (id) => set(s => ({
    windows: { ...s.windows, [id]: { ...s.windows[id], minimized: true } }
  })),

  toggleMaximize: (id) => set(s => ({
    windows: { ...s.windows, [id]: { ...s.windows[id], maximized: !s.windows[id].maximized } }
  })),

  bringToFront: (id) => {
    const newZ = get().topZ + 1
    set(s => ({
      topZ: newZ,
      windows: { ...s.windows, [id]: { ...s.windows[id], zIndex: newZ } }
    }))
  },

  updatePosition: (id, x, y) => set(s => ({
    windows: { ...s.windows, [id]: { ...s.windows[id], x, y } }
  })),

  // Theme
  theme: 'luna',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme === 'luna' ? '' : theme)
    set({ theme })
    localStorage.setItem('xp-theme', theme)
  },

  // Wallpaper
  wallpaper: 'snorlax-bliss',
  wallpaperUrl: '',
  setWallpaper: (name, url) => {
    set({ wallpaper: name, wallpaperUrl: url })
    localStorage.setItem('xp-wallpaper', name)
    localStorage.setItem('xp-wallpaper-url', url)
  },

  // Achievements
  achievements: [],
  unlock: (id, title, icon) => {
    const { achievements } = get()
    if (achievements.find(a => a.id === id)) return
    set(s => ({ achievements: [...s.achievements, { id, title, icon, ts: Date.now() }] }))
    // Dispatch event for notification component
    window.dispatchEvent(new CustomEvent('xp-achievement', { detail: { id, title, icon } }))
  },

  // Sounds
  soundEnabled: true,
  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),

  // Screen saver
  screensaverActive: false,
  setScreensaver: (v) => set({ screensaverActive: v }),

  // Start menu
  startMenuOpen: false,
  toggleStartMenu: () => set(s => ({ startMenuOpen: !s.startMenuOpen })),
  closeStartMenu: () => set({ startMenuOpen: false }),

  // Konami
  konamiActive: false,
  setKonami: (v) => set({ konamiActive: v }),

  // Init from localStorage
  init: () => {
    const theme = localStorage.getItem('xp-theme') || 'luna'
    const wallpaper = localStorage.getItem('xp-wallpaper') || 'snorlax-bliss'
    const wallpaperUrl = localStorage.getItem('xp-wallpaper-url') || ''
    if (theme !== 'luna') document.documentElement.setAttribute('data-theme', theme)
    set({ theme, wallpaper, wallpaperUrl })
  }
}))
