'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

// 시도명 정규화 (GeoJSON "서울특별시" → API "서울")
const SIDO_NAME_MAP: Record<string, string> = {
  '서울특별시': '서울',
  '부산광역시': '부산',
  '대구광역시': '대구',
  '인천광역시': '인천',
  '광주광역시': '광주',
  '대전광역시': '대전',
  '울산광역시': '울산',
  '세종특별자치시': '세종',
  '경기도': '경기',
  '강원특별자치도': '강원',
  '강원도': '강원',
  '충청북도': '충북',
  '충청남도': '충남',
  '전라북도': '전북',
  '전북특별자치도': '전북',
  '전라남도': '전남',
  '경상북도': '경북',
  '경상남도': '경남',
  '제주특별자치도': '제주',
}

interface MapData {
  name: string  // 시도명 (API 기준: "서울", "경기" 등)
  value: number
}

interface Props {
  data: MapData[]
  title?: string
  loading?: boolean
  valueLabel?: string
}

let geoRegistered = false

export default function KoreaMap({ data, title = '지역별 현황', loading, valueLabel = '건' }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (geoRegistered) { setReady(true); return }

    import('echarts').then((echarts) => {
      fetch('/geo/korea-provinces.geo.json')
        .then(r => r.json())
        .then(geojson => {
          echarts.registerMap('korea', geojson)
          geoRegistered = true
          setReady(true)
        })
        .catch(() => setReady(true)) // GeoJSON 없어도 진행
    })
  }, [])

  // API 시도명 → GeoJSON 이름으로 역변환
  const reverseMap: Record<string, string> = {}
  Object.entries(SIDO_NAME_MAP).forEach(([geo, api]) => { reverseMap[api] = geo })

  const mapData = data.map(d => ({
    name: reverseMap[d.name] || d.name,
    value: d.value,
  }))

  const maxVal = Math.max(...data.map(d => d.value), 1)

  const option = {
    title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 600, color: '#374151' } },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const apiName = SIDO_NAME_MAP[params.name] || params.name
        return `${apiName}<br/>${(params.value ?? 0).toLocaleString()}${valueLabel}`
      },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      left: 'left',
      bottom: 20,
      text: ['높음', '낮음'],
      inRange: { color: ['#dbeafe', '#1d4ed8'] },
      textStyle: { fontSize: 11 },
    },
    series: [{
      type: 'map',
      map: 'korea',
      roam: false,
      data: mapData,
      emphasis: { label: { show: true, fontSize: 11 }, itemStyle: { areaColor: '#93c5fd' } },
      label: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 1 },
    }],
  }

  if (loading || !ready) {
    return <div className="bg-gray-100 animate-pulse rounded-lg" style={{ height: 400 }} />
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 400, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  )
}
