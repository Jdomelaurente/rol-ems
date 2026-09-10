import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/auth/session'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

export async function POST(request: Request) {
  let username: string
  let password: string
  try {
    const body = await request.json()
    username = typeof body.username === 'string' ? body.username.trim() : ''
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  let user = await prisma.adminUser.findUnique({ where: { username } })

  if (!user) {
    const userCount = await prisma.adminUser.count()
    if (userCount === 0 && username === 'admin') {
      user = await prisma.adminUser.create({
        data: { username: 'admin', passwordHash: hashPassword(password) },
      })
    }
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
    exp: Date.now() + SESSION_TTL_MS,
  })

  await prisma.adminSession.create({
    data: {
      tokenHash: createHash('sha256').update(token).digest('hex'),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })

  const response = NextResponse.json({ ok: true, username: user.username })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}