import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultSiteContent, sanitizeSiteContent, type SiteContent } from '@/lib/site-content'

const STATE_KEY = 'site-content'

export async function GET() {
  const row = await prisma.pickleballState.upsert({
    where: { key: STATE_KEY },
    update: {},
    create: { key: STATE_KEY, data: defaultSiteContent as object },
  })

  const content = sanitizeSiteContent(row.data as Partial<SiteContent>)
  return NextResponse.json(content)
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid content payload' }, { status: 400 })
  }

  const content = sanitizeSiteContent(body as Partial<SiteContent>)
  const row = await prisma.pickleballState.upsert({
    where: { key: STATE_KEY },
    update: { data: content as object },
    create: { key: STATE_KEY, data: content as object },
  })

  return NextResponse.json(row.data)
}
