import { useState } from 'react'
import { playSound } from '../../../utils/sounds'
import { useDesktopStore } from '../../../store/desktopStore'
import styles from './RecycleBin.module.css'

const INITIAL_CRINGE = [
  { id: 'cringe1', name: 'FlappySnorlax_v1_spaghetti.js', icon: '📄', size: '2.4 MB', desc: '500 lines of nested if-else statements for collision detection.' },
  { id: 'cringe2', name: 'MyFirstPortfolio_ComicSans.html', icon: '🌐', size: '42 KB', desc: 'Bright yellow background, green text, and a rotating 3D letters banner.' },
  { id: 'cringe3', name: 'IP_Spam_Bot_AutoBan.py', icon: '🐍', size: '12 KB', desc: 'A scraper that got my own router IP banned from Google within 3 seconds.' },
  { id: 'cringe4', name: 'Todo_List_Version_87.apk', icon: '📱', size: '14.2 MB', desc: 'Yet another todo list app, never opened after compilation.' }
]

export default function RecycleBin() {
  const { unlock } = useDesktopStore()
  const [items, setItems] = useState(INITIAL_CRINGE)

  const handleRestore = (item) => {
    playSound('error')
    alert(`Cannot restore ${item.name}!\n\nReason: The code is too cringe to return to the active workspace. Let it rest in peace.`)
  }

  const handleEmpty = () => {
    playSound('startup') // or usb sound
    const confirm = window.confirm('Are you sure you want to permanently delete all your past cringe projects?')
    if (confirm) {
      setItems([])
      unlock('recycle-empty', 'Past Sins Purged', '🗑️')
      alert('Your past sins have been permanently deleted from the hard disk.')
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className="xp-btn" onClick={handleEmpty} disabled={items.length === 0}>
          🗑️ Empty Recycle Bin
        </button>
        <span className={styles.stats}>{items.length} item(s) currently in Bin</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🗑️</span>
          <h2>Empty Bin</h2>
          <p>You have successfully purged all cringe projects. Clean slate!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map(item => (
            <div key={item.id} className={styles.item} onDoubleClick={() => handleRestore(item)}>
              <span className={styles.itemIcon}>{item.icon}</span>
              <div className={styles.itemMeta}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemDesc}>{item.desc}</span>
              </div>
              <span className={styles.itemSize}>{item.size}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
