'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CompetitionItem } from '@/lib/types'

interface Props {
  items: CompetitionItem[]
  loading?: boolean
}

function getBarColor(rate: number): string {
  if (rate >= 50) return '#ef4444'
  if (rate >= 10) return '#f97316'
  return '#22c55e'
}

export default function CompetitionChart({ items, loading }: Props) {
  const chartData = items
    .map((item) => ({
      name: item.houseName?.length > 8 ? item.houseName.slice(0, 8) + '…' : item.houseName,
      fullName: item.houseName,
      rate: Number(item.gnrlRnk1CrspaQu ?? 0),
    }))
    .filter((d) => d.rate > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 15)

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="h-5 w-40 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-64 bg-gray-100 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">경쟁률 현황 (상위 15개 단지)</h2>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> 10:1 미만</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" /> 10~50:1</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> 50:1 이상</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          경쟁률 데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}:1`} />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(2)} : 1`, '1순위 경쟁률']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
            />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
