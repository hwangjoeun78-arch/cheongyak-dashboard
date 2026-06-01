'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWinnersArea } from '@/lib/api-client'
import { getRecentYearMonths } from '@/lib/utils'

const SIDO_LIST = [
  { code: '', name: '전체' },
  { code: '100', name: '서울' },
  { code: '410', name: '경기' },
  { code: '400', name: '인천' },
  { code: '600', name: '부산' },
  { code: '700', name: '대구' },
  { code: '500', name: '광주' },
  { code: '300', name: '대전' },
  { code: '680', name: '울산' },
  { code: '338', name: '세종' },
  { code: '200', name: '강원' },
  { code: '360', name: '충북' },
  { code: '312', name: '충남' },
  { code: '560', name: '전북' },
  { code: '513', name: '전남' },
  { code: '712', name: '경북' },
  { code: '621', name: '경남' },
  { code: '690', name: '제주' },
]

export default function WinnersPage() {
  const { from, to } = getRecentYearMonths(6)
  const [pageNo, setPageNo] = useState(1)
  const [areaCode, setAreaCode] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['winners-area', from, to, areaCode, pageNo],
    queryFn: () => fetchWinnersArea({
      statDeGte: from,
      statDeLte: to,
      subscrptAreaCode: areaCode || undefined,
      pageNo,
      numOfRows: 20,
    }),
  })

  const totalWinners = data?.items.reduce(
    (sum, item) => sum + (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0),
    0
  ) ?? 0

  const totalPages = data ? Math.ceil(data.totalCount / 20) : 1

  const handleExportCSV = () => {
    if (!data?.items.length) return
    const headers = ['제공연월', '지역', '30대이하', '40대', '50대', '60대이상', '합계']
    const rows = data.items.map(item => {
      const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
      return [item.STAT_DE, item.SUBSCRPT_AREA_CODE_NM, item.AGE_30, item.AGE_40, item.AGE_50, item.AGE_60, total]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = '지역별당첨자.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">당첨자 정보</h1>
          <p className="text-sm text-gray-500 mt-1">
            조회 기간: {from.slice(0,4)}.{from.slice(4,6)} ~ {to.slice(0,4)}.{to.slice(4,6)} | 전체 {data?.totalCount.toLocaleString() ?? '-'}건
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={areaCode}
            onChange={e => { setAreaCode(e.target.value); setPageNo(1) }}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SIDO_LIST.map(s => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
          {data?.items.length ? (
            <button onClick={handleExportCSV}
              className="text-xs px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
              CSV 다운로드
            </button>
          ) : null}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          데이터를 불러오지 못했습니다. API 키를 확인해주세요.
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">지역별 당첨자 현황</h2>
          {!isLoading && (
            <span className="text-sm text-gray-500">총 당첨 {totalWinners.toLocaleString()}명</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">제공연월</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-center">30대 이하</th>
                <th className="px-4 py-3 text-center">40대</th>
                <th className="px-4 py-3 text-center">50대</th>
                <th className="px-4 py-3 text-center">60대 이상</th>
                <th className="px-4 py-3 text-center">합계</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    해당 기간·지역의 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                data?.items.map((item, i) => {
                  const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
                  return (
                    <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{item.STAT_DE.slice(0,4)}.{item.STAT_DE.slice(4,6)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.SUBSCRPT_AREA_CODE_NM}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{(item.AGE_30 ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{(item.AGE_40 ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{(item.AGE_50 ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{(item.AGE_60 ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">{total.toLocaleString()}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPageNo(p => Math.max(1, p - 1))} disabled={pageNo === 1}
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-50">이전</button>
          <span className="px-4 py-1.5 text-sm text-gray-600">{pageNo} / {totalPages}</span>
          <button onClick={() => setPageNo(p => Math.min(totalPages, p + 1))} disabled={pageNo === totalPages}
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-50">다음</button>
        </div>
      )}
    </div>
  )
}
