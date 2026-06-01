'use client'

import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSales, fetchWinnersArea } from '@/lib/api-client'
import { getRecentDateRange, getRecentYearMonths, formatDate } from '@/lib/utils'
import DataFreshness from '@/components/DataFreshness'
import EChart from '@/components/charts/EChart'
import { Building2, TrendingUp, Users, MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">불러오는 중…</div>}>
      <HomeInner />
    </Suspense>
  )
}

function HomeInner() {
  const { startDate, endDate } = getRecentDateRange(3)
  const { from: statDeGte, to: statDeLte } = getRecentYearMonths(3)

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-home', startDate, endDate],
    queryFn: () => fetchSales({ startDate, endDate, numOfRows: 20 }),
  })

  const { data: winnersData, isLoading: winnersLoading } = useQuery({
    queryKey: ['winners-home', statDeGte, statDeLte],
    queryFn: () => fetchWinnersArea({ statDeGte, statDeLte, numOfRows: 50 }),
  })

  const totalWinners = winnersData?.items.reduce(
    (s, i) => s + (i.AGE_30 ?? 0) + (i.AGE_40 ?? 0) + (i.AGE_50 ?? 0) + (i.AGE_60 ?? 0), 0
  ) ?? 0

  // 지역별 공급세대 합계
  const sidoSupply = salesData?.items.reduce<Record<string, number>>((acc, item) => {
    const region = item.SUBSCRPT_AREA_CODE_NM ?? '기타'
    acc[region] = (acc[region] ?? 0) + (Number(item.TOT_SUPLY_HSHLDCO) || 0)
    return acc
  }, {}) ?? {}

  const supplyChartData = Object.entries(sidoSupply)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // 연령별 당첨자 합계
  const ageData = winnersData?.items.reduce(
    (acc, item) => ({
      age30: acc.age30 + (item.AGE_30 ?? 0),
      age40: acc.age40 + (item.AGE_40 ?? 0),
      age50: acc.age50 + (item.AGE_50 ?? 0),
      age60: acc.age60 + (item.AGE_60 ?? 0),
    }),
    { age30: 0, age40: 0, age50: 0, age60: 0 }
  )

  // 월별 당첨자 추이
  const monthlyWinners = winnersData?.items.reduce<Record<string, number>>((acc, item) => {
    const ym = `${item.STAT_DE.slice(0, 4)}.${item.STAT_DE.slice(4, 6)}`
    const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
    acc[ym] = (acc[ym] ?? 0) + total
    return acc
  }, {}) ?? {}

  const monthlyEntries = Object.entries(monthlyWinners).sort(([a], [b]) => a.localeCompare(b))

  // 차트 옵션
  const supplyBarOption = {
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}<br/>${p[0].value.toLocaleString()}세대` },
    grid: { left: 60, right: 20, top: 20, bottom: 60 },
    xAxis: {
      type: 'category',
      data: supplyChartData.map(([k]) => k),
      axisLabel: { fontSize: 11, rotate: 30 },
    },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` } },
    series: [{
      type: 'bar',
      data: supplyChartData.map(([, v]) => v),
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
    }],
  }

  const agePieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}명 ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: ageData?.age30 ?? 0, name: '30대 이하', itemStyle: { color: '#3b82f6' } },
        { value: ageData?.age40 ?? 0, name: '40대', itemStyle: { color: '#8b5cf6' } },
        { value: ageData?.age50 ?? 0, name: '50대', itemStyle: { color: '#f59e0b' } },
        { value: ageData?.age60 ?? 0, name: '60대 이상', itemStyle: { color: '#10b981' } },
      ],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
    }],
  }

  const monthlyLineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: monthlyEntries.map(([k]) => k), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{
      type: 'line',
      data: monthlyEntries.map(([, v]) => v),
      smooth: true,
      areaStyle: { color: 'rgba(59, 130, 246, 0.15)' },
      lineStyle: { color: '#3b82f6', width: 2 },
      itemStyle: { color: '#3b82f6' },
      symbol: 'circle',
      symbolSize: 6,
    }],
  }

  const isLoading = salesLoading || winnersLoading

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">청약 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">
            최근 3개월 기준 ({startDate} ~ {endDate})
          </p>
        </div>
        <div className="flex gap-2">
          <DataFreshness cached={salesData?.cached} fetchedAt={salesData?.fetchedAt} />
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: '분양 단지', tone: 'primary',
            value: isLoading ? '-' : `${(salesData?.matchCount ?? 0).toLocaleString()}건`, sub: '필터 기준' },
          { icon: MapPin, label: '공급 지역 수', tone: 'violet',
            value: isLoading ? '-' : `${Object.keys(sidoSupply).length}개`, sub: '지역' },
          { icon: Users, label: '당첨자 합계', tone: 'green',
            value: isLoading ? '-' : `${totalWinners.toLocaleString()}명`, sub: '연령대 합산' },
          { icon: TrendingUp, label: '총 공급세대', tone: 'amber',
            value: isLoading ? '-' : `${Object.values(sidoSupply).reduce((a, b) => a + b, 0).toLocaleString()}세대`, sub: '조회 기간' },
        ].map((card, i) => (
          <div key={i} className="cy-card flex items-start gap-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 18, boxShadow: 'var(--sh-xs)' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 10, color: `var(--${card.tone}-ink)`, background: `var(--${card.tone}-tint)` }}>
              <card.icon className="h-5 w-5" />
            </span>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{card.label}</p>
              {isLoading
                ? <div className="h-7 w-20 animate-pulse rounded mt-1" style={{ background: 'var(--bg-2)' }} />
                : <p className="num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginTop: 2, lineHeight: 1.1 }}>{card.value}</p>}
              <p style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 차트 1행: 지역별 공급세대 막대 + 연령별 도넛 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 cy-panel cy-panel-pad">
          <h2 className="cy-h2">지역별 공급세대 현황 (Top 10)</h2>
          <EChart option={supplyBarOption} height={280} loading={salesLoading} />
        </div>
        <div className="xl:col-span-2 cy-panel cy-panel-pad">
          <h2 className="cy-h2">연령별 당첨자 비율</h2>
          <EChart option={agePieOption} height={280} loading={winnersLoading} />
        </div>
      </div>

      {/* 차트 2행: 월별 당첨자 추이 */}
      <div className="cy-panel cy-panel-pad">
        <h2 className="cy-h2">월별 당첨자 추이</h2>
        <EChart option={monthlyLineOption} height={220} loading={winnersLoading} />
      </div>

      {/* 최근 분양 테이블 */}
      <div className="cy-panel overflow-hidden">
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="cy-h2" style={{ marginBottom: 0 }}>최근 분양 현황</h2>
          <a href="/sales" className="text-xs cy-link">전체 보기 →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="cy-thead">
              <tr>
                <th className="px-4 py-3 text-left">단지명</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-center">공급세대</th>
                <th className="px-4 py-3 text-left">청약기간</th>
                <th className="px-4 py-3 text-left">당첨자발표</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                : salesData?.items.slice(0, 8).map((item, i) => (
                    <tr key={i} className="cy-row" style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--ink)' }}>
                        {item.HMPG_ADRES
                          ? <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer" className="cy-link">{item.HOUSE_NM}</a>
                          : item.HOUSE_NM}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>{item.SUBSCRPT_AREA_CODE_NM}</td>
                      <td className="px-4 py-3 text-center num" style={{ color: 'var(--ink-2)' }}>
                        {item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap num" style={{ color: 'var(--ink-3)' }}>
                        {formatDate(item.RCEPT_BGNDE)} ~ {formatDate(item.RCEPT_ENDDE)}
                      </td>
                      <td className="px-4 py-3 text-xs num" style={{ color: 'var(--ink-3)' }}>{formatDate(item.PRZWNER_PRESNATN_DE)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
