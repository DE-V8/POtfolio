import { useCallback } from 'react'
import { useDesktopStore } from '../store/desktopStore'

/**
 * Returns an `openUrl(url, label?)` function that opens the given URL
 * inside an XP-style BrowserWindow on the desktop.
 *
 * Usage:
 *   const openUrl = useOpenUrl()
 *   openUrl('https://github.com/debuuu', 'GitHub')
 */
export function useOpenUrl() {
  const { openWindow } = useDesktopStore()

  return useCallback((url, label) => {
    // Derive a short window title from the URL when no label given
    let title = label
    if (!title) {
      try {
        title = new URL(url).hostname
      } catch {
        title = url.slice(0, 30)
      }
    }

    const id = `browser-${encodeURIComponent(url).slice(0, 40)}`

    openWindow({
      id,
      title,
      icon: '🌐',
      component: 'BrowserWindow',
      props: { url, title },
      w: 900,
      h: 580,
    })
  }, [openWindow])
}
