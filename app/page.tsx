'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchSales, fetchCompetition } from '@/lib/api-client'
import { getRecentPeriod, getStatusBadge } from '@/lib/utils'
import SummaryCards from '@/components/dashboard/SummaryCards'
import SalesTable from '@/components/dashboard/SalesTable'
import CompetitionChart from '@/components/dashboard/CompetitionChart'

export default function HomePage() {
  const { startDate, endDate } = getRecentPeriod(3)

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales', startDate, endDate],
    queryFn: () => fetchSales({ startDate, endDate, numOfRows: 10 }),
  })

  const { data: compData, isLoading: compLoading } = useQuery({
    queryKey: ['competition', startDate, endDate],
    queryFn: () => fetchCompetition({ startDate, endDate, numOfRows: 20 }),
  })

  const activeCount =
    salesData?.items.filter((item) => {
      const s = getStatusBadge(item.rceptBgnde, item.rceptEndde)
      return s.label === '접수중'
    }).length ?? 0

  const validRates = compData?.items.filter((item) => Number(item.gnrlRnk1CrspaQu) > 0) ?? []
  const avgRate =
    validRates.length > 0
      ? validRates.reduce((sum, item) => sum + Number(item.gnrlRnk1CrspaQu), 0) / validRates.length
      : 0

  const isLoading = salesLoading || compLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">청약 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">
          최근 3개월 기준 ({startDate.slice(0, 4)}.{startDate.slice(4, 6)}.{startDate.slice(6)} ~{' '}
          {endDate.slice(0, 4)}.{endDate.slice(4, 6)}.{endDate.slice(6)})
        </p>
      </div>

      <SummaryCards
        totalSales={salesData?.totalCount ?? 0}
        avgCompetitionRate={avgRate}
        totalWinners={0}
        activeCount={activeCount}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesTable items={salesData?.items ?? []} loading={salesLoading} />
        <CompetitionChart items={compData?.items ?? []} loading={compLoading} />
      </div>
    </div>
  )
}
