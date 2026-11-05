import { PrismaClient } from '@/lib/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  prismaConnectionString?: string
}

// Supabase's session-mode pooler (port 5432) only allows 15 concurrent clients
// for the whole project, which is easy to exhaust when a page loads several
// API routes at once (EMAXCONNSESSION). The transaction pooler (port 6543)
// multiplexes connections and is the right endpoint for application traffic.
// Prisma CLI commands still use the original DATABASE_URL for migrations.
function resolveConnectionString(url: string): string {
  if (process.env.DATABASE_URL_POOLER) return process.env.DATABASE_URL_POOLER
  if (process.env.DATABASE_POOL_MODE === 'session') return url

  try {
    const parsed = new URL(url)
    if (parsed.hostname.endsWith('.pooler.supabase.com') && parsed.port === '5432') {
      parsed.port = '6543'
      return parsed.toString()
    }
  } catch {
    // Not a URL we can parse; use it as-is.
  }
  return url
}

// Keep the local pool small even against the transaction pooler so a single
// dev server cannot flood the database.
const parsedPoolMax = Number(process.env.PRISMA_POOL_MAX ?? 5)
const poolMax = Number.isFinite(parsedPoolMax) ? Math.max(1, parsedPoolMax) : 5

function createClient(connectionString: string): PrismaClient {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: poolMax,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const connectionString = resolveConnectionString(process.env.DATABASE_URL ?? '')

// In dev, hot reloads re-evaluate this module. Reuse the existing client only
// when it points at the same endpoint, so env/config changes take effect.
export const prisma =
  globalForPrisma.prisma && globalForPrisma.prismaConnectionString === connectionString
    ? globalForPrisma.prisma
    : createClient(connectionString)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaConnectionString = connectionString
}
