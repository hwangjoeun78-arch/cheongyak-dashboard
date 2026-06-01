'use client'

import { WinnerItem } from '@/lib/types'
import { formatDate, formatNumber } from '@/lib/utils'

interface Props {
  items: WinnerItem[]
  loading?: boolean
}

export default function WinnersTable({ items, loading }: Props) {
  const handleExportCSV = () => {
    const headers = ['단지명', '지역', '주택형', '공급세대수', '특별공급당첨자', '일반공급당첨자', '당첨자발표일']
    const rows = items.map((item) => [
      item.houseName,
      `${item.sido} ${item.gugun}`,
      item.houseTy ?? '-',
      item.suplyHhldco ?? '-',
      item.spsplyPrzwner ?? '-',
      item.gnrlPrzwner ?? '-',
      formatDate(item.przwnerPresnatnDe),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '당첨자정보.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex justify-between">
          <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
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
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">당첨자 정보</h2>
        {items.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="text-xs px-3 py-1.5 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          >
            CSV 다운로드
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-left">단지명</th>
              <th className="px-4 py-3 text-left">지역</th>
              <th className="px-4 py-3 text-center">공급세대수</th>
              <th className="px-4 py-3 text-center">특별공급 당첨</th>
              <th className="px-4 py-3 text-center">일반공급 당첨</th>
              <th className="px-4 py-3 text-left">당첨자 발표</th>
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
                  <td className="px-4 py-3 text-gray-600">{item.sido} {item.gugun}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{formatNumber(item.suplyHhldco)}세대</td>
                  <td className="px-4 py-3 text-center text-gray-600">{formatNumber(item.spsplyPrzwner)}명</td>
                  <td className="px-4 py-3 text-center text-gray-600">{formatNumber(item.gnrlPrzwner)}명</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(item.przwnerPresnatnDe)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
