import { ApiResponse, SaleItem, CompetitionItem, SpecialSupplyItem, WinnerItem } from './types'

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API 오류 (${res.status}): ${text}`)
  }
  return res.json()
}

export async function fetchSales(params: {
  startDate: string
  endDate: string
  sido?: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<SaleItem>> {
  const q = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.sido ? { sido: params.sido } : {}),
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 20),
  })
  return fetchJSON(`/api/sales?${q}`)
}

export async function fetchCompetition(params: {
  startDate: string
  endDate: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<CompetitionItem>> {
  const q = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 20),
  })
  return fetchJSON(`/api/competition?${q}`)
}

export async function fetchSpecialSupply(params: {
  startDate: string
  endDate: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<SpecialSupplyItem>> {
  const q = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 20),
  })
  return fetchJSON(`/api/special-supply?${q}`)
}

export async function fetchWinners(params: {
  startDate: string
  endDate: string
  pageNo?: number
  numOfRows?: number
}): Promise<ApiResponse<WinnerItem>> {
  const q = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 20),
  })
  return fetchJSON(`/api/winners?${q}`)
}
