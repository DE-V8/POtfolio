import { useDesktopStore } from '../../../store/desktopStore'
import styles from './Achievements.module.css'

const LIST = [
  { id: 'first-boot', title: 'First Boot', desc: 'Successfully booted Snorlax OS.', icon: '😴' },
  { id: 'hack', title: 'L33t Hacker Elite', desc: 'Triggered the hacking sequence in cmd.exe.', icon: '⌨️' },
  { id: 'snorlax-poke', title: 'Poke Snorlax', desc: 'Poke the sleeping Snorlax in terminal.', icon: '💤' },
  { id: 'music-player', title: 'Winamp Connoisseur', desc: 'Played a retro Pokémon tune.', icon: '🎵' },
  { id: 'recycle-empty', title: 'Past Sins Purged', desc: 'Cleared the Recycle Bin.', icon: '🗑' },
  { id: 'custom-wallpaper', title: 'Interior Designer', desc: 'Uploaded a custom desktop wallpaper.', icon: '🎨' },
]

export default function Achievements() {
  const { achievements } = useDesktopStore()

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3>🏆 Snorlax OS Achievements</h3>
        <span className={styles.stats}>
          {achievements.length} of {LIST.length} unlocked ({Math.round((achievements.length / LIST.length) * 100)}%)
        </span>
      </div>

      <div className={styles.list}>
        {LIST.map(item => {
          const unlocked = achievements.some(a => a.id === item.id)
          return (
            <div key={item.id} className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}>
              <div className={styles.iconBox}>{unlocked ? item.icon : '🔒'}</div>
              <div className={styles.details}>
                <h4 className={styles.title}>{item.title}</h4>
                <p className={styles.desc}>{item.desc}</p>
                {unlocked && (
                  <span className={styles.date}>
                    Unlocked: {new Date(achievements.find(a => a.id === item.id).ts).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
