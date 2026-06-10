import { useState, useRef, useEffect } from 'react'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './Terminal.module.css'

const HELP = `
Available commands:
  help       - Show this help message
  about      - Who is Debuuu?
  skills     - List technical skills
  hack       - Initiate super-secure hacking sequence
  snorlax    - Poke the sleeping beast
  clear      - Clear terminal screen
  system     - Print system configuration
  unlock     - Unlock secret developer modes
`

export default function Terminal() {
  const { unlock } = useDesktopStore()
  const [history, setHistory] = useState([
    { text: 'Debuuu OS [Version 5.1.2600]', type: 'system' },
    { text: '(C) Copyright 1985-2026 Debuuu Corp.', type: 'system' },
    { text: 'Type "help" for a list of commands.', type: 'system' },
    { text: '', type: 'system' }
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase()
    let response = []

    switch (trimmed) {
      case '':
        break
      case 'help':
        response.push({ text: HELP, type: 'info' })
        break
      case 'about':
        response.push({ text: 'Debuuu is a multi-talented Creative Developer, Video Editor, 3D Artist, and UI/UX Designer who loves building quirky interactive web projects.', type: 'info' })
        break
      case 'skills':
        response.push({ text: 'Dev: React, Node.js, Three.js, Strapi, Git, CSS Modules\nArt: Photoshop, Premiere Pro, After Effects, Blender', type: 'info' })
        break
      case 'hack':
        response.push({ text: 'Initializing hacking sequence...', type: 'system' })
        response.push({ text: 'Accessing local frame buffers... [OK]', type: 'system' })
        response.push({ text: 'Bypassing main firewall... [SUCCESS]', type: 'system' })
        response.push({ text: 'ACCESS GRANTED. YOU ARE NOW THE ULTIMATE HACKER!', type: 'success' })
        unlock('hack', 'L33t Hacker Elite', '⌨️')
        break
      case 'snorlax':
        response.push({ text: 'Snorlax is sleeping soundly. It is breathing heavily. Zzz...', type: 'info' })
        unlock('snorlax-poke', 'Poke Snorlax', '💤')
        break
      case 'clear':
        setHistory([])
        return
      case 'system':
        response.push({ text: 'OS Name: Debuuu Snorlax OS XP\nProcessor: Intel Core iSnorlax @ 0.05GHz\nMemory: 8 GB Coffee RAM\nSystem Uptime: Just Booted', type: 'info' })
        break
      case 'unlock':
        response.push({ text: 'Developer mode activated. All limits removed (not really).', type: 'success' })
        unlock('terminal-unlock', 'Terminal Wizard', '⚡')
        break
      default:
        response.push({ text: `cmd.exe: command not found: "${trimmed}". Type "help" for a list of commands.`, type: 'error' })
    }

    setHistory(prev => [
      ...prev,
      { text: `C:\\Documents and Settings\\debuuu>${cmd}`, type: 'prompt' },
      ...response
    ])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleCommand(input)
    setInput('')
  }

  return (
    <div className={styles.wrap} onClick={() => document.getElementById('term-input')?.focus()}>
      <div className={styles.output}>
        {history.map((line, idx) => (
          <div key={idx} className={`${styles.line} ${styles[line.type]}`}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.promptLine}>
        <span className={styles.promptText}>C:\Documents and Settings\debuuu&gt;</span>
        <input
          id="term-input"
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoFocus
        />
      </form>
    </div>
  )
}
