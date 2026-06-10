import { useState, useRef, useEffect } from 'react'
import { playSound } from '../../utils/sounds'
import { useDesktopStore } from '../../store/desktopStore'
import styles from './MusicPlayer.module.css'

const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

export default function MusicPlayer({ data }) {
  const { unlock } = useDesktopStore()
  const audioRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [volume, setVolume] = useState(70)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Grab tracks from Strapi or fallback
  const tracks = data?.tracks || [
    {
      id: 1,
      title: 'Lavender Town Theme',
      artist: 'Pokémon Red/Blue',
      duration: '6:12',
      audioFile: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      cover: { url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=200&fit=crop' }
    },
    {
      id: 2,
      title: 'Pallet Town Theme',
      artist: 'Pokémon Red/Blue',
      duration: '7:05',
      audioFile: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      cover: { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop' }
    },
    {
      id: 3,
      title: 'Snorlax Flute Melody',
      artist: 'Pokémon OST',
      duration: '5:44',
      audioFile: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      cover: { url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop' }
    }
  ]

  // Parse track metadata
  const activeTrack = tracks[trackIndex] || { title: 'No Track Loaded', artist: 'Unknown' }
  const trackAttrs  = activeTrack.attributes || activeTrack

  // Resolve audio URL
  const audioMedia = trackAttrs.audioFile?.data || trackAttrs.audioFile
  const audioUrl   = audioMedia?.attributes?.url || audioMedia?.url
  const audioFull  = audioUrl 
    ? (audioUrl.startsWith('http') ? audioUrl : `${BASE}${audioUrl}`) 
    : (trackAttrs.title?.includes('Lavender')
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        : (trackAttrs.title?.includes('Pallet')
            ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
            : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'));

  // Resolve cover image URL
  const coverMedia = trackAttrs.cover?.data || trackAttrs.cover
  const coverUrl   = coverMedia?.attributes?.url || coverMedia?.url
  const coverFull  = coverUrl 
    ? (coverUrl.startsWith('http') ? coverUrl : `${BASE}${coverUrl}`) 
    : (trackAttrs.title?.includes('Lavender')
        ? 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=200&fit=crop'
        : (trackAttrs.title?.includes('Pallet')
            ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop'
            : null));

  // Set audio source and play when trackIndex changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
      if (playing) {
        audioRef.current.play().catch(err => console.log('Audio playback failed:', err))
      }
    }
  }, [trackIndex])

  // Play / Pause effect
  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(err => {
          console.log('Audio playback failed:', err)
          setPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [playing])

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const handlePlayPause = () => {
    setPlaying(!playing)
    playSound('notification')
    unlock('music-player', 'Winamp Connoisseur', '🎵')
  }

  const handleStop = () => {
    setPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
    setCurrentTime(0)
  }

  const handleNext = () => {
    if (tracks.length > 0) {
      setTrackIndex(prev => (prev + 1) % tracks.length)
      setPlaying(true)
    }
  }

  const handlePrev = () => {
    if (tracks.length > 0) {
      setTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length)
      setPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const newProgress = Number(e.target.value)
    if (audioRef.current && duration > 0) {
      const newTime = (newProgress / 100) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Format time (e.g. 145 -> "02:25")
  const formatTime = (timeInSecs) => {
    if (isNaN(timeInSecs)) return '00:00'
    const mins = Math.floor(timeInSecs / 60)
    const secs = Math.floor(timeInSecs % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={styles.wrap}>
      {/* Hidden Audio Player */}
      {audioFull && (
        <audio
          ref={audioRef}
          src={audioFull}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
        />
      )}

      {/* Top section: Player display & buttons */}
      <div className={styles.winampHeader}>
        <div className={styles.titleMarquee}>
          <div className={`${styles.marqueeInner} ${playing ? styles.marqueeScroll : ''}`}>
            *** NOW PLAYING: {trackAttrs.title || 'Unknown Track'} - {trackAttrs.artist || 'Unknown Artist'} ***
          </div>
        </div>
      </div>

      <div className={styles.playerBody}>
        {/* Album Art Cover / Vinyl */}
        <div className={styles.coverFrame}>
          {coverFull ? (
            <img
              src={coverFull}
              alt={trackAttrs.title}
              className={`${styles.coverImg} ${playing ? styles.rotate : ''}`}
            />
          ) : (
            <div className={`${styles.defaultCover} ${playing ? styles.rotate : ''}`}>
              💿
            </div>
          )}
        </div>

        {/* Panel controls */}
        <div className={styles.mainPanel}>
          <div className={styles.panel}>
            <div className={styles.visualizer}>
              {/* Mock visualizer bars */}
              {Array(10).fill().map((_, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  style={{
                    height: playing ? `${Math.floor(Math.random() * 26) + 4}px` : '4px',
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <div className={styles.lcdDisplay}>
              <span className={styles.timer}>
                {formatTime(currentTime)}
              </span>
              <span className={styles.kbps}>320kbps MP3</span>
            </div>
          </div>

          {/* Progress Slider */}
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>SEEK:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className={styles.winampSlider}
            />
          </div>

          {/* Volume Slider */}
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>VOL:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={styles.winampSlider}
            />
            <span style={{ fontSize: 9, color: '#00e1ff', width: 22, textAlign: 'right' }}>{volume}%</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className={styles.controls}>
        <button className={styles.btn} onClick={handlePrev} title="Previous">⏮️</button>
        <button className={`${styles.btn} ${playing ? styles.btnActive : ''}`} onClick={handlePlayPause} title={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸️' : '▶️'}
        </button>
        <button className={styles.btn} onClick={handleStop} title="Stop">⏹️</button>
        <button className={styles.btn} onClick={handleNext} title="Next">⏭️</button>
      </div>

      {/* Playlist */}
      <div className={styles.playlist}>
        <div className={styles.playlistHeader}>Snorlax Winamp Playlist</div>
        <div className={styles.trackList}>
          {tracks.map((track, i) => {
            const attr = track.attributes || track
            return (
              <div
                key={track.id}
                className={`${styles.trackItem} ${trackIndex === i ? styles.trackItemActive : ''}`}
                onClick={() => {
                  setTrackIndex(i)
                  setPlaying(true)
                }}
              >
                <span className={styles.trackTitle}>
                  {i + 1}. {attr.title} - {attr.artist || 'Unknown'}
                </span>
                <span className={styles.trackDuration}>{attr.duration || '--:--'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
