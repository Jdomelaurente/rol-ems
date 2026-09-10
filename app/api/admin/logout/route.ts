import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE } from '@/lib/auth/session'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await prisma.adminSession
      .deleteMany({ where: { tokenHash: createHash('sha256').update(token).digest('hex') } })
      .catch(() => {})
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}