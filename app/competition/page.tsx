'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import EChart from '@/components/charts/EChart'
import DataFreshness from '@/components/DataFreshness'

export default function CompetitionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">불러오는 중…</div>}>
      <CompetitionInner />
    </Suspense>
  )
}

function CompetitionInner() {
  const [houseManageNo, setHouseManageNo] = useState('')
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['competition-search', houseManageNo],
    queryFn: async () => {
      const q = new URLSearchParams({ houseManageNo, numOfRows: '100' })
      const res = await fetch(`/api/competition?${q}`)
      return res.json()
    },
    enabled: submitted && !!houseManageNo,
  })

  const handleSearch = () => {
    setHouseManageNo(input.trim())
    setSubmitted(true)
  }

  // 차트 데이터
  const items: any[] = data?.items ?? []

  // 평형별 경쟁률 (1순위, 해당지역)
  const rank1Items = items.filter((i: any) => i.SUBSCRPT_RANK_CODE === 1 || i.SUBSCRPT_RANK_CODE === '1')
  const barOption = {
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}<br/>경쟁률: ${p[0].value} : 1` },
    grid: { left: 60, right: 20, top: 20, bottom: 60 },
    xAxis: {
      type: 'category',
      data: rank1Items.map((i: any) => i.HOUSE_TY),
      axisLabel: { fontSize: 10, rotate: 30 },
    },
    yAxis: { type: 'value', name: '경쟁률', axisLabel: { formatter: (v: number) => `${v}:1` } },
    series: [{
      type: 'bar',
      data: rank1Items.map((i: any) => {
        const rate = parseFloat(i.CMPET_RATE) || 0
        return {
          value: rate,
          itemStyle: { color: rate >= 50 ? '#ef4444' : rate >= 10 ? '#f97316' : '#22c55e', borderRadius: [4, 4, 0, 0] },
        }
      }),
    }],
  }

  // 1순위 vs 2순위 비교 (해당지역 기준)
  const typesSet = [...new Set(items.map((i: any) => i.HOUSE_TY))]
  const rank2Items = items.filter((i: any) => i.SUBSCRPT_RANK_CODE === 2 || i.SUBSCRPT_RANK_CODE === '2')
  const compareOption = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: typesSet, axisLabel: { fontSize: 10, rotate: 20 } },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${v}:1` } },
    series: [
      {
        name: '1순위',
        type: 'bar',
        data: typesSet.map(ty => parseFloat(rank1Items.find((i: any) => i.HOUSE_TY === ty)?.CMPET_RATE ?? '0') || 0),
        itemStyle: { color: '#3b82f6' },
      },
      {
        name: '2순위',
        type: 'bar',
        data: typesSet.map(ty => parseFloat(rank2Items.find((i: any) => i.HOUSE_TY === ty)?.CMPET_RATE ?? '0') || 0),
        itemStyle: { color: '#a5b4fc' },
      },
    ],
  }

  // 배정 vs 접수 비교
  const supplyOption = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: typesSet, axisLabel: { fontSize: 10, rotate: 20 } },
    yAxis: { type: 'value' },
    series: [
      {
        name: '공급세대',
        type: 'bar',
        data: typesSet.map(ty => Number(rank1Items.find((i: any) => i.HOUSE_TY === ty)?.SUPLY_HSHLDCO ?? 0)),
        itemStyle: { color: '#10b981' },
      },
      {
        name: '접수건수',
        type: 'bar',
        data: typesSet.map(ty => Number(rank1Items.find((i: any) => i.HOUSE_TY === ty)?.REQ_CNT ?? 0)),
        itemStyle: { color: '#f59e0b' },
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">청약 경쟁률</h1>
        <p className="text-sm text-gray-500 mt-1">
          분양정보 페이지에서 관리번호를 확인 후 조회하세요.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-800 mb-4">단지 경쟁률 조회</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="주택관리번호 입력 (예: 2022000001)"
            value={input}
            onChange={e => { setInput(e.target.value); setSubmitted(false) }}
            onKeyDown={e => e.key === 'Enter' && input && handleSearch()}
            className="border rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={!input}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            조회
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          💡 분양정보 페이지 테이블 맨 오른쪽 "관리번호" 열 값을 사용하세요.
        </p>
      </div>

      {submitted && (
        <>
          {/* 데이터 신선도 */}
          <div className="flex justify-end">
            <DataFreshness cached={data?.cached} fetchedAt={data?.fetchedAt} />
          </div>

          {/* KPI */}
          {!isLoading && items.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '평형 수', value: `${typesSet.length}개` },
                { label: '최고 경쟁률', value: (() => {
                  const max = Math.max(...rank1Items.map((i: any) => parseFloat(i.CMPET_RATE) || 0))
                  return max > 0 ? `${max.toFixed(1)} : 1` : '-'
                })() },
                { label: '총 공급세대', value: `${rank1Items.reduce((s: number, i: any) => s + Number(i.SUPLY_HSHLDCO || 0), 0).toLocaleString()}세대` },
                { label: '총 접수건수', value: `${rank1Items.reduce((s: number, i: any) => s + Number(i.REQ_CNT || 0), 0).toLocaleString()}건` },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-xl border p-4">
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* 차트들 */}
          {!isLoading && items.length > 0 && (
            <>
              <div className="bg-white rounded-xl border p-5">
                <h2 className="font-semibold text-gray-800 mb-3">평형별 1순위 경쟁률</h2>
                <div className="flex gap-3 text-xs mb-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> 10:1 미만</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" /> 10~50:1</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> 50:1 이상</span>
                </div>
                <EChart option={barOption} height={280} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border p-5">
                  <h2 className="font-semibold text-gray-800 mb-3">1순위 vs 2순위 경쟁률 비교</h2>
                  <EChart option={compareOption} height={260} />
                </div>
                <div className="bg-white rounded-xl border p-5">
                  <h2 className="font-semibold text-gray-800 mb-3">공급세대 vs 접수건수</h2>
                  <EChart option={supplyOption} height={260} />
                </div>
              </div>
            </>
          )}

          {/* 테이블 */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">경쟁률 상세</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">주택형</th>
                    <th className="px-4 py-3 text-center">공급세대</th>
                    <th className="px-4 py-3 text-center">순위</th>
                    <th className="px-4 py-3 text-left">거주지역</th>
                    <th className="px-4 py-3 text-center">접수건수</th>
                    <th className="px-4 py-3 text-center">경쟁률</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-t">
                          <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td>
                        </tr>
                      ))
                    : items.length === 0
                      ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">데이터가 없습니다.</td></tr>
                      : items.map((item: any, i: number) => {
                          const rate = parseFloat(item.CMPET_RATE) || 0
                          const rateColor = rate >= 50 ? 'text-red-600 font-bold' : rate >= 10 ? 'text-orange-500 font-semibold' : 'text-gray-700'
                          return (
                            <tr key={i} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{item.HOUSE_TY}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{Number(item.SUPLY_HSHLDCO).toLocaleString()}세대</td>
                              <td className="px-4 py-3 text-center text-gray-500">{item.SUBSCRPT_RANK_CODE}순위</td>
                              <td className="px-4 py-3 text-gray-600">{item.RESIDE_SENM}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{Number(item.REQ_CNT).toLocaleString()}건</td>
                              <td className={`px-4 py-3 text-center ${rateColor}`}>
                                {item.CMPET_RATE !== '-' ? `${item.CMPET_RATE} : 1` : '-'}
                              </td>
                            </tr>
                          )
                        })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
