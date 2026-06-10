import { useState } from 'react'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './Notepad.module.css'

const INITIAL_TEXT = `WELCOME TO MY PORTFOLIO OS!

Hello visitor! I'm Debjit Debnath (you can call me Debuuu).
This website is my creative sandbox built to look like Windows XP with Snorlax thematic additions.

[ABOUT ME]
I am a hybrid developer and designer. 
I edit videos, model 3D scenes in Blender, design UI prototypes in Figma, and write code in React.

[TIPS & EASTER EGGS]
- Try typing the classic Konami Code on your keyboard (Up Up Down Down Left Right Left Right B A).
- Open cmd.exe and play around with commands.
- Double-click the desktop items to view categories.
- Recycle Bin might contain some of my darkest coding secrets.
- If you're inactive for 3 minutes, Snorlax will trigger a custom screen saver!

Feel free to write me a message via the Contact app!

Cheers,
Debuuu
`

export default function Notepad() {
  const { unlock } = useDesktopStore()
  const [text, setText] = useState(INITIAL_TEXT)

  const handleSave = () => {
    unlock('notepad-save', 'Document Edited', '📝')
    alert('Note saved! (Mock save to local disk successfully completed)')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.menubar}>
        <span onClick={() => alert('Notepad Version 5.1.2600\n(C) Debuuu Corp.')}>File</span>
        <span onClick={handleSave}>Save</span>
        <span onClick={() => setText(INITIAL_TEXT)}>Reset</span>
        <span onClick={() => alert('Made with React & love by Debuuu!')}>Help</span>
      </div>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck="false"
      />
    </div>
  )
}
