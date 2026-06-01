import { NextResponse } from 'next/server'
import { cacheStats } from '@/lib/cache'

export async function GET() {
  const hasKey = !!(process.env.CHEONGYAK_API_KEY || process.env.APPLYHOME_SERVICE_KEY)
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKey: hasKey ? 'configured' : 'missing',
    cache: cacheStats(),
  })
}
