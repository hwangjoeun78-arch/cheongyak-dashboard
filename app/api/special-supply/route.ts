import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const maxDuration = 10

// 경쟁률 및 특별공급 신청현황 조회 서비스 - APT 특별공급 신청현황
const BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceKey = process.env.CHEONGYAK_API_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  const houseManageNo = searchParams.get('houseManageNo')
  const pblancNo      = searchParams.get('pblancNo')
  const page          = searchParams.get('pageNo') ?? '1'
  const perPage       = searchParams.get('numOfRows') ?? '20'

  const params: Record<string, string> = {
    page,
    perPage,
    serviceKey,
  }
  if (houseManageNo) params['cond[HOUSE_MANAGE_NO::EQ]'] = houseManageNo
  if (pblancNo)      params['cond[PBLANC_NO::EQ]']       = pblancNo

  try {
    const res = await axios.get(`${BASE_URL}/getAPTLttotPblancSpcltSuplyRceptStat`, {
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
    console.error('[/api/special-supply]', err.message)
    return NextResponse.json({ error: err.message ?? '서버 오류' }, { status: 500 })
  }
}
