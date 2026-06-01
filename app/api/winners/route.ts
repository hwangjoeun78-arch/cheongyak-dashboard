import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cacheGet, cacheSet, TTL } from '@/lib/cache'

export const maxDuration = 10
export const dynamic = 'force-dynamic'

const BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeStatSvc/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceKey = process.env.CHEONGYAK_API_KEY || process.env.APPLYHOME_SERVICE_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  const statDeGte        = searchParams.get('statDeGte')
  const statDeLte        = searchParams.get('statDeLte')
  const subscrptAreaCode = searchParams.get('subscrptAreaCode')
  const type             = searchParams.get('type') ?? 'area'
  const page             = searchParams.get('pageNo') ?? '1'
  const perPage          = searchParams.get('numOfRows') ?? '20'

  const endpoint = type === 'age' ? 'getAPTPrzwnerAgeStat' : 'getAPTPrzwnerAreaStat'
  const cacheKey = `winners:${type}:${statDeGte}:${statDeLte}:${subscrptAreaCode}:${page}:${perPage}`

  const hit = cacheGet<any>(cacheKey)
  if (hit) {
    return NextResponse.json({ ...hit.data, cached: true, fetchedAt: hit.fetchedAt })
  }

  const params: Record<string, string> = { page, perPage, serviceKey }
  if (statDeGte)        params['cond[STAT_DE::GTE]'] = statDeGte
  if (statDeLte)        params['cond[STAT_DE::LTE]'] = statDeLte
  if (subscrptAreaCode) params['cond[SUBSCRPT_AREA_CODE::EQ]'] = subscrptAreaCode

  try {
    const res = await axios.get(`${BASE_URL}/${endpoint}`, {
      params, timeout: 8000, validateStatus: () => true,
    })

    if (res.status !== 200) {
      return NextResponse.json({ error: `공공데이터 API 오류 (${res.status})` }, { status: 500 })
    }

    const json = res.data
    const payload = {
      items: json.data ?? [],
      matchCount: json.matchCount ?? 0,
      totalCount: json.totalCount ?? 0,
      pageNo: Number(page),
      numOfRows: Number(perPage),
      cached: false,
      fetchedAt: Date.now(),
    }
    cacheSet(cacheKey, payload, TTL.WINNERS)
    return NextResponse.json(payload)
  } catch (err: any) {
    console.error('[/api/winners]', err.message)
    return NextResponse.json({ error: err.message ?? '서버 오류' }, { status: 500 })
  }
}
