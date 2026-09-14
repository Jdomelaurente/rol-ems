import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  initialPaddles,
  initialPaddleRentals,
  openPlaySessions as defaultOpenPlaySessions,
  tournaments as defaultTournaments,
  bracketMatches as defaultBracketMatches,
  reservations as defaultReservations,
  initialCoaches,
  initialCoachingBookings,
  initialPlayerProgress,
  initialShopItems,
  initialAIQueuePlayers,
  initialRouletteResults,
  initialLiveMatches,
  initialClubTeams,
} from '@/lib/data'

const STATE_KEY = 'main'

export type PickleballStateDocument = {
  paddles: unknown[]
  paddleRentals: unknown[]
  openPlaySessions: unknown[]
  tournaments: unknown[]
  bracketMatches: unknown[]
  reservations: unknown[]
  coaches: unknown[]
  coachingBookings: unknown[]
  playerProgress: unknown[]
  shopItems: unknown[]
  aiQueuePlayers: unknown[]
  rouletteResults: unknown[]
  liveMatches: unknown[]
  clubTeams: unknown[]
}

function defaultState(): PickleballStateDocument {
  return {
    paddles: initialPaddles,
    paddleRentals: initialPaddleRentals,
    openPlaySessions: defaultOpenPlaySessions,
    tournaments: defaultTournaments,
    bracketMatches: defaultBracketMatches,
    reservations: defaultReservations,
    coaches: initialCoaches,
    coachingBookings: initialCoachingBookings,
    playerProgress: initialPlayerProgress,
    shopItems: initialShopItems,
    aiQueuePlayers: initialAIQueuePlayers,
    rouletteResults: initialRouletteResults,
    liveMatches: initialLiveMatches,
    clubTeams: initialClubTeams,
  }
}

export async function GET() {
  let row = await prisma.pickleballState.findUnique({ where: { key: STATE_KEY } })

  if (!row) {
    row = await prisma.pickleballState.create({
      data: { key: STATE_KEY, data: defaultState() as object },
    })
  }

  return NextResponse.json(row.data)
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid state payload' }, { status: 400 })
  }

  const existing = await prisma.pickleballState.findUnique({ where: { key: STATE_KEY } })
  const row = existing
    ? await prisma.pickleballState.update({
        where: { key: STATE_KEY },
        data: { data: body as object },
      })
    : await prisma.pickleballState.create({
        data: { key: STATE_KEY, data: body as object },
      })

  return NextResponse.json(row.data)
}