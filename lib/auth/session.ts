export type SessionPayload = {
  userId: number
  username: string
  exp: number
}

export const SESSION_COOKIE = 'admin_session'
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12

function sessionSecret(): string {
  return process.env.SESSION_SECRET || 'rol-ems-insecure-dev-secret'
}

export function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
  return atob(padded)
}

function constantEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function hmacValue(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return toBase64Url(signature)
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const signature = await hmacValue(body)
  return `${body}.${signature}`
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  const expected = await hmacValue(body)
  if (!constantEquals(signature, expected)) return null

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null
    if (typeof payload.userId !== 'number' || typeof payload.username !== 'string') return null
    return payload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}