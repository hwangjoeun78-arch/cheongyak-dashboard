'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSales } from '@/lib/api-client'
import { formatDate, getRecentDateRange } from '@/lib/utils'

const SIDO_LIST = ['', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

export default function SalesPage() {
  const { startDate, endDate } = getRecentDateRange(6)
  const [sido, setSido] = useState('')
  const [pageNo, setPageNo] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-full', sido, pageNo],
    queryFn: () => fetchSales({ startDate, endDate, sido: sido || undefined, pageNo, numOfRows: 20 }),
  })

  const totalPages = data ? Math.ceil(data.totalCount / 20) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분양정보</h1>
          <p className="text-sm text-gray-500 mt-1">전체 {data?.totalCount.toLocaleString() ?? '-'}건 | 모집공고일 기준 최근 6개월</p>
        </div>
        <select value={sido} onChange={e => { setSido(e.target.value); setPageNo(1) }}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {SIDO_LIST.map(s => <option key={s} value={s}>{s || '전체 지역'}</option>)}
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
                <th className="px-4 py-3 text-left">구분</th>
                <th className="px-4 py-3 text-center">공급규모</th>
                <th className="px-4 py-3 text-left">청약기간</th>
                <th className="px-4 py-3 text-left">당첨자발표</th>
                <th className="px-4 py-3 text-left">주택관리번호</th>
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
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">해당 조건의 분양 데이터가 없습니다.</td>
                </tr>
              ) : (
                data?.items.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.HMPG_ADRES ? (
                        <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:underline">{item.HOUSE_NM}</a>
                      ) : item.HOUSE_NM}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.SUBSCRPT_AREA_CODE_NM}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.HOUSE_DTL_SECD_NM || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(item.RCEPT_BGNDE)} ~ {formatDate(item.RCEPT_ENDDE)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(item.PRZWNER_PRESNATN_DE)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{item.HOUSE_MANAGE_NO}</td>
                  </tr>
                ))
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
