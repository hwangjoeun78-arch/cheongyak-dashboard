import { Building2, TrendingUp, Users, Clock } from 'lucide-react'

interface Props {
  totalSales: number
  avgCompetitionRate: number
  totalWinners: number
  activeCount: number
  loading?: boolean
}

function Card({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: any
  label: string
  value: string
  sub?: string
  color: string
  loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border p-6 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {loading ? (
          <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        )}
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function SummaryCards({ totalSales, avgCompetitionRate, totalWinners, activeCount, loading }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        icon={Building2}
        label="총 분양 단지"
        value={loading ? '-' : `${totalSales.toLocaleString()}건`}
        sub="조회 기간 내"
        color="bg-blue-500"
        loading={loading}
      />
      <Card
        icon={TrendingUp}
        label="평균 경쟁률"
        value={loading ? '-' : avgCompetitionRate > 0 ? `${avgCompetitionRate.toFixed(1)} : 1` : '-'}
        sub="1순위 기준"
        color="bg-orange-500"
        loading={loading}
      />
      <Card
        icon={Users}
        label="당첨자 수"
        value={loading ? '-' : `${totalWinners.toLocaleString()}명`}
        sub="특별+일반 합계"
        color="bg-green-500"
        loading={loading}
      />
      <Card
        icon={Clock}
        label="접수 진행중"
        value={loading ? '-' : `${activeCount}건`}
        sub="현재 청약 접수중"
        color="bg-purple-500"
        loading={loading}
      />
    </div>
  )
}
