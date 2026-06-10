import { useState, useEffect } from 'react'

const BASE = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

// Fallback data shown when Strapi is offline/cold-starting
const FALLBACK = {
  apps: [
    { id: 1, attributes: { name: 'Photoshop Works', slug: 'photoshop', icon: '🎨', color: '#FF6B9D', order: 1 } },
    { id: 2, attributes: { name: 'Video Editing',   slug: 'video',      icon: '🎬', color: '#FF9F43', order: 2 } },
    { id: 3, attributes: { name: '3D Art',          slug: '3d',         icon: '🧊', color: '#54A0FF', order: 3 } },
    { id: 4, attributes: { name: 'UI/UX Design',    slug: 'uiux',       icon: '🖌️', color: '#5F27CD', order: 4 } },
    { id: 5, attributes: { name: 'Dev Projects',    slug: 'dev',        icon: '💻', color: '#1DD1A1', order: 5 } },
    { id: 6, attributes: { name: 'Illustrations',   slug: 'illustrations', icon: '✏️', color: '#FECA57', order: 6 } },
  ],
  about: {
    data: {
      attributes: {
        name: 'Debjit Debnath',
        tagline: 'Creative Developer · Digital Artist · Video Editor · 3D Artist',
        bio: 'Hey! I\'m Debuuu — a creative developer who lives at the intersection of code and art. I make things that look good and work even better.',
        instagram: '',
        twitter: '',
        github: '',
        linkedin: '',
      }
    }
  },
  works: [
    {
      id: 101,
      attributes: {
        title: 'Snorlax in Times Square',
        description: 'A matte painting composite showing a giant Snorlax sleeping in the middle of Times Square, New York.',
        tags: 'Photoshop, Matte Painting, Compositing',
        coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&auto=format&fit=crop&q=60',
        app: { data: { attributes: { slug: 'photoshop' } } }
      }
    },
    {
      id: 102,
      attributes: {
        title: 'Cyberpunk City Neon FX',
        description: 'Photoshop digital art blending cyberpunk assets with high-contrast color grading.',
        tags: 'Photoshop, Cyberpunk, Digital Art',
        coverUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=500&auto=format&fit=crop&q=60',
        app: { data: { attributes: { slug: 'photoshop' } } }
      }
    },
    {
      id: 201,
      attributes: {
        title: 'Creative Motion Reel 2026',
        description: 'A dynamic video editing compilation showing rapid cuts, sound design sync, and color correction.',
        tags: 'Premiere, After Effects, Sound Design',
        coverUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Classic Rickroll video as placeholder
        app: { data: { attributes: { slug: 'video' } } }
      }
    },
    {
      id: 301,
      attributes: {
        title: 'Low Poly Pokémon Village',
        description: '3D modeling of a peaceful village styled after Pallet Town, modeled and rendered in Blender.',
        tags: 'Blender, 3D Modeling, Rendering',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
        app: { data: { attributes: { slug: '3d' } } }
      }
    },
    {
      id: 302,
      attributes: {
        title: 'Mech Snorlax Model',
        description: 'Hard surface modeling project creating a robotic mech suit version of Snorlax.',
        tags: 'Blender, Hard Surface, Texturing',
        coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60',
        app: { data: { attributes: { slug: '3d' } } }
      }
    },
    {
      id: 401,
      attributes: {
        title: 'Pokedex Mobile UX concept',
        description: 'Figma prototype of a modern mobile Pokédex app with intuitive filters and animations.',
        tags: 'Figma, UI/UX, Mobile Design',
        coverUrl: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=500&auto=format&fit=crop&q=60',
        projectUrl: 'https://figma.com',
        app: { data: { attributes: { slug: 'uiux' } } }
      }
    },
    {
      id: 501,
      attributes: {
        title: 'Portfolio OS (Snorlax XP)',
        description: 'This interactive Windows XP website, featuring custom window managers, state machines, sound design, and custom widgets.',
        tags: 'React, Zustand, Framer Motion, CSS Modules',
        coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
        projectUrl: 'https://github.com/debuuu/personal-website',
        app: { data: { attributes: { slug: 'dev' } } }
      }
    },
    {
      id: 601,
      attributes: {
        title: 'Retro Snorlax Vector Illustration',
        description: 'A cozy illustration of Snorlax eating pancakes, created with clean vector shapes.',
        tags: 'Illustrator, Vector, Flat Design',
        coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
        app: { data: { attributes: { slug: 'illustrations' } } }
      }
    }
  ],
  tracks: [
    { id: 1, attributes: { title: 'Lavender Town', artist: 'Pokémon OST', duration: '3:12' } },
    { id: 2, attributes: { title: 'Pallet Town Theme', artist: 'Pokémon OST', duration: '2:45' } },
  ],
  links: [
    { id: 1, attributes: { name: 'Instagram', url: 'https://www.instagram.com/ifdebuu/', icon: '📸', order: 1 } },
    { id: 2, attributes: { name: 'GitHub',    url: 'https://github.com/DE-V8',           icon: '🐙', order: 2 } },
  ],
  wallpapers: []
}

export function useStrapi() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [appsRes, aboutRes, worksRes, tracksRes, linksRes, wallpapersRes] = await Promise.all([
          fetch(`${BASE}/api/apps?populate[iconImage]=true&sort=order`),
          fetch(`${BASE}/api/about?populate[avatar]=true&populate[resumePdf]=true`),
          fetch(`${BASE}/api/works?populate[cover]=true&populate[app]=true&sort=date:desc`),
          fetch(`${BASE}/api/tracks?populate[cover]=true&populate[audioFile]=true`),
          fetch(`${BASE}/api/links?populate[iconImage]=true&sort=order`),
          fetch(`${BASE}/api/wallpapers?populate[image]=true`),
        ])

        if (!appsRes.ok) throw new Error('Strapi offline')

        const [apps, about, works, tracks, links, wallpapers] = await Promise.all([
          appsRes.json(),
          aboutRes.json(),
          worksRes.json(),
          tracksRes.json(),
          linksRes.json(),
          wallpapersRes.ok ? wallpapersRes.json() : { data: [] }
        ])

        setData({
          apps: apps.data,
          about,
          works: works.data,
          tracks: tracks.data,
          links: links.data,
          wallpapers: wallpapers.data || []
        })
      } catch (err) {
        console.warn('Strapi unreachable, using fallback data:', err.message)
        setData(FALLBACK)
        setUsingFallback(true)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return { data, loading, error, usingFallback }
}

// Single resource fetch
export function useStrapiResource(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE}/api/${path}`)
      .then(r => r.json())
      .then(d => setData(d.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [path])

  return { data, loading }
}
