import { useDesktopStore } from '../../../store/desktopStore'
import styles from './MyComputer.module.css'

const DRIVES = [
  { id: 'c-drive', letter: 'C:', label: 'Frontend Engine', pct: 85, cap: '120 GB', free: '18 GB', icon: '💽', app: null },
  { id: 'd-drive', letter: 'D:', label: 'Design & Creative', pct: 90, cap: '150 GB', free: '15 GB', icon: '💽', app: 'photoshop' },
  { id: 'e-drive', letter: 'E:', label: 'Motion & Video', pct: 75, cap: '200 GB', free: '50 GB', icon: '💽', app: 'video' },
  { id: 'f-drive', letter: 'F:', label: '3D modeling', pct: 80, cap: '100 GB', free: '20 GB', icon: '💽', app: '3d' },
  { id: 'g-drive', letter: 'G:', label: 'Backend API', pct: 70, cap: '80 GB', free: '24 GB', icon: '💽', app: 'dev' },
]

export default function MyComputer() {
  const { openWindow, unlock } = useDesktopStore()

  const handleDriveClick = (drv) => {
    unlock('my-computer-explorer', 'System Explorer', '🖥️')
    if (drv.app) {
      // Open the corresponding portfolio window!
      const title = drv.label
      openWindow({
        id: `app-${drv.app}`,
        component: 'GalleryWindow',
        title: title,
        icon: '📁',
        props: { appSlug: drv.app, appName: title, works: [] } // App.jsx will merge this properly
      })
    } else {
      alert(`Drive (${drv.letter}) - ${drv.label}\nCapacity: ${drv.cap} (Free: ${drv.free})\nContains core skills: ${
        drv.id === 'c-drive' ? 'React, JavaScript, CSS Modules, Zustand, Framer Motion' : 'Node.js, Strapi, PostgreSQL, APIs'
      }`)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.category}>
        <h4>Hard Disk Drives</h4>
        <div className={styles.grid}>
          {DRIVES.map(drv => (
            <div key={drv.id} className={styles.drive} onDoubleClick={() => handleDriveClick(drv)}>
              <span className={styles.driveIcon}>{drv.icon}</span>
              <div className={styles.driveInfo}>
                <span className={styles.driveLabel}>{drv.label} ({drv.letter})</span>
                <div className={styles.barWrap}>
                  <div className={styles.barFill} style={{ width: `${drv.pct}%` }} />
                </div>
                <span className={styles.driveStats}>{drv.free} free of {drv.cap}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.category}>
        <h4>Devices with Removable Storage</h4>
        <div className={styles.grid}>
          <div className={styles.drive} onDoubleClick={() => alert('Please insert a disc into drive H:')}>
            <span className={styles.driveIcon}>💿</span>
            <div className={styles.driveInfo}>
              <span className={styles.driveLabel}>CD Drive (H:)</span>
              <span className={styles.driveStats}>0 bytes free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
