import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultCatalog, sanitizeCatalog, type CottageCatalog } from '@/lib/cottage-catalog'

const STATE_KEY = 'cottage-catalog'

export async function GET() {
  let row = await prisma.pickleballState.findUnique({ where: { key: STATE_KEY } })

  if (!row) {
    row = await prisma.pickleballState.create({
      data: { key: STATE_KEY, data: defaultCatalog as object },
    })
  }

  const catalog = sanitizeCatalog(row.data as Partial<CottageCatalog>)
  return NextResponse.json(catalog)
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid catalog payload' }, { status: 400 })
  }

  const catalog = sanitizeCatalog(body as Partial<CottageCatalog>)
  const existing = await prisma.pickleballState.findUnique({ where: { key: STATE_KEY } })
  const row = existing
    ? await prisma.pickleballState.update({
        where: { key: STATE_KEY },
        data: { data: catalog as object },
      })
    : await prisma.pickleballState.create({
        data: { key: STATE_KEY, data: catalog as object },
      })

  return NextResponse.json(row.data)
}