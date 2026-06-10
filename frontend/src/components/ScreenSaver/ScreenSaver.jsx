import { useEffect, useRef } from 'react'
import { useDesktopStore } from '../../store/desktopStore'
import styles from './ScreenSaver.module.css'

const NUM_STARS = 300
const SPEED     = 6   // warp speed factor

function initStars(W, H) {
  return Array.from({ length: NUM_STARS }, () => ({
    x: (Math.random() - 0.5) * W,
    y: (Math.random() - 0.5) * H,
    z: Math.random() * W,
    pz: 0,
  }))
}

export default function ScreenSaver() {
  const { setScreensaver, unlock } = useDesktopStore()
  const canvasRef = useRef(null)
  const starsRef  = useRef([])

  // Wake up on any activity
  useEffect(() => {
    const wakeUp = () => {
      setScreensaver(false)
      unlock('first-boot', 'First Boot', '😴')
    }
    window.addEventListener('mousemove', wakeUp)
    window.addEventListener('keydown',   wakeUp)
    window.addEventListener('click',     wakeUp)
    return () => {
      window.removeEventListener('mousemove', wakeUp)
      window.removeEventListener('keydown',   wakeUp)
      window.removeEventListener('click',     wakeUp)
    }
  }, [setScreensaver, unlock])

  // Starfield canvas loop
  useEffect(() => {
    const SNORLAX_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw3rHOns7jSUSmNbLcc-IqCHx4bPxPlUa_mnVAIr_dnMRUsuZQuohuoNVNvO8a6_Ke8eisd9SdORWmmK_6lF4yhrIZWrmFmKeJlMcttZBM3g9naPyQZQ1IOaV8AjYwrpZC5luLRPY8W7VRmHOHEWFLs0JedSloWabSNOwpCaT7gjM08dCNOKpRo_zrKamnWE2lp_UIls4sB1YRe6ycYC8sBKNQY7vcN0Jr84BZEpGcbUH0wv5u6q1pq9gVrOQgXOA67GxUkFDzcnbU'
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight

    starsRef.current = initStars(W, H)

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      starsRef.current = initStars(W, H)
    }
    window.addEventListener('resize', onResize)

    // Preload Snorlax image
    const snorlaxImg = new Image()
    snorlaxImg.crossOrigin = 'anonymous'
    snorlaxImg.src = SNORLAX_URL

    let animId

    const draw = () => {
      // Deep space background with trailing fade
      ctx.fillStyle = 'rgba(0, 0, 8, 0.25)'
      ctx.fillRect(0, 0, W, H)

      const cx = W / 2
      const cy = H / 2

      for (const star of starsRef.current) {
        star.pz = star.z
        star.z -= SPEED

        if (star.z <= 0) {
          star.x  = (Math.random() - 0.5) * W
          star.y  = (Math.random() - 0.5) * H
          star.z  = W
          star.pz = W
        }

        // Project 3D → 2D
        const sx  = (star.x / star.z)  * W + cx
        const sy  = (star.y / star.z)  * H + cy
        const px  = (star.x / star.pz) * W + cx
        const py  = (star.y / star.pz) * H + cy

        const size      = Math.max(0.3, (1 - star.z / W) * 3.5)
        const brightness = 1 - star.z / W // 0 (far) → 1 (close)

        // Star trail line
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = `rgba(${180 + brightness * 75}, ${200 + brightness * 55}, 255, ${brightness * 0.85})`
        ctx.lineWidth   = size * 0.7
        ctx.stroke()

        // Star dot
        ctx.beginPath()
        ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 235, 255, ${Math.min(1, brightness * 1.4)})`
        ctx.fill()
      }

      // Snorlax image watermark in center
      if (snorlaxImg.complete && snorlaxImg.naturalWidth > 0) {
        const size = Math.min(W, H) * 0.22
        ctx.save()
        ctx.globalAlpha = 0.10
        ctx.drawImage(snorlaxImg, cx - size / 2, cy - size / 2, size, size)
        ctx.restore()
      }
      // "SNORLAX XP" label
      ctx.save()
      ctx.globalAlpha = 0.07
      ctx.fillStyle   = '#fff'
      ctx.font        = '12px monospace'
      ctx.textAlign   = 'center'
      ctx.letterSpacing = '6px'
      ctx.fillText('SNORLAX XP', cx, cy + Math.min(W, H) * 0.13)
      ctx.restore()

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.info}>Move mouse or press any key to wake up</div>
    </div>
  )
}
