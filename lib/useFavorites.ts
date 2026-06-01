'use client'

import { useEffect, useState, useCallback } from 'react'

const KEY = 'cy-favorites'

// 관심단지 즐겨찾기 (localStorage 기반)
export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setFavs(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
  }, [])

  const persist = useCallback((next: Set<string>) => {
    setFavs(new Set(next))
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]))
    } catch { /* ignore */ }
  }, [])

  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }, [])

  const has = useCallback((id: string) => favs.has(id), [favs])

  return { favs, toggle, has, count: favs.size, persist }
}
