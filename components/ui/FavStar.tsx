'use client'

import { Star } from 'lucide-react'

export default function FavStar({
  active,
  onClick,
  size = 18,
}: {
  active: boolean
  onClick: () => void
  size?: number
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label="관심단지"
      style={{
        display: 'grid', placeItems: 'center', width: size + 12, height: size + 12,
        borderRadius: 'var(--r-sm)', color: active ? '#F5A623' : 'var(--ink-4)',
        transition: 'transform .15s, color .15s', background: 'transparent',
      }}
      className="hover:scale-110 hover:bg-[var(--bg-2)]"
    >
      <Star size={size} fill={active ? '#F5A623' : 'none'} strokeWidth={active ? 0 : 1.8} />
    </button>
  )
}
