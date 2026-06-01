import { ApiResponse, SaleItem, CompetitionItem, WinnerAreaItem, WinnerAgeItem } from './types'

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API 오류 (${res.status}): ${text}`)
  }
  return res.json()
}

// 분양정보 조회 (날짜: YYYY-MM-DD)
export async function fetchSales(params: {
  startDate?: string
  endDate?: string
  sido?: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<SaleItem>> {
  const q = new URLSearchParams()
  if (params.startDate)  q.set('startDate',  params.startDate)
  if (params.endDate)    q.set('endDate',    params.endDate)
  if (params.sido)       q.set('sido',       params.sido)
  q.set('pageNo',    String(params.pageNo    ?? 1))
  q.set('numOfRows', String(params.numOfRows ?? 20))
  return fetchJSON(`/api/sales?${q}`)
}

// 경쟁률 조회 (주택관리번호로 검색)
export async function fetchCompetition(params: {
  houseManageNo?: string
  pblancNo?: string
  resideSecd?: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<CompetitionItem>> {
  const q = new URLSearchParams()
  if (params.houseManageNo) q.set('houseManageNo', params.houseManageNo)
  if (params.pblancNo)      q.set('pblancNo',      params.pblancNo)
  if (params.resideSecd)    q.set('resideSecd',    params.resideSecd)
  q.set('pageNo',    String(params.pageNo    ?? 1))
  q.set('numOfRows', String(params.numOfRows ?? 20))
  return fetchJSON(`/api/competition?${q}`)
}

// 지역별 당첨자 조회 (날짜: YYYYMM)
export async function fetchWinnersArea(params: {
  statDeGte?: string
  statDeLte?: string
  subscrptAreaCode?: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<WinnerAreaItem>> {
  const q = new URLSearchParams()
  if (params.statDeGte)         q.set('statDeGte',         params.statDeGte)
  if (params.statDeLte)         q.set('statDeLte',         params.statDeLte)
  if (params.subscrptAreaCode)  q.set('subscrptAreaCode',  params.subscrptAreaCode)
  q.set('type',      'area')
  q.set('pageNo',    String(params.pageNo    ?? 1))
  q.set('numOfRows', String(params.numOfRows ?? 20))
  return fetchJSON(`/api/winners?${q}`)
}

// 연령별 당첨자 조회
export async function fetchWinnersAge(params: {
  statDeGte?: string
  statDeLte?: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<WinnerAgeItem>> {
  const q = new URLSearchParams()
  if (params.statDeGte) q.set('statDeGte', params.statDeGte)
  if (params.statDeLte) q.set('statDeLte', params.statDeLte)
  q.set('type',      'age')
  q.set('pageNo',    String(params.pageNo    ?? 1))
  q.set('numOfRows', String(params.numOfRows ?? 20))
  return fetchJSON(`/api/winners?${q}`)
}
