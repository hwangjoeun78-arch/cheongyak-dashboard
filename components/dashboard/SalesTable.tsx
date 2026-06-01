'use client'

import { SaleItem } from '@/lib/types'
import { formatDate, getStatusBadge } from '@/lib/utils'

interface Props {
  items: SaleItem[]
  loading?: boolean
}

export default function SalesTable({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b flex gap-4">
            <div className="h-4 w-40 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-800">최근 분양 현황</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-left">단지명</th>
              <th className="px-4 py-3 text-left">지역</th>
              <th className="px-4 py-3 text-left">공급규모</th>
              <th className="px-4 py-3 text-left">청약기간</th>
              <th className="px-4 py-3 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, i) => {
                const status = getStatusBadge(item.rceptBgnde, item.rceptEndde)
                const badgeClass = {
                  default: 'bg-blue-100 text-blue-700',
                  secondary: 'bg-gray-100 text-gray-600',
                  destructive: 'bg-red-100 text-red-600',
                  outline: 'bg-white border text-gray-500',
                }[status.variant]

                return (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.hmpgAdres ? (
                        <a
                          href={item.hmpgAdres}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.houseName}
                        </a>
                      ) : (
                        item.houseName
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.sido} {item.gugun}</td>
                    <td className="px-4 py-3 text-gray-600">{item.totSuplyHshldco ? `${Number(item.totSuplyHshldco).toLocaleString()}세대` : '-'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(item.rceptBgnde)} ~ {formatDate(item.rceptEndde)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
