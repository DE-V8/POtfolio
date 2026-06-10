import { useEffect, useRef } from 'react'
import { useDesktopStore } from '../store/desktopStore'

// XP Sound URLs with public CDN fallbacks
const SOUNDS = {
  startup:      'https://winxp.vercel.app/sounds/startup.mp3',
  error:        'https://winxp.vercel.app/sounds/error.mp3',
  notify:       'https://winxp.vercel.app/sounds/notify.mp3',
  minimize:     'https://winxp.vercel.app/sounds/minimize.mp3',
  maximize:     'https://winxp.vercel.app/sounds/maximize.mp3',
  recycle:      'https://winxp.vercel.app/sounds/recycle.mp3',
  click:        'https://winxp.vercel.app/sounds/click.mp3',
}

let audioCache = {}

export function playSound(name) {
  const enabled = useDesktopStore.getState().soundEnabled
  if (!enabled) return
  if (!SOUNDS[name]) return
  try {
    if (!audioCache[name]) {
      audioCache[name] = new Audio(SOUNDS[name])
    }
    const audio = audioCache[name].cloneNode()
    audio.volume = 0.4
    audio.play().catch(() => {}) // ignore autoplay restrictions
  } catch (_) {}
}

// Sounds utility (no hook — can be called from anywhere)
export default { playSound }
