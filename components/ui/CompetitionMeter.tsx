'use client'

export default function CompetitionMeter({
  value,
  max = 150,
  compact = false,
}: {
  value: number | null | undefined
  max?: number
  compact?: boolean
}) {
  if (value == null || value === 0) {
    return <span style={{ fontSize: 12.5, color: 'var(--ink-4)', fontWeight: 600 }}>접수 전</span>
  }
  const pct = Math.min(100, (value / max) * 100)
  const lvl = value >= 80 ? 5 : value >= 40 ? 4 : value >= 15 ? 3 : value >= 5 ? 2 : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: compact ? 64 : 96 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span className="num" style={{ fontSize: compact ? 14 : 16, fontWeight: 800, color: 'var(--ink)' }}>
          {value.toFixed(1)}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>: 1</span>
        {lvl >= 5 && <span style={{ marginLeft: 2, fontSize: 13 }}>🔥</span>}
      </div>
      {!compact && (
        <div style={{ height: 5, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 999, background: `var(--heat-${lvl})`,
            transformOrigin: 'left', animation: 'cy-grow .6s cubic-bezier(.2,.7,.3,1)',
          }} />
        </div>
      )}
    </div>
  )
}
