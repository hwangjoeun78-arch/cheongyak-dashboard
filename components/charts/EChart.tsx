'use client'

import dynamic from 'next/dynamic'
// ECharts는 SSR 불가 — dynamic import로 클라이언트에서만 렌더
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: any
  height?: number | string
  className?: string
  loading?: boolean
}

export default function EChart({ option, height = 300, className = '', loading }: Props) {
  if (loading) {
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-lg ${className}`}
        style={{ height }}
      />
    )
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      className={className}
      opts={{ renderer: 'canvas' }}
    />
  )
}
