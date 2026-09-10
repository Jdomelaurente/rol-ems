import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/pickleball/admin/login' || pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/pickleball/admin')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    const session = token ? await verifySessionToken(token) : null

    if (!session) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/pickleball/admin/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/pickleball/admin/:path*'],
}