'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/sales', label: '분양정보' },
  { href: '/competition', label: '경쟁률' },
  { href: '/winners', label: '당첨자' },
]

function Logo() {
  return (
    <svg viewBox="0 0 100 100" width="34" height="34" style={{ borderRadius: 9 }}>
      <rect width="100" height="100" rx="22" fill="#1B4DFF" />
      <g fill="#fff">
        <rect x="34" y="46" width="13" height="32" rx="2" />
        <rect x="50" y="32" width="16" height="46" rx="2" />
        <rect x="69" y="52" width="11" height="26" rx="2" />
      </g>
      <circle cx="30" cy="34" r="7" fill="#fff" opacity="0.9" />
    </svg>
  )
}

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: 'var(--sh-xs)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex items-center gap-2.5">
            <Logo />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                청약 대시보드
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: -2 }}>
                한국부동산원 청약홈
              </div>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--r-sm)', fontSize: 14, fontWeight: 700,
                    transition: 'all .15s',
                    color: active ? '#fff' : 'var(--ink-2)',
                    background: active ? 'var(--primary)' : 'transparent',
                  }}
                  className={active ? '' : 'hover:bg-[var(--bg-2)]'}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="ml-2"><ThemeToggle /></div>
          </div>
        </div>
      </div>
    </nav>
  )
}
