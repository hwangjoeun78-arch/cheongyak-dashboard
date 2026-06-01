'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchSales, fetchWinnersArea } from '@/lib/api-client'
import { getRecentDateRange, getRecentYearMonths, formatDate } from '@/lib/utils'
import SummaryCards from '@/components/dashboard/SummaryCards'

export default function HomePage() {
  const { startDate, endDate } = getRecentDateRange(3)
  const { from: statDeGte, to: statDeLte } = getRecentYearMonths(3)

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-home', startDate, endDate],
    queryFn: () => fetchSales({ startDate, endDate, numOfRows: 10 }),
  })

  const { data: winnersData, isLoading: winnersLoading } = useQuery({
    queryKey: ['winners-home', statDeGte, statDeLte],
    queryFn: () => fetchWinnersArea({ statDeGte, statDeLte, numOfRows: 20 }),
  })

  const totalWinners =
    winnersData?.items.reduce(
      (sum, item) =>
        sum + (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0),
      0
    ) ?? 0

  const isLoading = salesLoading || winnersLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">청약 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">
          최근 3개월 기준 ({startDate} ~ {endDate})
        </p>
      </div>

      <SummaryCards
        totalSales={salesData?.totalCount ?? 0}
        avgCompetitionRate={0}
        totalWinners={totalWinners}
        activeCount={0}
        loading={isLoading}
      />

      {/* 최근 분양 현황 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">최근 분양 현황 (모집공고일 기준)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">단지명</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-center">공급규모</th>
                <th className="px-4 py-3 text-left">청약기간</th>
                <th className="px-4 py-3 text-left">당첨자 발표</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : salesData?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    해당 기간의 분양 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                salesData?.items.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.HMPG_ADRES ? (
                        <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:underline">
                          {item.HOUSE_NM}
                        </a>
                      ) : item.HOUSE_NM}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.SUBSCRPT_AREA_CODE_NM}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(item.RCEPT_BGNDE)} ~ {formatDate(item.RCEPT_ENDDE)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(item.PRZWNER_PRESNATN_DE)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 지역별 당첨자 현황 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">지역별 당첨자 현황 (연령대별)</h2>
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
              {winnersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : winnersData?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                winnersData?.items.map((item, i) => {
                  const total = (item.AGE_30 ?? 0) + (item.AGE_40 ?? 0) + (item.AGE_50 ?? 0) + (item.AGE_60 ?? 0)
                  return (
                    <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{item.STAT_DE.slice(0,4)}.{item.STAT_DE.slice(4,6)}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.SUBSCRPT_AREA_CODE_NM}</td>
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
    </div>
  )
}
