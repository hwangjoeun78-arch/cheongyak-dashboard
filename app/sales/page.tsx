'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSales } from '@/lib/api-client'
import { formatDate, getRecentDateRange } from '@/lib/utils'
import EChart from '@/components/charts/EChart'
import DataFreshness from '@/components/DataFreshness'
import StatusBadge, { getStatus } from '@/components/ui/StatusBadge'
import Dday from '@/components/ui/Dday'

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
  const [view, setView] = useState<'list' | 'card'>('list')

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
          {/* 뷰 전환 세그먼트 */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-2)', borderRadius: 'var(--r-sm)', padding: 3, gap: 2 }}>
            {([['list', '목록'], ['card', '카드']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  color: view === v ? 'var(--primary-ink)' : 'var(--ink-2)',
                  background: view === v ? 'var(--surface)' : 'transparent',
                  boxShadow: view === v ? 'var(--sh-sm)' : 'none', transition: 'all .15s',
                }}>
                {label}
              </button>
            ))}
          </div>
          <select value={sido} onChange={e => { setSido(e.target.value); setPageNo(1) }}
            style={{ border: '1px solid var(--border-2)', background: 'var(--surface)', color: 'var(--ink-2)' }}
            className="rounded-lg px-3 py-2 text-sm focus:outline-none">
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
          <div key={i} className="cy-card cy-panel" style={{ padding: 16 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{card.label}</p>
            {isLoading
              ? <div className="h-7 w-20 animate-pulse rounded mt-1" style={{ background: 'var(--bg-2)' }} />
              : <p className="num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>{card.value}</p>}
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 cy-panel cy-panel-pad">
          <h2 className="cy-h2">지역별 공급세대 (Top 10)</h2>
          <EChart option={barOption} height={260} loading={isLoading} />
        </div>
        <div className="cy-panel cy-panel-pad">
          <h2 className="cy-h2">주택구분 비율</h2>
          <EChart option={pieOption} height={260} loading={isLoading} />
        </div>
      </div>

      {/* 카드형 뷰 */}
      {view === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cy-panel" style={{ padding: 18, height: 150 }}>
                  <div className="h-5 w-32 animate-pulse rounded" style={{ background: 'var(--bg-2)' }} />
                </div>
              ))
            : data?.items.length === 0
              ? <div className="col-span-full text-center py-12" style={{ color: 'var(--ink-4)' }}>해당 조건의 분양 데이터가 없습니다.</div>
              : data?.items.map((item, i) => (
                  <div key={i} className="cy-card cy-panel" style={{ padding: 18 }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', lineHeight: 1.3 }}>
                        {item.HMPG_ADRES
                          ? <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer" className="cy-link">{item.HOUSE_NM}</a>
                          : item.HOUSE_NM}
                      </div>
                      <StatusBadge status={getStatus(item.RCEPT_BGNDE, item.RCEPT_ENDDE)} />
                    </div>
                    <div className="flex items-center gap-2 mb-3" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                      <span>{item.SUBSCRPT_AREA_CODE_NM}</span>
                      <span style={{ color: 'var(--ink-4)' }}>·</span>
                      <span style={{ color: 'var(--ink-3)' }}>{item.HOUSE_DTL_SECD_NM || 'APT'}</span>
                    </div>
                    <div className="flex items-center justify-between" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>공급세대</div>
                        <div className="num" style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                          {item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}` : '-'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>청약 마감</div>
                        <Dday dateStr={item.RCEPT_ENDDE} />
                      </div>
                    </div>
                  </div>
                ))
          }
        </div>
      )}

      {/* 테이블(목록형) */}
      {view === 'list' && (
      <div className="cy-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs" style={{ background: 'var(--surface-2)', color: 'var(--ink-3)' }}>
              <tr>
                <th className="px-4 py-3 text-left">단지명</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-left">구분</th>
                <th className="px-4 py-3 text-center">공급세대</th>
                <th className="px-4 py-3 text-left">청약기간</th>
                <th className="px-4 py-3 text-left">마감</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-left">관리번호</th>
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
                  : data?.items.map((item, i) => (
                      <tr key={i} className="border-t cy-row transition-colors">
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--ink)' }}>
                          {item.HMPG_ADRES
                            ? <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }} className="hover:underline">{item.HOUSE_NM}</a>
                            : item.HOUSE_NM}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>{item.SUBSCRPT_AREA_CODE_NM}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--ink-3)' }}>{item.HOUSE_DTL_SECD_NM || '-'}</td>
                        <td className="px-4 py-3 text-center num" style={{ color: 'var(--ink-2)' }}>{item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap num" style={{ color: 'var(--ink-3)' }}>{formatDate(item.RCEPT_BGNDE)} ~ {formatDate(item.RCEPT_ENDDE)}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><Dday dateStr={item.RCEPT_ENDDE} label="마감" /></td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={getStatus(item.RCEPT_BGNDE, item.RCEPT_ENDDE)} /></td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--ink-4)' }}>{item.HOUSE_MANAGE_NO}</td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
      </div>
      )}

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
