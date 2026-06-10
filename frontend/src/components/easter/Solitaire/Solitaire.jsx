import { useEffect, useRef, useState } from 'react'
import { playSound } from '../../../utils/sounds'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './Solitaire.module.css'

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const CARD_W = 50
const CARD_H = 70
const GAP = 12
const T_Y = 110
const T_SPACING = 15

// Helper to draw a single card
const drawCard = (ctx, x, y, w, h, isFaceUp, suit = '♠', value = 'A', color = '#000000') => {
  const r = 4
  ctx.fillStyle = isFaceUp ? '#ffffff' : '#315bb5' // White face or blue back
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
  ctx.stroke()

  if (isFaceUp) {
    ctx.fillStyle = color
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(value, x + 4, y + 13)
    ctx.font = '14px sans-serif'
    ctx.fillText(suit, x + 4, y + 27)

    // Center suit icon
    ctx.font = '22px sans-serif'
    ctx.fillText(suit, x + (w - 22) / 2 + 1, y + (h + 14) / 2)
  } else {
    // Snorlax Card Back design
    ctx.strokeStyle = '#4b75d6'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '15px sans-serif'
    ctx.fillText('😴', x + (w - 18) / 2, y + (h + 12) / 2)
  }
}

// Helper to draw empty card slot outline
const drawEmptySpot = (ctx, x, y, w, h, icon = '') => {
  const r = 4
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.stroke()

  if (icon) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.font = '24px sans-serif'
    ctx.fillText(icon, x + (w - 24) / 2 + 1, y + (h + 16) / 2)
  }
}

