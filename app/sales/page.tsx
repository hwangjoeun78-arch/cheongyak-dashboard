'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSales } from '@/lib/api-client'
import { formatDate, getRecentDateRange, getStatusBadge } from '@/lib/utils'
import EChart from '@/components/charts/EChart'
import DataFreshness from '@/components/DataFreshness'

const SIDO_LIST = ['', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

export default function SalesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">불러오는 중…</div>}>
      <SalesInner />
    </Suspense>
  )
}

function SalesInner() {
  const { startDate, endDate } = getRecentDateRange(6)
  const [sido, setSido] = useState('')
  const [pageNo, setPageNo] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-full', sido, pageNo],
    queryFn: () => fetchSales({ startDate, endDate, sido: sido || undefined, pageNo, numOfRows: 20 }),
  })

  // 차트용 데이터
  const sidoCount = data?.items.reduce<Record<string, number>>((acc, item) => {
    const r = item.SUBSCRPT_AREA_CODE_NM ?? '기타'
    acc[r] = (acc[r] ?? 0) + 1
    return acc
  }, {}) ?? {}

  const sidoSupply = data?.items.reduce<Record<string, number>>((acc, item) => {
    const r = item.SUBSCRPT_AREA_CODE_NM ?? '기타'
    acc[r] = (acc[r] ?? 0) + (Number(item.TOT_SUPLY_HSHLDCO) || 0)
    return acc
  }, {}) ?? {}

  const typeCount = data?.items.reduce<Record<string, number>>((acc, item) => {
    const t = item.HOUSE_DTL_SECD_NM || '기타'
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {}) ?? {}

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 10, bottom: 60 },
    xAxis: {
      type: 'category',
      data: Object.keys(sidoSupply).sort((a, b) => (sidoSupply[b] ?? 0) - (sidoSupply[a] ?? 0)).slice(0, 10),
      axisLabel: { fontSize: 11, rotate: 30 },
    },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` } },
    series: [{
      type: 'bar',
      data: Object.entries(sidoSupply).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([, v]) => v),
      itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] },
    }],
  }

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}건 ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      data: Object.entries(typeCount).map(([name, value]) => ({ name, value })),
      label: { show: false },
      emphasis: { label: { show: true } },
    }],
  }

  const totalPages = data ? Math.ceil((data.matchCount ?? 0) / 20) : 1

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분양정보</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? '로딩 중…' : `총 ${(data?.matchCount ?? 0).toLocaleString()}건`} | 모집공고일 기준 최근 6개월
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <DataFreshness cached={data?.cached} fetchedAt={data?.fetchedAt} />
          <select value={sido} onChange={e => { setSido(e.target.value); setPageNo(1) }}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SIDO_LIST.map(s => <option key={s} value={s}>{s || '전체 지역'}</option>)}
          </select>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '총 단지 수', value: `${(data?.matchCount ?? 0).toLocaleString()}건` },
          { label: '총 공급세대', value: `${Object.values(sidoSupply).reduce((a, b) => a + b, 0).toLocaleString()}세대` },
          { label: '공급 지역', value: `${Object.keys(sidoCount).length}개` },
          { label: '민영 비율', value: (() => {
            const total = Object.values(typeCount).reduce((a, b) => a + b, 0)
            const minyeong = typeCount['민영'] ?? 0
            return total > 0 ? `${Math.round(minyeong / total * 100)}%` : '-'
          })() },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">{card.label}</p>
            {isLoading
              ? <div className="h-6 w-20 bg-gray-200 animate-pulse rounded mt-1" />
              : <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
            }
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">지역별 공급세대 (Top 10)</h2>
          <EChart option={barOption} height={260} loading={isLoading} />
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">주택구분 비율</h2>
          <EChart option={pieOption} height={260} loading={isLoading} />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">단지명</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-left">구분</th>
                <th className="px-4 py-3 text-center">공급세대</th>
                <th className="px-4 py-3 text-left">청약기간</th>
                <th className="px-4 py-3 text-left">당첨자발표</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-left text-gray-400">관리번호</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td>
                    </tr>
                  ))
                : data?.items.length === 0
                  ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">해당 조건의 분양 데이터가 없습니다.</td></tr>
                  : data?.items.map((item, i) => {
                      const status = getStatusBadge(item.RCEPT_BGNDE, item.RCEPT_ENDDE)
                      const badgeClass = { default: 'bg-blue-100 text-blue-700', secondary: 'bg-gray-100 text-gray-600', destructive: 'bg-red-100 text-red-600', outline: 'bg-white border text-gray-500' }[status.variant]
                      return (
                        <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.HMPG_ADRES
                              ? <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.HOUSE_NM}</a>
                              : item.HOUSE_NM}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{item.SUBSCRPT_AREA_CODE_NM}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{item.HOUSE_DTL_SECD_NM || '-'}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(item.RCEPT_BGNDE)} ~ {formatDate(item.RCEPT_ENDDE)}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(item.PRZWNER_PRESNATN_DE)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>{status.label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-xs font-mono">{item.HOUSE_MANAGE_NO}</td>
                        </tr>
                      )
                    })
              }
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
