'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecentDateRange, formatDate } from '@/lib/utils'

export default function CompetitionPage() {
  const { startDate, endDate } = getRecentDateRange(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">청약 경쟁률</h1>
        <p className="text-sm text-gray-500 mt-1">
          경쟁률 조회는 주택관리번호 기준입니다. 분양정보 페이지에서 단지를 먼저 조회하세요.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-800 mb-2">📌 경쟁률 조회 방법</h2>
        <p className="text-blue-700 text-sm leading-relaxed">
          한국부동산원 청약홈 경쟁률 API는 <strong>주택관리번호(HOUSE_MANAGE_NO)</strong> 기준으로 조회합니다.<br />
          ① <a href="/sales" className="underline font-medium">분양정보</a> 페이지에서 원하는 단지의 주택관리번호를 확인하세요.<br />
          ② 아래 검색창에 주택관리번호를 입력하면 해당 단지의 경쟁률을 확인할 수 있습니다.
        </p>
      </div>

      <CompetitionSearch />
    </div>
  )
}

function CompetitionSearch() {
  'use client'
  const [houseManageNo, setHouseManageNo] = React.useState('')
  const [pblancNo, setPblancNo] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['competition-search', houseManageNo, pblancNo],
    queryFn: async () => {
      const q = new URLSearchParams()
      if (houseManageNo) q.set('houseManageNo', houseManageNo)
      if (pblancNo)      q.set('pblancNo', pblancNo)
      q.set('numOfRows', '50')
      const res = await fetch(`/api/competition?${q}`)
      return res.json()
    },
    enabled: submitted && !!houseManageNo,
  })

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-800 mb-4">단지별 경쟁률 조회</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="주택관리번호 (예: 2022000001)"
            value={houseManageNo}
            onChange={e => { setHouseManageNo(e.target.value); setSubmitted(false) }}
            className="border rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="공고번호 (선택)"
            value={pblancNo}
            onChange={e => { setPblancNo(e.target.value); setSubmitted(false) }}
            className="border rounded-lg px-4 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSubmitted(true)}
            disabled={!houseManageNo}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            조회
          </button>
        </div>
      </div>

      {submitted && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">경쟁률 결과</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">주택형</th>
                  <th className="px-4 py-3 text-center">공급세대수</th>
                  <th className="px-4 py-3 text-center">순위</th>
                  <th className="px-4 py-3 text-left">거주지역</th>
                  <th className="px-4 py-3 text-center">접수건수</th>
                  <th className="px-4 py-3 text-center">경쟁률</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : error || data?.error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                      {data?.error ?? '조회 오류가 발생했습니다.'}
                    </td>
                  </tr>
                ) : data?.items?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      해당 주택관리번호의 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  data?.items?.map((item: any, i: number) => {
                    const rate = parseFloat(item.CMPET_RATE)
                    const rateColor = rate >= 50 ? 'text-red-600 font-bold' : rate >= 10 ? 'text-orange-500 font-semibold' : 'text-gray-700'
                    return (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.HOUSE_TY}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{Number(item.SUPLY_HSHLDCO).toLocaleString()}세대</td>
                        <td className="px-4 py-3 text-center text-gray-600">{item.SUBSCRPT_RANK_CODE}순위</td>
                        <td className="px-4 py-3 text-gray-600">{item.RESIDE_SENM}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{Number(item.REQ_CNT).toLocaleString()}건</td>
                        <td className={`px-4 py-3 text-center ${rateColor}`}>
                          {item.CMPET_RATE !== '-' ? `${item.CMPET_RATE} : 1` : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

import React from 'react'
