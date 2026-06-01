'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWinners } from '@/lib/api-client'
import { getRecentPeriod } from '@/lib/utils'
import WinnersTable from '@/components/dashboard/WinnersTable'

export default function WinnersPage() {
  const [pageNo, setPageNo] = useState(1)
  const [search, setSearch] = useState('')
  const { startDate, endDate } = getRecentPeriod(3)

  const { data, isLoading, error } = useQuery({
    queryKey: ['winners', startDate, endDate, pageNo],
    queryFn: () => fetchWinners({ startDate, endDate, pageNo, numOfRows: 20 }),
  })

  const filtered = search
    ? data?.items.filter((item) =>
        item.houseName?.includes(search) || item.sido?.includes(search)
      ) ?? []
    : data?.items ?? []

  const totalPages = data ? Math.ceil(data.totalCount / 20) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">당첨자 정보</h1>
          <p className="text-sm text-gray-500 mt-1">전체 {data?.totalCount.toLocaleString() ?? '-'}건</p>
        </div>
        <input
          type="text"
          placeholder="단지명 또는 지역 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          데이터를 불러오지 못했습니다. API 키를 확인해주세요.
        </div>
      )}

      <WinnersTable items={filtered} loading={isLoading} />

      {totalPages > 1 && !search && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPageNo((p) => Math.max(1, p - 1))}
            disabled={pageNo === 1}
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-4 py-1.5 text-sm text-gray-600">
            {pageNo} / {totalPages}
          </span>
          <button
            onClick={() => setPageNo((p) => Math.min(totalPages, p + 1))}
            disabled={pageNo === totalPages}
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
