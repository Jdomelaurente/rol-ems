import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultBadmintonCatalog, sanitizeBadmintonCatalog, type BadmintonCatalog } from '@/lib/badminton-catalog'

const STATE_KEY = 'badminton-catalog'

export async function GET() {
  const row = await prisma.pickleballState.upsert({
    where: { key: STATE_KEY },
    update: {},
    create: { key: STATE_KEY, data: defaultBadmintonCatalog as object },
  })

  const catalog = sanitizeBadmintonCatalog(row.data as Partial<BadmintonCatalog>)
  return NextResponse.json(catalog)
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid catalog payload' }, { status: 400 })
  }

  const catalog = sanitizeBadmintonCatalog(body as Partial<BadmintonCatalog>)
  const row = await prisma.pickleballState.upsert({
    where: { key: STATE_KEY },
    update: { data: catalog as object },
    create: { key: STATE_KEY, data: catalog as object },
  })

  return NextResponse.json(row.data)
}