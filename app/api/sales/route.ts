import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cacheGet, cacheSet, TTL } from '@/lib/cache'

export const maxDuration = 10
export const dynamic = 'force-dynamic'

const BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceKey = process.env.CHEONGYAK_API_KEY || process.env.APPLYHOME_SERVICE_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')
  const sido      = searchParams.get('sido') ?? ''
  const page      = searchParams.get('pageNo') ?? '1'
  const perPage   = searchParams.get('numOfRows') ?? '20'

  const cacheKey = `sales:${startDate}:${endDate}:${sido}:${page}:${perPage}`
  const hit = cacheGet<any>(cacheKey)
  if (hit) {
    return NextResponse.json({ ...hit.data, cached: true, fetchedAt: hit.fetchedAt })
  }

  const params: Record<string, string> = { page, perPage, serviceKey }
  if (startDate) params['cond[RCRIT_PBLANC_DE::GTE]'] = startDate
  if (endDate)   params['cond[RCRIT_PBLANC_DE::LTE]'] = endDate
  if (sido)      params['cond[SUBSCRPT_AREA_CODE_NM::EQ]'] = sido

  try {
    const res = await axios.get(`${BASE_URL}/getAPTLttotPblancDetail`, {
      params, timeout: 8000, validateStatus: () => true,
    })

    if (res.status !== 200) {
      return NextResponse.json({ error: `공공데이터 API 오류 (${res.status})` }, { status: 500 })
    }

    const json = res.data
    const payload = {
      items: json.data ?? [],
      matchCount: json.matchCount ?? 0,   // ★ 필터 적용된 실제 결과 수
      totalCount: json.totalCount ?? 0,   // 전체 데이터 수 (필터 무관)
      pageNo: Number(page),
      numOfRows: Number(perPage),
      cached: false,
      fetchedAt: Date.now(),
    }
    cacheSet(cacheKey, payload, TTL.SALES)
    return NextResponse.json(payload)
  } catch (err: any) {
    console.error('[/api/sales]', err.message)
    return NextResponse.json({ error: err.message ?? '서버 오류' }, { status: 500 })
  }
}
