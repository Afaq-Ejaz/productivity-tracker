import React, { useState, useEffect, useCallback } from 'react'
import { getProductivityData, buildSummary } from '../googleApi.js'
import { getGeminiInsight } from '../geminiApi.js'
import { signOut } from '../auth.js'
import ProductivityChart from './ProductivityChart.jsx'
import InsightCard from './InsightCard.jsx'

const RANGES = ['week', 'month', 'year']

export default function Dashboard({ onSignOut }) {
  const [range, setRange] = useState('week')
  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)
  const [insight, setInsight] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (r) => {
    setLoadingData(true)
    setLoadingInsight(true)
    setInsight(null)
    setError(null)
    try {
      const d = await getProductivityData(r)
      const s = buildSummary(d)
      setData(d)
      setSummary(s)
      setLoadingData(false)

      const ins = await getGeminiInsight(s, r)
      setInsight(ins)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoadingData(false)
      setLoadingInsight(false)
    }
  }, [])

  useEffect(() => { load(range) }, [range, load])

  const handleSignOut = () => {
    signOut()
    onSignOut()
  }

  const avg = summary?.avg ?? 0
  const scoreColor = avg >= 70 ? 'var(--accent)' : avg >= 40 ? 'var(--blue)' : 'var(--red)'

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>PRODUCTIVITY</div>
          <div style={styles.sublogo}>TRACKER</div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.scorePill}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>AVG SCORE</span>
            <span style={{ color: scoreColor, fontSize: 22, fontWeight: 700 }}>{avg}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>/100</span>
          </div>
          <button onClick={handleSignOut} style={styles.signOutBtn}>Sign out</button>
        </div>
      </header>

      {/* Range tabs */}
      <div style={styles.tabs}>
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{ ...styles.tab, ...(range === r ? styles.tabActive : {}) }}
          >
            {r.toUpperCase()}
          </button>
        ))}
      </div>

      {error && (
        <div style={styles.error}>⚠ {error}</div>
      )}

      {/* Stats row */}
      {summary && (
        <div style={styles.statsRow}>
          <StatBox label="Tasks Done" value={summary.totalTasks} color="var(--blue)" />
          <StatBox label="Events" value={summary.totalEvents} color="var(--purple)" />
          <StatBox label="Zero Days" value={summary.zeroDays} color="var(--red)" />
          <StatBox label="Best Score" value={`${summary.best?.score ?? 0}`} color="var(--accent)" />
        </div>
      )}

      {/* Chart */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>PRODUCTIVITY SCORE — {range.toUpperCase()}</div>
        {loadingData ? (
          <div style={styles.chartLoading}>
            <div style={styles.spinner} />
          </div>
        ) : data.length > 0 ? (
          <ProductivityChart data={data} rangeType={range} />
        ) : (
          <div style={styles.empty}>No data found for this period.</div>
        )}
      </div>

      {/* Gemini Insight */}
      <InsightCard insight={insight} loading={loadingInsight} />

      {/* Footer */}
      <div style={styles.footer}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          powered by gemini · data from google calendar + tasks
        </span>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={styles.statBox}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.08em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '32px 24px',
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    animation: 'fadeUp 0.4s ease both',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  sublogo: {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    letterSpacing: '0.3em',
    marginTop: 2,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  scorePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 50,
    padding: '8px 18px',
  },
  signOutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: 8,
  },
  tab: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    borderRadius: 8,
    padding: '8px 20px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.08em',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#0a0a0f',
    fontWeight: 600,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  statBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 18px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
  },
  cardLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    color: 'var(--text-muted)',
    marginBottom: 20,
  },
  chartLoading: {
    height: 260,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 24,
    height: 24,
    border: '2px solid var(--border)',
    borderTop: '2px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
  },
  error: {
    background: 'rgba(255,77,109,0.1)',
    border: '1px solid rgba(255,77,109,0.3)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    color: 'var(--red)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    paddingTop: 8,
  },
}
