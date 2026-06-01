import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const maxDuration = 10

// 분양정보 조회 서비스 (ApplyhomeInfoDetailSvc)
// Base URL: https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/
const BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceKey = process.env.CHEONGYAK_API_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  const startDate = searchParams.get('startDate') // YYYY-MM-DD
  const endDate   = searchParams.get('endDate')
  const sido      = searchParams.get('sido') ?? ''
  const page      = searchParams.get('pageNo') ?? '1'
  const perPage   = searchParams.get('numOfRows') ?? '20'

  // cond 파라미터: cond[FIELD::OPERATOR]=value
  const params: Record<string, string> = {
    page,
    perPage,
    serviceKey,
  }
  if (startDate) params['cond[RCRIT_PBLANC_DE::GTE]'] = startDate
  if (endDate)   params['cond[RCRIT_PBLANC_DE::LTE]'] = endDate
  if (sido)      params['cond[SUBSCRPT_AREA_CODE_NM::EQ]'] = sido

  try {
    const res = await axios.get(`${BASE_URL}/getAPTLttotPblancDetail`, {
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
    console.error('[/api/sales]', err.message)
    return NextResponse.json({ error: err.message ?? '서버 오류' }, { status: 500 })
  }
}
