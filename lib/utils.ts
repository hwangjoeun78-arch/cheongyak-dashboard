import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 8) return '-'
  const y = dateStr.slice(0, 4)
  const m = dateStr.slice(4, 6)
  const d = dateStr.slice(6, 8)
  return `${y}.${m}.${d}`
}

export function formatNumber(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '-'
  const num = Number(value)
  if (isNaN(num)) return String(value)
  return num.toLocaleString('ko-KR')
}

export function formatRate(value: string | undefined): string {
  if (!value || value === '0') return '-'
  const num = Number(value)
  if (isNaN(num)) return '-'
  return `${num.toFixed(2)} : 1`
}

export function getStatusBadge(rceptBgnde: string, rceptEndde: string): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const toDate = (s: string) => {
    if (!s || s.length < 8) return null
    return new Date(
      Number(s.slice(0, 4)),
      Number(s.slice(4, 6)) - 1,
      Number(s.slice(6, 8))
    )
  }

  const start = toDate(rceptBgnde)
  const end = toDate(rceptEndde)

  if (!start || !end) return { label: '정보없음', variant: 'outline' }
  if (today < start) return { label: '접수예정', variant: 'secondary' }
  if (today > end) return { label: '접수마감', variant: 'destructive' }
  return { label: '접수중', variant: 'default' }
}

export function getCurrentPeriod() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const startDate = `${year}${month}01`
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
  const endDate = `${year}${month}${lastDay}`
  return { startDate, endDate }
}

export function getRecentPeriod(months = 3) {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}${m}${day}`
  }
  return { startDate: fmt(start), endDate: fmt(end) }
}
