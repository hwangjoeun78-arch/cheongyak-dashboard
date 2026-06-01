import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const maxDuration = 10

// 청약 신청·당첨자 정보 조회 서비스 (ApplyhomeStatSvc)
// Base URL: https://api.odcloud.kr/api/ApplyhomeStatSvc/v1/
const BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeStatSvc/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceKey = process.env.CHEONGYAK_API_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  // STAT_DE: YYYYMM 형식
  const statDeGte = searchParams.get('statDeGte') // e.g. 202501
  const statDeLte = searchParams.get('statDeLte') // e.g. 202506
  const subscrptAreaCode = searchParams.get('subscrptAreaCode')
  const type      = searchParams.get('type') ?? 'area' // area | age
  const page      = searchParams.get('pageNo') ?? '1'
  const perPage   = searchParams.get('numOfRows') ?? '20'

  const params: Record<string, string> = {
    page,
    perPage,
    serviceKey,
  }
  if (statDeGte)         params['cond[STAT_DE::GTE]'] = statDeGte
  if (statDeLte)         params['cond[STAT_DE::LTE]'] = statDeLte
  if (subscrptAreaCode)  params['cond[SUBSCRPT_AREA_CODE::EQ]'] = subscrptAreaCode

  // 지역별 당첨자 or 연령별 당첨자
  const endpoint = type === 'age'
    ? 'getAPTPrzwnerAgeStat'
    : 'getAPTPrzwnerAreaStat'

  try {
    const res = await axios.get(`${BASE_URL}/${endpoint}`, {
      params,
      timeout: 8000,
      validateStatus: () => true,
    })

    if (res.status !== 200) {
      return NextResponse.json(
        { error: `공공데이터 API 오류 (${res.status})`, detail: res.data },
        { status: 500 }
      )
    }

    const json = res.data
    return NextResponse.json({
      items: json.data ?? [],
      totalCount: json.totalCount ?? 0,
      pageNo: Number(page),
      numOfRows: Number(perPage),
    })
  } catch (err: any) {
    console.error('[/api/winners]', err.message)
    return NextResponse.json({ error: err.message ?? '서버 오류' }, { status: 500 })
  }
}
