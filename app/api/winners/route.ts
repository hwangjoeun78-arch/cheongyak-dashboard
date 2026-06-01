import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { parseXMLResponse, extractItems } from '@/lib/parsers'
import { WinnerItem } from '@/lib/types'

export const maxDuration = 10

const BASE_URL = 'http://apis.data.go.kr/B552555/APTInfoService2'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const serviceKey = process.env.CHEONGYAK_API_KEY

  if (!serviceKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  try {
    const res = await axios.get(`${BASE_URL}/getAPTLttotPblancDetail`, {
      params: {
        serviceKey,
        startDate: searchParams.get('startDate') ?? '',
        endDate: searchParams.get('endDate') ?? '',
        numOfRows: searchParams.get('numOfRows') ?? '20',
        pageNo: searchParams.get('pageNo') ?? '1',
      },
      responseType: 'text',
      timeout: 8000,
    })

    const parsed = await parseXMLResponse(res.data)
    const { items, totalCount } = extractItems<WinnerItem>(parsed)

    return NextResponse.json({
      items,
      totalCount,
      pageNo: Number(searchParams.get('pageNo') ?? 1),
      numOfRows: Number(searchParams.get('numOfRows') ?? 20),
    })
  } catch (err: any) {
    console.error('[/api/winners]', err.message)
    return NextResponse.json({ error: err.message ?? '서버 오류' }, { status: 500 })
  }
}
