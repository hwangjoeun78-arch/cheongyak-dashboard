import { parseStringPromise } from 'xml2js'

export async function parseXMLResponse(xml: string) {
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    ignoreAttrs: true,
    trim: true,
  })
  return parsed
}

export function extractItems<T>(parsed: any): { items: T[]; totalCount: number } {
  const response = parsed?.response
  const header = response?.header
  const body = response?.body

  if (header?.resultCode !== '00') {
    throw new Error(`API Error: ${header?.resultMsg ?? 'Unknown error'}`)
  }

  const totalCount = Number(body?.totalCount ?? 0)
  const rawItems = body?.items?.item

  if (!rawItems) return { items: [], totalCount }

  const items: T[] = Array.isArray(rawItems) ? rawItems : [rawItems]
  return { items, totalCount }
}
