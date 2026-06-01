// 서버 전용 TTL 캐시 (globalThis 싱글톤 — Vercel cold start 간 유지)
interface CacheEntry<T> {
  data: T
  expiresAt: number
  fetchedAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __ttlCache: Map<string, CacheEntry<unknown>> | undefined
}

function getCache(): Map<string, CacheEntry<unknown>> {
  if (!globalThis.__ttlCache) {
    globalThis.__ttlCache = new Map()
  }
  return globalThis.__ttlCache
}

export function cacheGet<T>(key: string): { data: T; cached: true; fetchedAt: number } | null {
  const entry = getCache().get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    getCache().delete(key)
    return null
  }
  return { data: entry.data, cached: true, fetchedAt: entry.fetchedAt }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  getCache().set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    fetchedAt: Date.now(),
  })
}

export function cacheStats() {
  const now = Date.now()
  const entries = [...getCache().entries()]
  return {
    total: entries.length,
    active: entries.filter(([, v]) => v.expiresAt > now).length,
    expired: entries.filter(([, v]) => v.expiresAt <= now).length,
  }
}

// TTL 상수 (ms)
export const TTL = {
  SALES: 15 * 60 * 1000,       // 분양정보 15분
  COMPETITION: 5 * 60 * 1000,  // 경쟁률 5분
  WINNERS: 60 * 60 * 1000,     // 당첨자 통계 60분
} as const
