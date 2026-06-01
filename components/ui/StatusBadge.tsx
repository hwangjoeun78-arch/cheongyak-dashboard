'use client'

type StatusType = 'open' | 'closing' | 'upcoming' | 'closed' | 'unknown'

const STATUS_MAP: Record<StatusType, { label: string; tone: string }> = {
  open:     { label: '접수중',   tone: 'green' },
  closing:  { label: '마감임박', tone: 'amber' },
  upcoming: { label: '접수예정', tone: 'gray' },
  closed:   { label: '접수마감', tone: 'red' },
  unknown:  { label: '정보없음', tone: 'gray' },
}

// 날짜 → 상태 계산 (YYYY-MM-DD 또는 YYYYMMDD)
export function getStatus(bgnde: string, endde: string): StatusType {
  const toDate = (s: string) => {
    if (!s) return null
    const c = s.replace(/-/g, '')
    if (c.length < 8) return null
    return new Date(Number(c.slice(0, 4)), Number(c.slice(4, 6)) - 1, Number(c.slice(6, 8)))
  }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = toDate(bgnde), end = toDate(endde)
  if (!start || !end) return 'unknown'
  if (today < start) return 'upcoming'
  if (today > end) return 'closed'
  // 접수중 — 마감 3일 이내면 closing
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000)
  return daysLeft <= 3 ? 'closing' : 'open'
}

export default function StatusBadge({
  status,
  pulse = true,
}: {
  status: StatusType
  pulse?: boolean
}) {
  const s = STATUS_MAP[status]
  const showPulse = pulse && (status === 'open' || status === 'closing')
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
      padding: '4px 10px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap',
      color: `var(--${s.tone}-ink)`, background: `var(--${s.tone}-tint)`,
      border: `1px solid color-mix(in srgb, var(--${s.tone}) 22%, transparent)`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: `var(--${s.tone})`,
        animation: showPulse ? 'cy-pulse 1.6s infinite' : 'none',
      }} />
      {s.label}
    </span>
  )
}
