'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWinnersArea } from '@/lib/api-client'
import { getRecentYearMonths } from '@/lib/utils'
import EChart from '@/components/charts/EChart'
import KoreaMap from '@/components/charts/KoreaMap'
import DataFreshness from '@/components/DataFreshness'

const SIDO_LIST = [
  { code: '', name: '전체' },
  { code: '100', name: '서울' }, { code: '410', name: '경기' }, { code: '400', name: '인천' },
  { code: '600', name: '부산' }, { code: '700', name: '대구' }, { code: '500', name: '광주' },
  { code: '300', name: '대전' }, { code: '680', name: '울산' }, { code: '338', name: '세종' },
  { code: '200', name: '강원' }, { code: '360', name: '충북' }, { code: '312', name: '충남' },
  { code: '560', name: '전북' }, { code: '513', name: '전남' }, { code: '712', name: '경북' },
  { code: '621', name: '경남' }, { code: '690', name: '제주' },
]

export default function WinnersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">불러오는 중…</div>}>
      <WinnersInner />
    </Suspense>
  )
}

function WinnersInner() {
  const { from, to } = getRecentYearMonths(6)
  const [pageNo, setPageNo] = useState(1)
  const [areaCode, setAreaCode] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['winners-area', from, to, areaCode, pageNo],
    queryFn: () => fetchWinnersArea({
      statDeGte: from, statDeLte: to,
      subscrptAreaCode: areaCode || undefined,
      pageNo, numOfRows: 20,
    }),
  })

  // 지도용 데이터: 시도별 당첨자 합계
  const sidoMapData = data?.items.reduce<Record<string, number>>((acc, item) => {
    const name = item.SUBSCRPT_AREA_CODE_NM
    if (!name) return acc
    const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
    acc[name] = (acc[name] ?? 0) + total
    return acc
  }, {}) ?? {}

  const mapData = Object.entries(sidoMapData).map(([name, value]) => ({ name, value }))

  // 연령별 막대 차트
  const ageBarOption = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: [...new Set(data?.items.map(i => `${i.STAT_DE.slice(0,4)}.${i.STAT_DE.slice(4,6)}`))].sort(),
      axisLabel: { fontSize: 10 },
    },
    yAxis: { type: 'value' },
    series: [
      { name: '30대 이하', type: 'bar', stack: 'age', itemStyle: { color: '#3b82f6' },
        data: [...new Set(data?.items.map(i => i.STAT_DE))].sort().map(de =>
          data!.items.filter(i => i.STAT_DE === de).reduce((s, i) => s + (i.AGE_30 ?? 0), 0)) },
      { name: '40대', type: 'bar', stack: 'age', itemStyle: { color: '#8b5cf6' },
        data: [...new Set(data?.items.map(i => i.STAT_DE))].sort().map(de =>
          data!.items.filter(i => i.STAT_DE === de).reduce((s, i) => s + (i.AGE_40 ?? 0), 0)) },
      { name: '50대', type: 'bar', stack: 'age', itemStyle: { color: '#f59e0b' },
        data: [...new Set(data?.items.map(i => i.STAT_DE))].sort().map(de =>
          data!.items.filter(i => i.STAT_DE === de).reduce((s, i) => s + (i.AGE_50 ?? 0), 0)) },
      { name: '60대 이상', type: 'bar', stack: 'age', itemStyle: { color: '#10b981' },
        data: [...new Set(data?.items.map(i => i.STAT_DE))].sort().map(de =>
          data!.items.filter(i => i.STAT_DE === de).reduce((s, i) => s + (i.AGE_60 ?? 0), 0)) },
    ],
  }

  // 시도별 당첨자 막대
  const sidoBarOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 10, bottom: 60 },
    xAxis: {
      type: 'category',
      data: Object.entries(sidoMapData).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k),
      axisLabel: { fontSize: 11, rotate: 30 },
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: Object.entries(sidoMapData).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([, v]) => v),
      itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
    }],
  }

  const totalWinners = mapData.reduce((s, d) => s + d.value, 0)
  const totalPages = data ? Math.ceil((data.matchCount ?? 0) / 20) : 1

  const handleExportCSV = () => {
    if (!data?.items.length) return
    const headers = ['제공연월', '지역', '30대이하', '40대', '50대', '60대이상', '합계']
    const rows = data.items.map(item => {
      const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
      return [item.STAT_DE, item.SUBSCRPT_AREA_CODE_NM, item.AGE_30, item.AGE_40, item.AGE_50, item.AGE_60, total]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = '지역별당첨자.csv'; a.click()
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">당첨자 정보</h1>
          <p className="text-sm text-gray-500 mt-1">
            {from.slice(0,4)}.{from.slice(4,6)} ~ {to.slice(0,4)}.{to.slice(4,6)} | 총 {(data?.matchCount ?? 0).toLocaleString()}건
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <DataFreshness cached={data?.cached} fetchedAt={data?.fetchedAt} />
          <select value={areaCode} onChange={e => { setAreaCode(e.target.value); setPageNo(1) }}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SIDO_LIST.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
          {data?.items.length ? (
            <button onClick={handleExportCSV}
              className="text-xs px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">CSV</button>
          ) : null}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '총 당첨자', value: `${totalWinners.toLocaleString()}명` },
          { label: '조회 지역 수', value: `${mapData.length}개` },
          { label: '30대 이하', value: `${(data?.items.reduce((s, i) => s + (i.AGE_30 ?? 0), 0) ?? 0).toLocaleString()}명` },
          { label: '40대 이상', value: `${(data?.items.reduce((s, i) => s + (i.AGE_40 ?? 0) + (i.AGE_50 ?? 0) + (i.AGE_60 ?? 0), 0) ?? 0).toLocaleString()}명` },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">{card.label}</p>
            {isLoading
              ? <div className="h-6 w-20 bg-gray-200 animate-pulse rounded mt-1" />
              : <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>}
          </div>
        ))}
      </div>

      {/* 코로플레스 지도 + 시도별 막대 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">시도별 당첨자 현황 (지도)</h2>
          <KoreaMap data={mapData} loading={isLoading} valueLabel="명" />
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">시도별 당첨자 Top 10</h2>
          <EChart option={sidoBarOption} height={400} loading={isLoading} />
        </div>
      </div>

      {/* 월별 연령대별 누적 막대 */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-800 mb-3">월별 연령대별 당첨자</h2>
        <EChart option={ageBarOption} height={260} loading={isLoading} />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">지역별 당첨자 상세</h2>
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
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td>
                    </tr>
                  ))
                : data?.items.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td></tr>
                  : data?.items.map((item, i) => {
                      const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
                      return (
                        <tr key={i} className="border-t hover:bg-gray-50">
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
