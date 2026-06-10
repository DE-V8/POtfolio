import { useRef, useState, useEffect } from 'react'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './MSPaint.module.css'

const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#4000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff8000', '#ff80ff'
]

export default function MSPaint() {
  const { unlock } = useDesktopStore()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState('pencil') // pencil, eraser

  // Set up canvas default size on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 500
      canvas.height = 340
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'debuuu_doodle.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    unlock('paint-download', 'Digital Picasso', '🎨')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        {/* Tool selectors */}
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolBtn} ${tool === 'pencil' ? styles.active : ''}`}
            onClick={() => setTool('pencil')}
            title="Pencil"
          >
            ✏️
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'eraser' ? styles.active : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧽
          </button>
        </div>

        {/* Brush Size */}
        <div className={styles.sizeGroup}>
          <span style={{ fontSize: 10 }}>Size:</span>
          <select value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="xp-input" style={{ width: 50, height: 22, padding: 0 }}>
            <option value="2">2px</option>
            <option value="4">4px</option>
            <option value="8">8px</option>
            <option value="16">16px</option>
            <option value="32">32px</option>
          </select>
        </div>

        <button className="xp-btn" onClick={clearCanvas}>Clear</button>
        <button className="xp-btn xp-btn-primary" onClick={handleDownload}>Save PNG</button>
      </div>

      <div className={styles.workspace}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Colors Grid */}
      <div className={styles.colorPalette}>
        <div className={styles.activeColorBox} style={{ backgroundColor: tool === 'eraser' ? '#ffffff' : color }} />
        <div className={styles.colorsGrid}>
          {COLORS.map((col, i) => (
            <div
              key={i}
              className={`${styles.colorSwatch} ${color === col && tool !== 'eraser' ? styles.selectedSwatch : ''}`}
              style={{ backgroundColor: col }}
              onClick={() => {
                setColor(col)
                setTool('pencil')
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
