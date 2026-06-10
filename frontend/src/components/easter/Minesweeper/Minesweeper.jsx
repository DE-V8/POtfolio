import { useState, useEffect } from 'react'
import { playSound } from '../../../utils/sounds'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './Minesweeper.module.css'

const ROWS = 9
const COLS = 9
const MINES = 10

export default function Minesweeper() {
  const { unlock } = useDesktopStore()
  const [grid, setGrid] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)
  const [timer, setTimer] = useState(0)
  const [active, setActive] = useState(false)
  const [minesLeft, setMinesLeft] = useState(MINES)

  // Initialize board
  const initBoard = () => {
    setGameOver(false)
    setWin(false)
    setTimer(0)
    setActive(false)
    setMinesLeft(MINES)

    // Create blank board
    let board = Array(ROWS).fill().map(() => Array(COLS).fill().map(() => ({
      isMine: false,
      revealed: false,
      flagged: false,
      count: 0
    })))

    // Place mines randomly
    let placed = 0
    while (placed < MINES) {
      let r = Math.floor(Math.random() * ROWS)
      let c = Math.floor(Math.random() * COLS)
      if (!board[r][c].isMine) {
        board[r][c].isMine = true
        placed++
      }
    }

    // Calculate counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].isMine) continue
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (r + dr >= 0 && r + dr < ROWS && c + dc >= 0 && c + dc < COLS) {
              if (board[r + dr][c + dc].isMine) count++
            }
          }
        }
        board[r][c].count = count
      }
    }
    setGrid(board)
  }

  useEffect(() => {
    initBoard()
  }, [])

  // Timer tick
  useEffect(() => {
    let interval
    if (active && !gameOver && !win) {
      interval = setInterval(() => {
        setTimer(t => Math.min(t + 1, 999))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [active, gameOver, win])

  const revealCell = (r, c) => {
    if (gameOver || win || grid[r][c].revealed || grid[r][c].flagged) return

    if (!active) setActive(true)

    let nextGrid = [...grid.map(row => [...row])]

    if (nextGrid[r][c].isMine) {
      // Game over!
      nextGrid[r][c].revealed = true
      // Reveal all mines
      nextGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.revealed = true
      }))
      setGrid(nextGrid)
      setGameOver(true)
      playSound('error')
      return
    }

    // Flood fill reveal
    const flood = (row, col) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || nextGrid[row][col].revealed || nextGrid[row][col].flagged) return
      nextGrid[row][col].revealed = true
      if (nextGrid[row][col].count === 0 && !nextGrid[row][col].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(row + dr, col + dc)
          }
        }
      }
    }

    flood(r, c)

    // Check Win
    let unrevealedSafe = 0
    nextGrid.forEach(row => row.forEach(cell => {
      if (!cell.isMine && !cell.revealed) unrevealedSafe++
    }))

    setGrid(nextGrid)

    if (unrevealedSafe === 0) {
      setWin(true)
      playSound('startup') // Win sound!
      unlock('minesweeper-win', 'Minesweeper Sweeper', '💣')
    }
  }

  const flagCell = (e, r, c) => {
    e.preventDefault()
    if (gameOver || win || grid[r][c].revealed) return

    let nextGrid = [...grid.map(row => [...row])]
    const wasFlagged = nextGrid[r][c].flagged
    nextGrid[r][c].flagged = !wasFlagged
    setGrid(nextGrid)
    setMinesLeft(m => m + (wasFlagged ? 1 : -1))
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.gameWindow}>
        {/* Scorebar */}
        <div className={styles.scorebar}>
          <div className={styles.lcd}>{String(minesLeft).padStart(3, '0')}</div>
          <button className={styles.face} onClick={initBoard}>
            {win ? '😎' : gameOver ? '😵' : '😊'}
          </button>
          <div className={styles.lcd}>{String(timer).padStart(3, '0')}</div>
        </div>

        {/* Board */}
        <div className={styles.board}>
          {grid.map((row, r) => (
            <div key={r} className={styles.row}>
              {row.map((cell, c) => {
                let cellClass = styles.cell
                let content = ''

                if (cell.revealed) {
                  cellClass += ` ${styles.revealed}`
                  if (cell.isMine) {
                    content = '💣'
                    cellClass += ` ${styles.mine}`
                  } else if (cell.count > 0) {
                    content = cell.count
                    cellClass += ` ${styles['count-' + cell.count]}`
                  }
                } else if (cell.flagged) {
                  content = '🚩'
                }

                return (
                  <button
                    key={c}
                    className={cellClass}
                    onClick={() => revealCell(r, c)}
                    onContextMenu={(e) => flagCell(e, r, c)}
                  >
                    {content}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
