import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

async function checkDatabase(attempts = 2) {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return
    } catch (error) {
      lastError = error
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  throw lastError
}

export async function GET() {
  const startedAt = Date.now()

  try {
    await checkDatabase()

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
