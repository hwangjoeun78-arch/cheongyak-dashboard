'use client'

// 오늘 기준 D-day 계산 (YYYY-MM-DD 또는 YYYYMMDD)
export function calcDday(dateStr: string): number | null {
  if (!dateStr) return null
  const c = dateStr.replace(/-/g, '')
  if (c.length < 8) return null
  const target = new Date(Number(c.slice(0, 4)), Number(c.slice(4, 6)) - 1, Number(c.slice(6, 8)))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export default function Dday({ dateStr, label }: { dateStr: string; label?: string }) {
  const d = calcDday(dateStr)
  if (d === null) return <span className="text-gray-300">-</span>

  let txt: string, color: string
  if (d === 0) { txt = 'D-DAY'; color = 'var(--red)' }
  else if (d > 0) { txt = `D-${d}`; color = d <= 3 ? 'var(--amber-ink)' : 'var(--primary)' }
  else { txt = `D+${-d}`; color = 'var(--ink-4)' }

  return (
    <span className="num" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5, fontWeight: 800, fontSize: 12.5, color }}>
      {txt}
      {label && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>{label}</span>}
    </span>
  )
}
