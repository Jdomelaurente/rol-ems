import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultCatalog, sanitizeCatalog, type CottageCatalog } from '@/lib/cottage-catalog'

const STATE_KEY = 'cottage-catalog'

export async function GET() {
  try {
    const row = await prisma.pickleballState.upsert({
      where: { key: STATE_KEY },
      update: {},
      create: { key: STATE_KEY, data: defaultCatalog as object },
    })

    const catalog = sanitizeCatalog(row.data as Partial<CottageCatalog>)
    return NextResponse.json(catalog)
  } catch (error) {
    console.error('Database query failed in GET /api/cottage/state, returning fallback:', error)
    return NextResponse.json(defaultCatalog)
  }
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid catalog payload' }, { status: 400 })
  }

  const catalog = sanitizeCatalog(body as Partial<CottageCatalog>)
  try {
    const row = await prisma.pickleballState.upsert({
      where: { key: STATE_KEY },
      update: { data: catalog as object },
      create: { key: STATE_KEY, data: catalog as object },
    })

    return NextResponse.json(row.data)
  } catch (error) {
    console.error('Database query failed in PUT /api/cottage/state, returning fallback:', error)
    return NextResponse.json(catalog)
  }
}