'use client'

interface Props {
  cached?: boolean
  fetchedAt?: number
}

export default function DataFreshness({ cached, fetchedAt }: Props) {
  if (fetchedAt === undefined) return null

  const time = new Date(fetchedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      cached
        ? 'bg-gray-100 text-gray-500'
        : 'bg-green-100 text-green-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cached ? 'bg-gray-400' : 'bg-green-500'}`} />
      {cached ? `캐시 (${time})` : `실시간 ${time}`}
    </span>
  )
}
