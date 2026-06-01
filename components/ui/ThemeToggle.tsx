'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = (localStorage.getItem('cy-theme') as 'light' | 'dark') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('cy-theme', next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="테마 전환"
      style={{
        display: 'grid', placeItems: 'center', width: 38, height: 38,
        borderRadius: 'var(--r-sm)', color: 'var(--ink-2)', background: 'var(--bg-2)',
        transition: 'all .15s',
      }}
      className="hover:opacity-80"
    >
      {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
    </button>
  )
}
