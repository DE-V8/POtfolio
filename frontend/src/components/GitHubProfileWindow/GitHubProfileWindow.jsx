import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import styles from './GitHubProfileWindow.module.css'

// Extract username from a GitHub URL or use the value directly as a username
function parseUsername(input) {
  if (!input) return null
  try {
    const url = new URL(input)
    if (url.hostname === 'github.com') {
      return url.pathname.replace(/^\//, '').split('/')[0]
    }
  } catch { /* not a URL — treat as raw username */ }
  return input
}

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', CSS: '#563d7c', HTML: '#e34c26',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Shell: '#89e051',
  Vue: '#2c3e50', Ruby: '#701516', Swift: '#ffac45', Kotlin: '#F18E33',
}

export default function GitHubProfileWindow({ githubUrl, username: usernameProp }) {
  const username = usernameProp || parseUsername(githubUrl)

  const [profile, setProfile] = useState(null)
  const [repos,   setRepos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!username) { setError('No GitHub username provided.'); setLoading(false); return }

    async function fetchData() {
      try {
        const [profRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`),
        ])
        if (!profRes.ok) throw new Error(`GitHub user "${username}" not found.`)
        const [prof, repoList] = await Promise.all([profRes.json(), reposRes.json()])
        setProfile(prof)
        // Sort by star count, take top 6
        setRepos(Array.isArray(repoList)
          ? repoList.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6)
          : []
        )
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [username])

  if (loading) return (
    <div className={styles.center}>
      <motion.div
        className={styles.loadDot}
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >⬛</motion.div>
      <span className={styles.loadText}>Fetching @{username}…</span>
    </div>
  )

  if (error || !profile) return (
    <div className={styles.center}>
      <div style={{ fontSize: 48 }}>😴</div>
      <p className={styles.errorText}>{error || 'Could not load profile.'}</p>
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noreferrer"
        className="xp-btn xp-btn-primary"
        style={{ textDecoration: 'none', marginTop: 8 }}
      >↗ Open github.com/{username}</a>
    </div>
  )

  const joinYear = new Date(profile.created_at).getFullYear()

  return (
    <div className={styles.wrap}>
      {/* Profile header */}
      <div className={styles.header}>
        <img src={profile.avatar_url} alt={profile.login} className={styles.avatar} />
        <div className={styles.headerInfo}>
          <div className={styles.displayName}>{profile.name || profile.login}</div>
          <div className={styles.login}>@{profile.login}</div>
          {profile.bio && <div className={styles.bio}>{profile.bio}</div>}
          <div className={styles.metaRow}>
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.blog    && <span>🌐 {profile.blog}</span>}
            <span>📅 Joined {joinYear}</span>
          </div>
          <div className={styles.stats}>
            <StatPill label="Repos"      value={profile.public_repos} />
            <StatPill label="Followers"  value={profile.followers} />
            <StatPill label="Following"  value={profile.following} />
            {profile.public_gists > 0 && <StatPill label="Gists" value={profile.public_gists} />}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Repositories */}
      <div className={styles.reposLabel}>📦 Repositories</div>
      <div className={styles.reposGrid}>
        {repos.map(repo => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
        {repos.length === 0 && (
          <div className={styles.emptyRepos}>No public repositories found.</div>
        )}
      </div>

      {/* Footer link */}
      <div className={styles.footer}>
        <a
          href={profile.html_url}
          target="_blank"
          rel="noreferrer"
          className="xp-btn"
          style={{ textDecoration: 'none' }}
        >↗ Open github.com/{profile.login}</a>
      </div>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className={styles.statPill}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  )
}

function RepoCard({ repo }) {
  const langColor = LANG_COLORS[repo.language] || '#888'
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className={styles.repoCard}
      whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className={styles.repoName}>📁 {repo.name}</div>
      {repo.description && <div className={styles.repoDesc}>{repo.description}</div>}
      <div className={styles.repoMeta}>
        {repo.language && (
          <span className={styles.repoLang}>
            <span className={styles.langDot} style={{ background: langColor }} />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className={styles.repoStat}>⭐ {repo.stargazers_count}</span>
        )}
        {repo.forks_count > 0 && (
          <span className={styles.repoStat}>🍴 {repo.forks_count}</span>
        )}
      </div>
    </motion.a>
  )
}
