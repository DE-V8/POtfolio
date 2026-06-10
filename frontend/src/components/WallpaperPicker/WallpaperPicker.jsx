import { useDesktopStore } from '../../store/desktopStore'
import { playSound } from '../../utils/sounds'
import styles from './WallpaperPicker.module.css'

const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

const PRESETS = [
  { id: 'snorlax-bliss', name: 'Snorlax Bliss (Sleeping)', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaKYYodda17rfnFG8zRNkr2NQDeAhDDFPyHQ9dgJK7DBLP-upV0octQ14H3s5zwmglsI_YuALi84tBbJkU_i57Vvys1pps_mOZnDVM7BL5h_Jl-5qi2C5A7n_vhjdstQ5AhptWQjUuIE9f7EkLHqDLJzusK3wxaLUVy7NQyNVEDsj3Bvas5SIlTEbHjxGLIU7ghcR0ynHVW0daYW7MFl1uptXQzu4pdHWcauzx8rIelR6Gg3nlpBmXJRhAIGh7X0esZnpFQ6qYnhh1' },
  { id: 'classic-bliss', name: 'Classic XP Bliss (Green Hill)', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
  { id: 'pokemon-stadium', name: 'Pokémon Stadium', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80' },
  { id: 'dark-snorlax', name: 'Snorlax Dark Nebula', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' }
]

export default function WallpaperPicker({ data }) {
  const { wallpaper, wallpaperUrl, setWallpaper, unlock } = useDesktopStore()

  // Map wallpapers from Strapi
  const apiWallpapers = data?.wallpapers?.map(w => {
    const attrs = w.attributes || w
    const name = attrs.name
    const imageMedia = attrs.image?.data || attrs.image
    const imageUrl = imageMedia?.attributes?.url || imageMedia?.url
    const fullUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${BASE}${imageUrl}`) : null
    return {
      id: `strapi-${w.id}`,
      name,
      url: fullUrl,
      isDark: !!attrs.isDark
    }
  }).filter(w => w.url) || []

  const list = [...apiWallpapers, ...PRESETS]

  const handleSelect = (preset) => {
    setWallpaper(preset.id, preset.url)
    playSound('notification')
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result
      if (typeof url === 'string') {
        setWallpaper('custom-uploaded', url)
        playSound('startup')
        unlock('custom-wallpaper', 'Interior Designer', '🎨')
      }
    }
    reader.readAsDataURL(file)
  }

  const currentUrl = wallpaperUrl || (list[0]?.url || PRESETS[0].url)

  return (
    <div className={styles.wrap}>
      {/* Monitor Preview */}
      <div className={styles.previewContainer}>
        <div className={styles.monitor}>
          <div className={styles.screen} style={{ backgroundImage: `url(${currentUrl})` }}>
            {/* Tiny desktop window inside screen */}
            <div className={styles.miniWindow}>
              <div className={styles.miniBar} />
              <div className={styles.miniBody} />
            </div>
          </div>
          <div className={styles.stand} />
          <div className={styles.base} />
        </div>
      </div>

      {/* Select List */}
      <div className={styles.pickerPanel}>
        <h4>Select Wallpaper:</h4>
        <div className={styles.list}>
          {list.map(preset => (
            <div
              key={preset.id}
              className={`${styles.item} ${wallpaper === preset.id ? styles.selectedItem : ''}`}
              onClick={() => handleSelect(preset)}
            >
              🖼️ {preset.name}
            </div>
          ))}
        </div>

        {/* Upload Custom */}
        <div className={styles.uploadRow}>
          <label htmlFor="wall-upload" className="xp-btn" style={{ textAlign: 'center', cursor: 'pointer', display: 'inline-block' }}>
            📁 Browse Custom Image...
          </label>
          <input
            id="wall-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>
      </div>
    </div>
  )
}
