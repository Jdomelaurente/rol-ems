import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET() {
  const startedAt = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: 'ok',
        database: 'up',
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { headers: NO_STORE }
    )
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'down',
        database: 'down',
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: NO_STORE }
    )
  }
}
