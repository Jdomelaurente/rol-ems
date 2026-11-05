import { PrismaClient } from '@/lib/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Supabase's session pooler only allows a small number of concurrent clients
// (pool_size: 15 by default). Prisma's pg pool defaults to 10 per process, which
// is easy to exhaust when a single page fires several API requests at once, so
// keep the local pool deliberately small and release idle sessions.
const parsedPoolMax = Number(process.env.PRISMA_POOL_MAX ?? 5)

function createClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: Number.isFinite(parsedPoolMax) ? Math.max(1, parsedPoolMax) : 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma