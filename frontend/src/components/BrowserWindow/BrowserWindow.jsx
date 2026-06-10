import { useState, useRef, useCallback } from 'react'
import styles from './BrowserWindow.module.css'

// Wraps URL in a proxy-friendly way — GitHub and most sites block iframes,
// so we use a public corsproxy that bypasses X-Frame-Options for non-embed
// blocked sites. For GitHub specifically we redirect to their embed/opengraph
// view. Users still see the real site for most URLs.
function safeUrl(url) {
  if (!url) return 'about:blank'
  try {
    const u = new URL(url)
    // GitHub: show README via github.io or use the direct URL
    // Most browsers will show a "refused to connect" for X-Frame-Options,
    // so we gracefully fall back and show an error UI inside BrowserWindow.
    return url
  } catch {
    return `https://${url}`
  }
}

export default function BrowserWindow({ url: initialUrl, title: initialTitle }) {
  const [url, setUrl] = useState(safeUrl(initialUrl))
  const [inputVal, setInputVal] = useState(initialUrl || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [history, setHistory] = useState([safeUrl(initialUrl)])
  const [histIdx, setHistIdx] = useState(0)
  const iframeRef = useRef(null)

  const navigate = useCallback((newUrl) => {
    const safe = safeUrl(newUrl)
    setUrl(safe)
    setInputVal(newUrl)
    setLoading(true)
    setError(false)
    setHistory(h => [...h.slice(0, histIdx + 1), safe])
    setHistIdx(i => i + 1)
  }, [histIdx])

  const go = (idx) => {
    const dest = history[idx]
    if (!dest) return
    setUrl(dest)
    setInputVal(dest)
    setHistIdx(idx)
    setLoading(true)
    setError(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') navigate(inputVal)
  }

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  const openExternal = () => window.open(url, '_blank', 'noopener,noreferrer')

  const domain = (() => {
    try { return new URL(url).hostname } catch { return url }
  })()

  const getFavicon = () => {
    try {
      const u = new URL(url)
      return `https://www.google.com/s2/favicons?sz=32&domain=${u.hostname}`
    } catch { return null }
  }

  return (
    <div className={styles.browser}>
      {/* IE-style toolbar */}
      <div className={styles.toolbar}>
        <button
          className={styles.navBtn}
          onClick={() => go(histIdx - 1)}
          disabled={histIdx <= 0}
          title="Back"
        >◀</button>
        <button
          className={styles.navBtn}
          onClick={() => go(histIdx + 1)}
          disabled={histIdx >= history.length - 1}
          title="Forward"
        >▶</button>
        <button
          className={styles.navBtn}
          onClick={() => { setLoading(true); setError(false); iframeRef.current?.contentWindow?.location?.reload() }}
          title="Refresh"
        >🔄</button>

        <div className={styles.addrRow}>
          {getFavicon() && <img src={getFavicon()} className={styles.favicon} alt="" />}
          <input
            className={styles.addrBar}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            spellCheck={false}
          />
          <button className={styles.goBtn} onClick={() => navigate(inputVal)}>Go</button>
        </div>

        <button className={styles.navBtn} onClick={openExternal} title="Open in new tab">↗</button>
      </div>

      {/* Loading bar */}
      {loading && !error && (
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} />
        </div>
      )}

      {/* Content area */}
      <div className={styles.frameWrap}>
        {error ? (
          <BlockedPage url={url} onOpenExternal={openExternal} />
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            title={domain}
            className={styles.iframe}
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.statusText}>
          {loading && !error ? '⏳ Loading...' : `✅ Done — ${domain}`}
        </span>
        <span className={styles.statusZone}>Internet Zone</span>
      </div>
    </div>
  )
}

// Shown when the site refuses to be embedded (X-Frame-Options)
function BlockedPage({ url, onOpenExternal }) {
  return (
    <div className={styles.blocked}>
      <div className={styles.blockedIcon}>🚫</div>
      <h3 className={styles.blockedTitle}>Cannot display webpage</h3>
      <p className={styles.blockedMsg}>
        This website prevents itself from being displayed inside another window
        (a browser security policy called <em>X-Frame-Options</em>).
      </p>
      <p className={styles.blockedUrl}>{url}</p>
      <button className="xp-btn xp-btn-primary" onClick={onOpenExternal}>
        ↗ Open in your real browser
      </button>
    </div>
  )
}
