'use client'

import { SpecialSupplyItem } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface Props {
  items: SpecialSupplyItem[]
  loading?: boolean
}

export default function SpecialSupplyTable({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 w-40 bg-gray-200 animate-pulse rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b">
            <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-800">특별공급 신청현황</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-left">단지명</th>
              <th className="px-4 py-3 text-center">다자녀</th>
              <th className="px-4 py-3 text-center">신혼부부</th>
              <th className="px-4 py-3 text-center">생애최초</th>
              <th className="px-4 py-3 text-center">노부모</th>
              <th className="px-4 py-3 text-center">기관추천</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.houseName}</td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <span className="text-gray-400 text-xs">{formatNumber(item.mfmnHhldco)}세대</span>
                    <br />
                    <span className="font-medium">{formatNumber(item.mfmnRcept)}명</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <span className="text-gray-400 text-xs">{formatNumber(item.nwwdHhldco)}세대</span>
                    <br />
                    <span className="font-medium">{formatNumber(item.nwwdRcept)}명</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <span className="text-gray-400 text-xs">{formatNumber(item.lfefstsHhldco)}세대</span>
                    <br />
                    <span className="font-medium">{formatNumber(item.lfefstsRcept)}명</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <span className="text-gray-400 text-xs">{formatNumber(item.eldlyprntHhldco)}세대</span>
                    <br />
                    <span className="font-medium">{formatNumber(item.eldlyprntRcept)}명</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <span className="text-gray-400 text-xs">{formatNumber(item.insttRcmdtnHhldco)}세대</span>
                    <br />
                    <span className="font-medium">{formatNumber(item.insttRcmdtnRcept)}명</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
