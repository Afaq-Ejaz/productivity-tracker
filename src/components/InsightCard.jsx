import React from 'react'

export default function InsightCard({ insight, loading }) {
  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Gemini is reading your data...
          </span>
        </div>
      </div>
    )
  }

  if (!insight) return null

  return (
    <div style={cardStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={blockStyle('#c8f535', 'rgba(200,245,53,0.08)')}>
          <div style={labelStyle}>✦ encouragement</div>
          <p style={textStyle}>{insight.encouragement}</p>
        </div>
        <div style={blockStyle('#ff4d6d', 'rgba(255,77,109,0.08)')}>
          <div style={labelStyle}>⚠ pain point</div>
          <p style={textStyle}>{insight.painPoint}</p>
        </div>
      </div>
      {insight.streak && (
        <div style={{ ...blockStyle('#5b8dee', 'rgba(91,141,238,0.08)'), marginTop: 12 }}>
          <div style={labelStyle}>◎ pattern</div>
          <p style={textStyle}>{insight.streak}</p>
        </div>
      )}
    </div>
  )
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 20,
}

const blockStyle = (color, bg) => ({
  background: bg,
  border: `1px solid ${color}22`,
  borderRadius: 'var(--radius)',
  padding: '14px 16px',
})

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  marginBottom: 8,
}

const textStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--text-primary)',
}

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  justifyContent: 'center',
  padding: '12px 0',
}

const spinnerStyle = {
  width: 16,
  height: 16,
  border: '2px solid var(--border)',
  borderTop: '2px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}