export default function Solitaire() {
  const { unlock } = useDesktopStore()
  const canvasRef = useRef(null)
  
  const [cascading, setCascading] = useState(false)
  const cascadesRef = useRef([])

  // Game state reference for mouse handler performance
  const stateRef = useRef({
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []]
  })

  // Drag state reference
  const dragRef = useRef(null)

  // Initialize Solitaire deck and shuffle
  const initializeGame = () => {
    const deck = []
    SUITS.forEach(suit => {
      VALUES.forEach((value, idx) => {
        deck.push({
          suit,
          value,
          rank: idx + 1,
          color: (suit === '♥' || suit === '♦') ? '#ff0000' : '#000000',
          isFaceUp: false
        })
      })
    })

    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = deck[i]
      deck[i] = deck[j]
      deck[j] = temp
    }

    // Populate Tableau
    const tableau = Array(7).fill().map(() => [])
    let deckIndex = 0
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = deck[deckIndex++]
        if (j === i) card.isFaceUp = true
        tableau[j].push(card)
      }
    }

    stateRef.current = {
      stock: deck.slice(deckIndex),
      waste: [],
      foundations: [[], [], [], []],
      tableau
    }
    setCascading(false)
    redraw()
  }

  // Draw everything on the canvas
  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // 1. Draw green felt
    ctx.fillStyle = '#008000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const state = stateRef.current

    // 2. Draw Stock Pile
    if (state.stock.length > 0) {
      drawCard(ctx, 18, 16, CARD_W, CARD_H, false)
    } else {
      drawEmptySpot(ctx, 18, 16, CARD_W, CARD_H, '🔄')
    }

    // 3. Draw Waste Pile
    if (state.waste.length > 0) {
      const topCard = state.waste[state.waste.length - 1]
      drawCard(ctx, 18 + CARD_W + GAP, 16, CARD_W, CARD_H, true, topCard.suit, topCard.value, topCard.color)
    } else {
      drawEmptySpot(ctx, 18 + CARD_W + GAP, 16, CARD_W, CARD_H)
    }

    // 4. Draw Foundation Piles
    const fXStart = canvas.width - 18 - 4 * CARD_W - 3 * GAP
    for (let i = 0; i < 4; i++) {
      const pile = state.foundations[i]
      const fX = fXStart + i * (CARD_W + GAP)
      if (pile.length > 0) {
        const topCard = pile[pile.length - 1]
        drawCard(ctx, fX, 16, CARD_W, CARD_H, true, topCard.suit, topCard.value, topCard.color)
      } else {
        // Draw suit hint in empty spot
        drawEmptySpot(ctx, fX, 16, CARD_W, CARD_H, SUITS[i])
      }
    }

    // 5. Draw Tableau Piles
    for (let i = 0; i < 7; i++) {
      const pile = state.tableau[i]
      const tX = 18 + i * (CARD_W + GAP)
      if (pile.length > 0) {
        pile.forEach((card, j) => {
          drawCard(ctx, tX, T_Y + j * T_SPACING, CARD_W, CARD_H, card.isFaceUp, card.suit, card.value, card.color)
        })
      } else {
        drawEmptySpot(ctx, tX, T_Y, CARD_W, CARD_H)
      }
    }

    // 6. Draw currently dragged cards
    const drag = dragRef.current
    if (drag && drag.cards.length > 0) {
      const dx = drag.curX - drag.startX
      const dy = drag.curY - drag.startY
      drag.cards.forEach((card, j) => {
        // Add a slight drop shadow for visual depth when dragging
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 4

        drawCard(ctx, drag.originX + dx, drag.originY + dy + j * T_SPACING, CARD_W, CARD_H, true, card.suit, card.value, card.color)

        // Clear shadow settings
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      })
    }
  }

  // Handle game initial setup
  useEffect(() => {
    initializeGame()
  }, [])

  // Canvas update loop for win cascade
  useEffect(() => {
    let animId
    const canvas = canvasRef.current
    if (!canvas || !cascading) return
    const ctx = canvas.getContext('2d')

    const update = () => {
      cascadesRef.current.forEach((c) => {
        drawCard(ctx, c.x, c.y, CARD_W, CARD_H, true, c.suit, c.value, c.color)
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.4
        if (c.y + CARD_H >= canvas.height) {
          c.y = canvas.height - CARD_H
          c.vy = -c.vy * 0.85
        }
      })

      if (Math.random() < 0.1 && cascadesRef.current.length < 50) {
        const suit = SUITS[Math.floor(Math.random() * SUITS.length)]
        const value = VALUES[Math.floor(Math.random() * VALUES.length)]
        const color = (suit === '♥' || suit === '♦') ? '#ff0000' : '#000000'
        cascadesRef.current.push({
          x: Math.random() * (canvas.width - 80) + 40,
          y: 16,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 2 + 1,
          suit,
          value,
          color
        })
      }
      animId = requestAnimationFrame(update)
    }

    animId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animId)
  }, [cascading])

  const startCascade = () => {
    playSound('startup')
    setCascading(true)
    cascadesRef.current = []
    unlock('solitaire-cascade', 'Retro Card Cascader', '🃏')
  }

  const stopCascade = () => {
    setCascading(false)
    initializeGame()
  }

  // Drag and drop mouse event handlers
  const handleMouseDown = (e) => {
    if (cascading) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const state = stateRef.current

    // 1. Stock Pile click (draw card)
    if (x >= 18 && x <= 18 + CARD_W && y >= 16 && y <= 16 + CARD_H) {
      if (state.stock.length > 0) {
        const card = state.stock.pop()
        card.isFaceUp = true
        state.waste.push(card)
        playSound('click')
      } else if (state.waste.length > 0) {
        // Recycle waste back to stock
        state.stock = [...state.waste].reverse().map(c => ({ ...c, isFaceUp: false }))
        state.waste = []
        playSound('click')
      }
      redraw()
      return
    }

    // 2. Waste Pile click (drag top card)
    if (x >= 82 && x <= 82 + CARD_W && y >= 16 && y <= 16 + CARD_H) {
      if (state.waste.length > 0) {
        const card = state.waste.pop()
        dragRef.current = {
          cards: [card],
          source: 'waste',
          startX: x,
          startY: y,
          curX: x,
          curY: y,
          originX: 82,
          originY: 16
        }
        playSound('click')
      }
      return
    }

    // 3. Foundation Piles click (drag top card)
    const fXStart = canvas.width - 18 - 4 * CARD_W - 3 * GAP
    for (let i = 0; i < 4; i++) {
      const fX = fXStart + i * (CARD_W + GAP)
      if (x >= fX && x <= fX + CARD_W && y >= 16 && y <= 16 + CARD_H) {
        const pile = state.foundations[i]
        if (pile.length > 0) {
          const card = pile.pop()
          dragRef.current = {
            cards: [card],
            source: `foundation-${i}`,
            startX: x,
            startY: y,
            curX: x,
            curY: y,
            originX: fX,
            originY: 16
          }
          playSound('click')
          redraw()
        }
        return
      }
    }

    // 4. Tableau Piles click (drag single/multiple cards)
    for (let i = 0; i < 7; i++) {
      const tX = 18 + i * (CARD_W + GAP)
      if (x >= tX && x <= tX + CARD_W) {
        const pile = state.tableau[i]
        if (pile.length === 0) continue

        // Iterate cards from top of cascade (last element) to bottom (first element)
        for (let j = pile.length - 1; j >= 0; j--) {
          const cardY = T_Y + j * T_SPACING
          // Check if click lies on this card's clickable top sliver, or the full card height if it's the top card
          const isTopCard = (j === pile.length - 1)
          const hitH = isTopCard ? CARD_H : T_SPACING
          
          if (y >= cardY && y <= cardY + hitH) {
            const card = pile[j]
            if (card.isFaceUp) {
              // Extract this card and all cards resting on top of it
              const cardsToDrag = pile.splice(j)
              dragRef.current = {
                cards: cardsToDrag,
                source: `tableau-${i}`,
                startX: x,
                startY: y,
                curX: x,
                curY: y,
                originX: tX,
                originY: cardY
              }
              playSound('click')
              redraw()
              return
            }
          }
        }
      }
    }
  }

  const handleMouseMove = (e) => {
    const drag = dragRef.current
    if (!drag) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    
    drag.curX = e.clientX - rect.left
    drag.curY = e.clientY - rect.top
    redraw()
  }

  const handleMouseUp = (e) => {
    const drag = dragRef.current
    if (!drag) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const state = stateRef.current
    let placed = false

    // Check if dragging only 1 card (for foundations drop validation)
    const firstCard = drag.cards[0]

    // 1. Check Foundation Piles drop overlap
    const fXStart = canvas.width - 18 - 4 * CARD_W - 3 * GAP
    for (let i = 0; i < 4; i++) {
      const fX = fXStart + i * (CARD_W + GAP)
      if (x >= fX - 10 && x <= fX + CARD_W + 10 && y >= 16 - 10 && y <= 16 + CARD_H + 10) {
        if (drag.cards.length === 1) {
          const pile = state.foundations[i]
          const isValid = (pile.length === 0 && firstCard.rank === 1 && SUITS[i] === firstCard.suit) ||
                          (pile.length > 0 && firstCard.suit === pile[pile.length - 1].suit && firstCard.rank === pile[pile.length - 1].rank + 1)
          
          if (isValid) {
            pile.push(firstCard)
            placed = true
            playSound('recycle')
            
            // Auto flip new top card of source tableau
            revealSourceTopCard(drag.source)
            break
          }
        }
      }
    }

    // 2. Check Tableau Piles drop overlap
    if (!placed) {
      for (let i = 0; i < 7; i++) {
        const tX = 18 + i * (CARD_W + GAP)
        const pile = state.tableau[i]
        const pileHeight = pile.length > 0 ? T_Y + (pile.length - 1) * T_SPACING + CARD_H : T_Y + CARD_H

        if (x >= tX - 15 && x <= tX + CARD_W + 15 && y >= T_Y && y <= pileHeight + 20) {
          let isValid = false
          if (pile.length === 0) {
            // Only King can go on empty columns
            if (firstCard.rank === 13) isValid = true
          } else {
            const topCard = pile[pile.length - 1]
            // Must be alternating colors and 1 rank lower
            const targetColor = topCard.color
            const dragColor = firstCard.color
            if (targetColor !== dragColor && firstCard.rank === topCard.rank - 1) {
              isValid = true
            }
          }

          if (isValid) {
            state.tableau[i] = [...state.tableau[i], ...drag.cards]
            placed = true
            playSound('recycle')
            revealSourceTopCard(drag.source)
            break
          }
        }
      }
    }

    // Snap back if invalid drop
    if (!placed) {
      returnDraggedCards(drag.source, drag.cards)
    }

    dragRef.current = null
    redraw()
  }

  // Helper to reveal new top card of tableau column after card move
  const revealSourceTopCard = (source) => {
    if (source.startsWith('tableau-')) {
      const idx = parseInt(source.split('-')[1])
      const pile = stateRef.current.tableau[idx]
      if (pile.length > 0) {
        pile[pile.length - 1].isFaceUp = true
      }
    }
  }

  // Snap cards back to their originating pile on cancellation
  const returnDraggedCards = (source, cards) => {
    const state = stateRef.current
    if (source === 'waste') {
      state.waste.push(...cards)
    } else if (source.startsWith('foundation-')) {
      const idx = parseInt(source.split('-')[1])
      state.foundations[idx].push(...cards)
    } else if (source.startsWith('tableau-')) {
      const idx = parseInt(source.split('-')[1])
      state.tableau[idx].push(...cards)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <button className="xp-btn xp-btn-primary" onClick={startCascade}>
          🃏 Trigger Win Cascade!
        </button>
        <button className="xp-btn" onClick={stopCascade} disabled={!cascading}>
          Reset felt
        </button>
      </div>
      <div className={styles.felt}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: cascading ? 'default' : 'pointer' }}
        />
      </div>
    </div>
  )
}
