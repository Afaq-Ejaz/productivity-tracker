import React, { useState, useEffect } from 'react'
import { initGoogleAuth, requestAccessToken, getStoredToken } from './auth.js'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    initGoogleAuth().then(() => {
      setAuthReady(true)
      if (getStoredToken()) setAuthed(true)
    })
  }, [])

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await requestAccessToken()
      setAuthed(true)
    } catch (e) {
      setError('Sign-in failed. Make sure popups are allowed.')
    } finally {
      setLoading(false)
    }
  }

  if (authed) {
    return <Dashboard onSignOut={() => setAuthed(false)} />
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Decorative grid */}
        <div style={styles.grid} />

        <div style={styles.inner}>
          <div style={styles.badge}>PERSONAL PRODUCTIVITY</div>

          <h1 style={styles.title}>
            SEE YOUR<br />
            <span style={{ color: 'var(--accent)' }}>REAL WEEK.</span>
          </h1>

          <p style={styles.sub}>
            Connect Google Calendar + Tasks.<br />
            Get your score, a win, and the thing you're ignoring.
          </p>

          <div style={styles.featureList}>
            {['Weekly · Monthly · Yearly graphs', 'Tasks + Events combined score', 'AI insight powered by Gemini', 'Your data, never stored'].map(f => (
              <div key={f} style={styles.feature}>
                <span style={{ color: 'var(--accent)' }}>—</span> {f}
              </div>
            ))}
          </div>

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          <button
            onClick={handleSignIn}
            disabled={!authReady || loading}
            style={{ ...styles.btn, ...(loading ? styles.btnLoading : {}) }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={styles.spinner} /> Connecting...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p style={styles.note}>
            Read-only access · No data stored · Switch accounts anytime
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    position: 'relative',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    maxWidth: 480,
    width: '100%',
    overflow: 'hidden',
    animation: 'fadeUp 0.5s ease both',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  inner: {
    position: 'relative',
    padding: '48px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  badge: {
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.2em',
    color: 'var(--accent)',
    border: '1px solid rgba(200,245,53,0.3)',
    borderRadius: 50,
    padding: '4px 12px',
    width: 'fit-content',
  },
  title: {
    fontSize: 42,
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
  },
  sub: {
    fontSize: 15,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  feature: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: 10,
  },
  btn: {
    background: 'var(--accent)',
    color: '#0a0a0f',
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 10,
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'opacity 0.2s, transform 0.1s',
    cursor: 'pointer',
    border: 'none',
    marginTop: 4,
  },
  btnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid rgba(0,0,0,0.2)',
    borderTop: '2px solid #0a0a0f',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  note: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  error: {
    background: 'rgba(255,77,109,0.1)',
    border: '1px solid rgba(255,77,109,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--red)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
  },
}
