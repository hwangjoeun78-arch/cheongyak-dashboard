'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchCompetition, fetchSpecialSupply } from '@/lib/api-client'
import { getRecentPeriod, formatDate, formatNumber } from '@/lib/utils'
import CompetitionChart from '@/components/dashboard/CompetitionChart'
import SpecialSupplyTable from '@/components/dashboard/SpecialSupplyTable'

export default function CompetitionPage() {
  const { startDate, endDate } = getRecentPeriod(3)

  const { data: compData, isLoading: compLoading } = useQuery({
    queryKey: ['competition-page', startDate, endDate],
    queryFn: () => fetchCompetition({ startDate, endDate, numOfRows: 50 }),
  })

  const { data: spcData, isLoading: spcLoading } = useQuery({
    queryKey: ['special-supply', startDate, endDate],
    queryFn: () => fetchSpecialSupply({ startDate, endDate, numOfRows: 20 }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">청약 경쟁률</h1>
        <p className="text-sm text-gray-500 mt-1">최근 3개월 기준</p>
      </div>

      <CompetitionChart items={compData?.items ?? []} loading={compLoading} />

      {/* 경쟁률 상세 테이블 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">일반공급 경쟁률 상세</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">단지명</th>
                <th className="px-4 py-3 text-left">지역</th>
                <th className="px-4 py-3 text-center">청약기간</th>
                <th className="px-4 py-3 text-center">1순위 경쟁률</th>
                <th className="px-4 py-3 text-center">2순위 경쟁률</th>
              </tr>
            </thead>
            <tbody>
              {compLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : compData?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                compData?.items.map((item, i) => {
                  const rate1 = Number(item.gnrlRnk1CrspaQu ?? 0)
                  const rateColor =
                    rate1 >= 50 ? 'text-red-600 font-bold' :
                    rate1 >= 10 ? 'text-orange-500 font-semibold' :
                    'text-gray-700'

                  return (
                    <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.houseName}</td>
                      <td className="px-4 py-3 text-gray-600">{item.sido} {item.gugun}</td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(item.rceptBgnde)} ~ {formatDate(item.rceptEndde)}
                      </td>
                      <td className={`px-4 py-3 text-center ${rateColor}`}>
                        {rate1 > 0 ? `${rate1.toFixed(2)} : 1` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {Number(item.gnrlRnk2CrspaQu) > 0 ? `${Number(item.gnrlRnk2CrspaQu).toFixed(2)} : 1` : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SpecialSupplyTable items={spcData?.items ?? []} loading={spcLoading} />
    </div>
  )
}
