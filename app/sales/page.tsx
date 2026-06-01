'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSales } from '@/lib/api-client'
import { formatDate, getStatusBadge } from '@/lib/utils'

const SIDO_LIST = ['', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

export default function SalesPage() {
  const [sido, setSido] = useState('')
  const [pageNo, setPageNo] = useState(1)

  const today = new Date()
  const startDate = `${today.getFullYear() - 1}${String(today.getMonth() + 1).padStart(2, '0')}01`
  const endDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  ).padStart(2, '0')}`

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-full', sido, pageNo],
    queryFn: () => fetchSales({ startDate, endDate, sido, pageNo, numOfRows: 20 }),
  })

  const totalPages = data ? Math.ceil(data.totalCount / 20) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분양정보</h1>
          <p className="text-sm text-gray-500 mt-1">전체 {data?.totalCount.toLocaleString() ?? '-'}건</p>
        </div>
        <select
          value={sido}
          onChange={(e) => { setSido(e.target.value); setPageNo(1) }}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SIDO_LIST.map((s) => (
            <option key={s} value={s}>{s || '전체 지역'}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          데이터를 불러오지 못했습니다. API 키를 확인해주세요.
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">단지명</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-left">주택구분</th>
                <th className="px-4 py-3 text-center">공급규모</th>
                <th className="px-4 py-3 text-left">청약기간</th>
                <th className="px-4 py-3 text-left">당첨자발표</th>
                <th className="px-4 py-3 text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    해당 조건의 분양 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                data?.items.map((item, i) => {
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
                          <a href={item.hmpgAdres} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:underline">
                            {item.houseName}
                          </a>
                        ) : item.houseName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.sido} {item.gugun}</td>
                      <td className="px-4 py-3 text-gray-500">{item.houseSecd_nm || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.totSuplyHshldco ? `${Number(item.totSuplyHshldco).toLocaleString()}세대` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {formatDate(item.rceptBgnde)} ~ {formatDate(item.rceptEndde)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(item.przwnerPresnatnDe)}
                      </td>
                      <td className="px-4 py-3 text-center">
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

      {/* Pagination */}
      {totalPages > 1 && (
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
