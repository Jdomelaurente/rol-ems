'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  SportType,
  Paddle,
  PaddleRental,
  OpenPlaySession,
  Tournament,
  TournamentPair,
  TournamentFormat,
  BracketMatch,
  Reservation,
  Coach,
  CoachingBooking,
  PlayerProgress,
  ShopItem,
  AIQueuePlayer,
  MiniMatch,
  PlayerStat,
  RouletteSpinResult,
  LiveMatchScore,
  ClubTeam,
  getPairDisplayName,
  initialPaddles,
  initialPaddleRentals,
  openPlaySessions as initialOpenPlaySessions,
  tournaments as initialTournaments,
  bracketMatches as initialBracketMatches,
  reservations as initialReservations,
  initialCoaches,
  initialCoachingBookings,
  initialPlayerProgress,
  initialShopItems,
  initialAIQueuePlayers,
  initialMiniMatches,
  initialPlayerStats,
  initialRouletteResults,
  initialLiveMatches,
  initialClubTeams,
} from '@/lib/data'

interface PickleballContextType {
  // Paddle Inventory & Rentals
  paddles: Paddle[]
  paddleRentals: PaddleRental[]
  addPaddle: (paddle: Omit<Paddle, 'id'>) => Paddle
  updatePaddle: (id: string, updates: Partial<Paddle>) => void
  deletePaddle: (id: string) => void
  rentPaddle: (rental: Omit<PaddleRental, 'id' | 'rentedAt'>) => PaddleRental
  returnPaddleRental: (rentalId: string) => void
  updatePaddleRentalStatus: (rentalId: string, status: PaddleRental['status']) => void

  // Open Play Sessions
  openPlaySessions: OpenPlaySession[]
  createOpenPlaySession: (session: {
    court: string
    date: string
    dayOfWeek?: string
    startTime: string
    endTime: string
  }) => OpenPlaySession
  updateOpenPlaySession: (id: string, updates: Partial<OpenPlaySession>) => void
  cancelOpenPlaySession: (id: string) => void
  toggleRegistration: (sessionId: string) => void
  toggleQueue: (sessionId: string) => void
  joinOpenPlaySession: (
    sessionId: string,
    playerName: string,
    paymentMethod?: 'Pay at Counter' | 'GCash' | 'Maya',
    photo?: string
  ) => { joined: boolean; inQueue: boolean; queuePosition?: number; message: string }
  leaveOpenPlaySession: (sessionId: string, playerName: string) => void
  removeFromQueue: (sessionId: string, playerName: string) => void

  // AI Open Play Queue & Rotation
  aiQueuePlayers: AIQueuePlayer[]
  generateAIQueue: (sport: SportType) => void
  rotateAIQueue: (sport: SportType) => void
  addPlayerToAIQueue: (
    name: string,
    sport: SportType,
    wins: number,
    losses: number,
    points?: number,
    fixedPartner?: string,
    photo?: string,
    paymentMethod?: 'Pay at Counter' | 'GCash' | 'Maya'
  ) => void
  updatePlayerWinsLosses: (playerId: string, wins: number, losses: number) => void
  adjustPlayerWins: (playerId: string, delta: number) => void
  adjustPlayerLosses: (playerId: string, delta: number) => void
  generateRandomPairs: (sport: SportType) => void
  removePlayerFromAIQueue: (playerId: string) => void

  // Open Play Mini Matches & Leaderboard
  miniMatches: MiniMatch[]
  playerStats: PlayerStat[]
  recordMatchResult: (
    winnerName: string,
    loserName: string,
    score: string,
    sport: SportType
  ) => void

  // Tournaments & Brackets
  tournaments: Tournament[]
  bracketMatches: BracketMatch[]
  createTournament: (tournament: Omit<Tournament, 'id' | 'registeredTeams'>) => Tournament
  addPairToTournament: (tournamentId: string, player1: string, player2: string, pairName?: string, extraPlayers?: string[]) => TournamentPair
  updatePair: (tournamentId: string, pairId: string, player1: string, player2: string, pairName?: string, seed?: number, extraPlayers?: string[]) => void
  removePairFromTournament: (tournamentId: string, pairId: string) => void
  updateMatchTeams: (matchId: string, team1: string, team2: string, team1Players?: string[], team2Players?: string[]) => void
  updateMatchScore: (matchId: string, score1: number, score2: number, winnerName: string) => void
  updateMatchSchedule: (matchId: string, court: string, date: string, time: string) => void
  generateBracketFromPairs: (tournamentId: string) => void
  declareChampion: (tournamentId: string, pairName: string, players: string[]) => void

  // Club & Registered Teams
  clubTeams: ClubTeam[]
  registerClubTeam: (team: Omit<ClubTeam, 'id' | 'wins' | 'losses' | 'status'>) => ClubTeam

  // Court Reservations
  reservations: Reservation[]
  addReservation: (reservation: Omit<Reservation, 'id' | 'bookingId'> & { bookingId?: string }) => Reservation

  // Coaching Sessions
  coaches: Coach[]
  coachingBookings: CoachingBooking[]
  playerProgress: PlayerProgress[]
  bookCoachingSession: (booking: Omit<CoachingBooking, 'id' | 'status'>) => CoachingBooking
  cancelCoachingBooking: (id: string) => void

  // Rebar Sports Shop
  shopItems: ShopItem[]
  buyShopItem: (itemId: string, qty: number) => { success: boolean; message: string }

  // Roulette Random Pairing
  rouletteResults: RouletteSpinResult[]
  spinRoulettePairing: (playerA: string, playerB: string, bracketPlacement: string, sport: SportType, courtAssigned: string) => RouletteSpinResult
  deleteRouletteResult: (id: string) => void

  // Live Match & Scoring Links
  liveMatches: LiveMatchScore[]
  updateLiveScore: (matchId: string, team: 1 | 2, delta: number) => void
  switchLiveServer: (matchId: string) => void
  addPointHistory: (matchId: string, team: 1 | 2, text: string) => void

  // Reset / Sync
  resetToDefault: () => void
}

const PickleballContext = createContext<PickleballContextType | undefined>(undefined)

const SYNC_CHANNEL = 'rol-ems-pickleball'

export const PickleballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paddles, setPaddles] = useState<Paddle[]>(initialPaddles)
  const [paddleRentals, setPaddleRentals] = useState<PaddleRental[]>(initialPaddleRentals)
  const [openPlaySessions, setOpenPlaySessions] = useState<OpenPlaySession[]>(initialOpenPlaySessions)
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments)
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>(initialBracketMatches)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [isLoaded, setIsLoaded] = useState(false)

  // New Features State
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches)
  const [coachingBookings, setCoachingBookings] = useState<CoachingBooking[]>(initialCoachingBookings)
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>(initialPlayerProgress)
  const [shopItems, setShopItems] = useState<ShopItem[]>(initialShopItems)
  const [aiQueuePlayers, setAiQueuePlayers] = useState<AIQueuePlayer[]>(initialAIQueuePlayers)
  const [miniMatches, setMiniMatches] = useState<MiniMatch[]>(initialMiniMatches)
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>(initialPlayerStats)
  const [rouletteResults, setRouletteResults] = useState<RouletteSpinResult[]>(initialRouletteResults)
  const [liveMatches, setLiveMatches] = useState<LiveMatchScore[]>(initialLiveMatches)
  const [clubTeams, setClubTeams] = useState<ClubTeam[]>(initialClubTeams)

  const channelRef = useRef<BroadcastChannel | null>(null)
  const savingRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/pickleball/state', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to fetch state: ${res.status}`)
        const parsed = await res.json()
        if (cancelled) return
        if (parsed.paddles) setPaddles(parsed.paddles)
        if (parsed.paddleRentals) setPaddleRentals(parsed.paddleRentals)
        if (parsed.openPlaySessions) setOpenPlaySessions(parsed.openPlaySessions)
        if (parsed.tournaments) setTournaments(parsed.tournaments)
        if (parsed.bracketMatches) setBracketMatches(parsed.bracketMatches)
        if (parsed.reservations) setReservations(parsed.reservations)
        if (parsed.coaches) setCoaches(parsed.coaches)
        if (parsed.coachingBookings) setCoachingBookings(parsed.coachingBookings)
        if (parsed.playerProgress) setPlayerProgress(parsed.playerProgress)
        if (parsed.shopItems) setShopItems(parsed.shopItems)
        if (parsed.aiQueuePlayers) setAiQueuePlayers(parsed.aiQueuePlayers)
        if (parsed.miniMatches) setMiniMatches(parsed.miniMatches)
        if (parsed.playerStats) setPlayerStats(parsed.playerStats)
        if (parsed.rouletteResults) setRouletteResults(parsed.rouletteResults)
        if (parsed.liveMatches) setLiveMatches(parsed.liveMatches)
        if (parsed.clubTeams) setClubTeams(parsed.clubTeams)
      } catch (e) {
        console.error('Failed to load pickleball state', e)
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    }

    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL) : null
    channelRef.current = channel

    const onFocus = () => {
      if (!savingRef.current) load()
    }

    if (channel) {
      channel.onmessage = (event: MessageEvent) => {
        if (event.data === 'refresh' && !savingRef.current) load()
      }
    }

    window.addEventListener('focus', onFocus)
    load()

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      channel?.close()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      savingRef.current = true
      try {
        await fetch('/api/pickleball/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paddles,
            paddleRentals,
            openPlaySessions,
            tournaments,
            bracketMatches,
            reservations,
            coaches,
            coachingBookings,
            playerProgress,
            shopItems,
            aiQueuePlayers,
            miniMatches,
            playerStats,
            rouletteResults,
            liveMatches,
            clubTeams,
          }),
        })
        channelRef.current?.postMessage('refresh')
      } catch (e) {
        console.error('Failed to save pickleball state', e)
      } finally {
        savingRef.current = false
      }
    }, 400)
  }, [isLoaded, paddles, paddleRentals, openPlaySessions, tournaments, bracketMatches, reservations, coaches, coachingBookings, playerProgress, shopItems, aiQueuePlayers, rouletteResults, liveMatches, clubTeams, miniMatches, playerStats])

  const resetToDefault = () => {
    setPaddles(initialPaddles)
    setPaddleRentals(initialPaddleRentals)
    setOpenPlaySessions(initialOpenPlaySessions)
    setTournaments(initialTournaments)
    setBracketMatches(initialBracketMatches)
    setReservations(initialReservations)
    setCoaches(initialCoaches)
    setCoachingBookings(initialCoachingBookings)
    setPlayerProgress(initialPlayerProgress)
    setShopItems(initialShopItems)
    setAiQueuePlayers(initialAIQueuePlayers)
    setMiniMatches(initialMiniMatches)
    setPlayerStats(initialPlayerStats)
    setRouletteResults(initialRouletteResults)
    setLiveMatches(initialLiveMatches)
    setClubTeams(initialClubTeams)
  }

  // ─── PADDLE ACTIONS ─────────────────────────────────────────────────────────

  const addPaddle = (paddleData: Omit<Paddle, 'id'>) => {
    const newPaddle: Paddle = {
      ...paddleData,
      id: `pad-${Date.now().toString().slice(-4)}`,
    }
    setPaddles((prev) => [newPaddle, ...prev])
    return newPaddle
  }

  const updatePaddle = (id: string, updates: Partial<Paddle>) => {
    setPaddles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deletePaddle = (id: string) => {
    setPaddles((prev) => prev.filter((p) => p.id !== id))
  }

  const rentPaddle = (rentalData: Omit<PaddleRental, 'id' | 'rentedAt'>) => {
    const newRental: PaddleRental = {
      ...rentalData,
      id: `pdr-${Date.now().toString().slice(-4)}`,
      rentedAt: new Date().toLocaleString(),
    }

    setPaddleRentals((prev) => [newRental, ...prev])

    setPaddles((prev) =>
      prev.map((p) => {
        if (p.id === rentalData.paddleId) {
          const nextQty = Math.max(0, p.quantityAvailable - 1)
          return {
            ...p,
            quantityAvailable: nextQty,
            availability: nextQty === 0 ? 'Rented' : p.availability,
          }
        }
        return p
      })
    )

    return newRental
  }

  const returnPaddleRental = (rentalId: string) => {
    const rental = paddleRentals.find((r) => r.id === rentalId)
    if (!rental) return

    setPaddleRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status: 'Returned' } : r))
    )

    if (rental.paddleId) {
      setPaddles((prev) =>
        prev.map((p) => {
          if (p.id === rental.paddleId) {
            const nextQty = Math.min(p.totalQuantity, p.quantityAvailable + 1)
            return {
              ...p,
              quantityAvailable: nextQty,
              availability: nextQty > 0 && p.availability === 'Rented' ? 'Available' : p.availability,
            }
          }
          return p
        })
      )
    }
  }

  const updatePaddleRentalStatus = (rentalId: string, status: PaddleRental['status']) => {
    setPaddleRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status } : r))
    )
  }

  // ─── OPEN PLAY ACTIONS ──────────────────────────────────────────────────────

  const createOpenPlaySession = (sessionData: {
    court: string
    date: string
    dayOfWeek?: string
    startTime: string
    endTime: string
  }) => {
    const newSession: OpenPlaySession = {
      id: `op-${Date.now().toString().slice(-4)}`,
      court: sessionData.court,
      date: sessionData.date,
      dayOfWeek: sessionData.dayOfWeek || 'Scheduled Day',
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      players: [],
      maxPlayers: 12,
      queue: [],
      isRegistrationOpen: true,
      isQueueOpen: true,
      status: 'open',
    }
    setOpenPlaySessions((prev) => [newSession, ...prev])
    return newSession
  }

  const updateOpenPlaySession = (id: string, updates: Partial<OpenPlaySession>) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const cancelOpenPlaySession = (id: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelled', isRegistrationOpen: false } : s))
    )
  }

  const toggleRegistration = (sessionId: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, isRegistrationOpen: !s.isRegistrationOpen } : s
      )
    )
  }

  const toggleQueue = (sessionId: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isQueueOpen: !s.isQueueOpen } : s))
    )
  }

  const joinOpenPlaySession = (
    sessionId: string,
    playerName: string,
    paymentMethod?: 'Pay at Counter' | 'GCash' | 'Maya',
    photo?: string
  ) => {
    let result = { joined: false, inQueue: false, queuePosition: undefined as number | undefined, message: '' }

    setOpenPlaySessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session
        if (!session.isRegistrationOpen) {
          result.message = 'Registration is closed for this session.'
          return session
        }

        if (session.players.includes(playerName)) {
          result.message = 'You are already registered for this session.'
          return session
        }
        if (session.queue.includes(playerName)) {
          const pos = session.queue.indexOf(playerName) + 1
          result.inQueue = true
          result.queuePosition = pos
          result.message = `You are already in queue (Position #${pos}).`
          return session
        }

        if (session.players.length < 12) {
          const updatedPlayers = [...session.players, playerName]
          const isFull = updatedPlayers.length >= 12
          result.joined = true
          result.message = `Successfully joined ${session.court} Open Play session!`
          return {
            ...session,
            players: updatedPlayers,
            status: isFull ? 'full' : 'open',
          }
        } else {
          if (!session.isQueueOpen) {
            result.message = 'Session is FULL (12/12) and player queue is currently closed.'
            return session
          }
          const updatedQueue = [...session.queue, playerName]
          const queuePos = updatedQueue.length
          result.inQueue = true
          result.queuePosition = queuePos
          result.message = `Session FULL (12/12). You automatically entered the queue at Position #${queuePos}.`
          return {
            ...session,
            status: 'full',
            queue: updatedQueue,
          }
        }
      })
    )

    return result
  }

  const leaveOpenPlaySession = (sessionId: string, playerName: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session

        const isPlayer = session.players.includes(playerName)
        let nextPlayers = session.players.filter((p) => p !== playerName)
        let nextQueue = session.queue.filter((p) => p !== playerName)

        if (isPlayer && nextQueue.length > 0) {
          const promotedPlayer = nextQueue.shift()!
          nextPlayers.push(promotedPlayer)
        }

        return {
          ...session,
          players: nextPlayers,
          queue: nextQueue,
          status: nextPlayers.length >= 12 ? 'full' : 'open',
        }
      })
    )
  }

  const removeFromQueue = (sessionId: string, playerName: string) => {
    setOpenPlaySessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, queue: s.queue.filter((q) => q !== playerName) } : s
      )
    )
  }

  // ─── TOURNAMENT & BRACKET ACTIONS ──────────────────────────────────────────

  const createTournament = (tData: Omit<Tournament, 'id' | 'registeredTeams'>) => {
    const newTourn: Tournament = {
      ...tData,
      id: `tourn-${Date.now().toString().slice(-4)}`,
      format: tData.format || 'pairing',
      registeredTeams: 0,
      pairs: [],
    }
    setTournaments((prev) => [newTourn, ...prev])
    return newTourn
  }

  const addPairToTournament = (
    tournamentId: string,
    player1: string,
    player2: string,
    pairName?: string,
    extraPlayers?: string[]
  ) => {
    const newPair: TournamentPair = {
      id: `pair-${Date.now().toString().slice(-4)}`,
      tournamentId,
      pairName: pairName && pairName.trim() ? pairName.trim() : undefined,
      player1,
      player2,
      extraPlayers,
      status: 'active',
    }

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const existingPairs = t.pairs || []
          const updatedPairs = [...existingPairs, newPair]
          return {
            ...t,
            pairs: updatedPairs,
            registeredTeams: updatedPairs.length,
          }
        }
        return t
      })
    )

    return newPair
  }

  const updatePair = (
    tournamentId: string,
    pairId: string,
    newPlayer1: string,
    newPlayer2: string,
    newPairName?: string,
    seed?: number,
    extraPlayers?: string[]
  ) => {
    let oldDisplayName = ''
    let newDisplayName = ''
    let newPlayersList: string[] = []

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const updatedPairs = (t.pairs || []).map((p) => {
            if (p.id === pairId) {
              oldDisplayName = getPairDisplayName(p)
              const cleanPairName = newPairName && newPairName.trim() ? newPairName.trim() : undefined
              newDisplayName = getPairDisplayName({ pairName: cleanPairName, player1: newPlayer1, player2: newPlayer2 })
              newPlayersList = [newPlayer1, newPlayer2, ...(extraPlayers || [])].filter(Boolean)

              return {
                ...p,
                pairName: cleanPairName,
                player1: newPlayer1,
                player2: newPlayer2,
                extraPlayers,
                seed: seed !== undefined ? seed : p.seed,
              }
            }
            return p
          })
          return { ...t, pairs: updatedPairs }
        }
        return t
      })
    )

    if (oldDisplayName || newDisplayName) {
      setBracketMatches((prevMatches) =>
        prevMatches.map((m) => {
          let team1 = m.team1
          let team2 = m.team2
          let team1Players = m.team1Players
          let team2Players = m.team2Players

          if (m.team1 === oldDisplayName || m.team1 === newDisplayName) {
            team1 = newDisplayName
            team1Players = newPlayersList
          }
          if (m.team2 === oldDisplayName || m.team2 === newDisplayName) {
            team2 = newDisplayName
            team2Players = newPlayersList
          }

          return {
            ...m,
            team1,
            team2,
            team1Players,
            team2Players,
            winner: m.winner === oldDisplayName ? newDisplayName : m.winner,
          }
        })
      )
    }
  }

  const removePairFromTournament = (tournamentId: string, pairId: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const updatedPairs = (t.pairs || []).filter((p) => p.id !== pairId)
          return {
            ...t,
            pairs: updatedPairs,
            registeredTeams: updatedPairs.length,
          }
        }
        return t
      })
    )
  }

  const updateMatchTeams = (
    matchId: string,
    team1: string,
    team2: string,
    team1Players?: string[],
    team2Players?: string[]
  ) => {
    setBracketMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              team1,
              team2,
              team1Players: team1Players || m.team1Players,
              team2Players: team2Players || m.team2Players,
            }
          : m
      )
    )
  }

  const updateMatchScore = (
    matchId: string,
    score1: number,
    score2: number,
    winnerName: string
  ) => {
    setBracketMatches((prevMatches) => {
      const matchIndex = prevMatches.findIndex((m) => m.id === matchId)
      if (matchIndex === -1) return prevMatches

      const targetMatch = prevMatches[matchIndex]
      const updatedMatch: BracketMatch = {
        ...targetMatch,
        score1,
        score2,
        winner: winnerName,
        status: 'completed',
      }

      let updatedMatches = [...prevMatches]
      updatedMatches[matchIndex] = updatedMatch

      const winningPlayers =
        winnerName === targetMatch.team1
          ? targetMatch.team1Players
          : targetMatch.team2Players

      if (targetMatch.nextMatchId) {
        const nextIndex = updatedMatches.findIndex((m) => m.id === targetMatch.nextMatchId)
        if (nextIndex !== -1) {
          const nextMatch = updatedMatches[nextIndex]
          const isTeam1Empty = !nextMatch.team1 || nextMatch.team1.includes('TBD') || targetMatch.matchNumber % 2 === 1

          updatedMatches[nextIndex] = {
            ...nextMatch,
            team1: isTeam1Empty ? winnerName : nextMatch.team1,
            team1Players: isTeam1Empty ? winningPlayers : nextMatch.team1Players,
            team2: !isTeam1Empty ? winnerName : nextMatch.team2,
            team2Players: !isTeam1Empty ? winningPlayers : nextMatch.team2Players,
            status: nextMatch.status === 'pending' ? 'scheduled' : nextMatch.status,
          }
        }
      }

      if (targetMatch.round === 'Final' && targetMatch.tournamentId) {
        setTournaments((prevT) =>
          prevT.map((t) =>
            t.id === targetMatch.tournamentId
              ? {
                  ...t,
                  status: 'completed',
                  championPairName: winnerName,
                  championPlayers: winningPlayers,
                }
              : t
          )
        )
      }

      return updatedMatches
    })
  }

  const updateMatchSchedule = (
    matchId: string,
    court: string,
    date: string,
    time: string
  ) => {
    setBracketMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, court, date, time } : m))
    )
  }

  const generateBracketFromPairs = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId)
    if (!tournament || !tournament.pairs || tournament.pairs.length === 0) return

    const activePairs = tournament.pairs.filter((p) => p.status !== 'eliminated')
    const matches: BracketMatch[] = []

    let matchCounter = 1
    for (let i = 0; i < activePairs.length; i += 2) {
      const p1 = activePairs[i]
      const p2 = activePairs[i + 1]

      const mId = `m-${tournamentId}-${matchCounter}`
      const nextSFId = `m-${tournamentId}-sf-${Math.ceil(matchCounter / 2)}`

      const p1Name = p1 ? getPairDisplayName(p1) : 'BYE'
      const p2Name = p2 ? getPairDisplayName(p2) : 'BYE'

      matches.push({
        id: mId,
        tournamentId,
        round: 'QF',
        matchNumber: matchCounter,
        team1: p1Name,
        team2: p2Name,
        team1Players: p1 ? [p1.player1, p1.player2, ...(p1.extraPlayers || [])].filter(Boolean) : [],
        team2Players: p2 ? [p2.player1, p2.player2, ...(p2.extraPlayers || [])].filter(Boolean) : [],
        court: `Court ${(matchCounter % 3) + 1}`,
        date: tournament.date,
        time: `${8 + Math.floor(matchCounter / 2)}:00 AM`,
        status: p1 && p2 ? 'scheduled' : 'completed',
        winner: !p2 ? p1Name : undefined,
        nextMatchId: nextSFId,
      })

      matchCounter++
    }

    const sf1Id = `m-${tournamentId}-sf-1`
    const sf2Id = `m-${tournamentId}-sf-2`
    const finalId = `m-${tournamentId}-final`

    matches.push({
      id: sf1Id,
      tournamentId,
      round: 'SF',
      matchNumber: matchCounter++,
      team1: 'Winner QF1',
      team2: 'Winner QF2',
      court: 'Court 1',
      date: tournament.date,
      time: '11:00 AM',
      status: 'pending',
      nextMatchId: finalId,
    })

    matches.push({
      id: sf2Id,
      tournamentId,
      round: 'SF',
      matchNumber: matchCounter++,
      team1: 'Winner QF3',
      team2: 'Winner QF4',
      court: 'Court 2',
      date: tournament.date,
      time: '11:00 AM',
      status: 'pending',
      nextMatchId: finalId,
    })

    matches.push({
      id: finalId,
      tournamentId,
      round: 'Final',
      matchNumber: matchCounter,
      team1: 'Winner SF1',
      team2: 'Winner SF2',
      court: 'Court 1',
      date: tournament.date,
      time: '2:00 PM',
      status: 'pending',
    })

    setBracketMatches((prev) => [
      ...prev.filter((m) => m.tournamentId && m.tournamentId !== tournamentId),
      ...matches,
    ])

    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, status: 'in-progress' } : t))
    )
  }

  const declareChampion = (
    tournamentId: string,
    pairName: string,
    players: string[]
  ) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              status: 'completed',
              championPairName: pairName,
              championPlayers: players,
            }
          : t
      )
    )
  }

  // ─── RESERVATIONS ACTIONS ──────────────────────────────────────────────────

  const addReservation = (resData: Omit<Reservation, 'id' | 'bookingId'> & { bookingId?: string }) => {
    const bookingId = resData.bookingId || `PB-${Math.floor(100000 + Math.random() * 900000)}`
    const newReservation: Reservation = {
      ...resData,
      id: Date.now().toString(),
      bookingId,
    }
    setReservations((prev) => [newReservation, ...prev])
    return newReservation
  }

  // ─── COACHING ACTIONS ───────────────────────────────────────────────────────

  const bookCoachingSession = (booking: Omit<CoachingBooking, 'id' | 'status'>) => {
    const newBooking: CoachingBooking = {
      ...booking,
      id: `cb-${Date.now().toString().slice(-6)}`,
      status: 'confirmed',
    }
    setCoachingBookings((prev) => [newBooking, ...prev])
    return newBooking
  }

  const cancelCoachingBooking = (id: string) => {
    setCoachingBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    )
  }

  // ─── REBAR SPORTS SHOP ACTIONS ──────────────────────────────────────────────

  const buyShopItem = (itemId: string, qty: number) => {
    const item = shopItems.find((i) => i.id === itemId)
    if (!item) return { success: false, message: 'Item not found' }
    if (item.stock < qty) {
      return { success: false, message: `Only ${item.stock} left in stock for ${item.name}` }
    }
    setShopItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: i.stock - qty } : i))
    )
    return { success: true, message: `Purchased ${qty} × ${item.name}` }
  }

  // ─── AI OPEN PLAY QUEUE & ROTATION ACTIONS ─────────────────────────────────

  const generateAIQueue = (sport: SportType) => {
    const reserved = aiQueuePlayers.filter((p) => p.sport === sport).map((p) => p.name)
    const allNames = [
      'Maria Santos', 'Juan Rivera', 'Pedro Cruz', 'Ana Lopez', 'Michael Tan',
      'Lisa Mendoza', 'Carlo Delos Santos', 'Jenny Aquino', 'Remy Bautista',
      'Chris Garcia', 'Dina Lim', 'Ed Pascual',
    ]
    const namesForSport =
      sport === 'Pickleball'
        ? allNames
        : sport === 'Badminton'
          ? allNames.slice(0, 8)
          : allNames.slice(0, 6)
    const fresh = namesForSport
      .filter((name) => !reserved.includes(name))
      .map((name, i) => ({
        id: `q-${Date.now().toString().slice(-6)}-${i}`,
        name,
        sport,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        waitTimeMinutes: 0,
        sitOutCount: 2 - (i % 3),
        status: 'waiting' as const,
      }))
    if (fresh.length === 0) return
    setAiQueuePlayers((prev) => [...prev, ...fresh])
  }

  const rotateAIQueue = (sport: SportType) => {
    setAiQueuePlayers((prev) => {
      const group = prev.filter((p) => p.sport === sport)
      const others = prev.filter((p) => p.sport !== sport)
      if (group.length < 4) return prev
      const rotation = [...group.slice(1), group[0]]
      return [...others, ...rotation]
    })
  }

  const addPlayerToAIQueue: PickleballContextType['addPlayerToAIQueue'] = (
    name,
    sport,
    wins,
    losses,
    points,
    fixedPartner,
    photo,
    paymentMethod
  ) => {
    const newPlayer: AIQueuePlayer = {
      id: `q-${sport.toLowerCase().replace(/[^a-z]/g, '')}-${Date.now().toString().slice(-5)}`,
      name,
      sport,
      wins,
      losses,
      points,
      gamesPlayed: 0,
      waitTimeMinutes: 0,
      sitOutCount: 0,
      fixedPartner,
      photo,
      paymentMethod,
      status: 'waiting',
    }
    setAiQueuePlayers((prev) => [...prev, newPlayer])
  }

  const updatePlayerWinsLosses = (playerId: string, wins: number, losses: number) => {
    setAiQueuePlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, wins, losses, gamesPlayed: p.gamesPlayed + 1 } : p
      )
    )
  }

  const adjustPlayerWins = (playerId: string, delta: number) => {
    setAiQueuePlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, wins: Math.max(0, p.wins + delta) } : p))
    )
  }

  const adjustPlayerLosses = (playerId: string, delta: number) => {
    setAiQueuePlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, losses: Math.max(0, p.losses + delta) } : p))
    )
  }

  const generateRandomPairs = (sport: SportType) => {
    setAiQueuePlayers((prev) => {
      const group = prev.filter((p) => p.sport === sport)
      const others = prev.filter((p) => p.sport !== sport)
      if (group.length < 2) return prev

      const pool = [...group]
      const pairList: [AIQueuePlayer, AIQueuePlayer][] = []
      const used = new Set<string>()

      for (const player of pool) {
        if (used.has(player.id)) continue
        if (!player.fixedPartner) continue
        const partner = pool.find(
          (q) => q.name === player.fixedPartner && !used.has(q.id) && q.id !== player.id
        )
        if (partner) {
          pairList.push([player, partner])
          used.add(player.id)
          used.add(partner.id)
        } else {
          used.add(player.id)
        }
      }

      const flexible = pool.filter((p) => !used.has(p.id)).sort(() => Math.random() - 0.5)
      for (let i = 0; i + 1 < flexible.length; i += 2) {
        pairList.push([flexible[i], flexible[i + 1]])
      }

      const pairByPlayer = new Map<string, { pairNumber: number; partnerName?: string }>()
      pairList.forEach((pair, idx) => {
        const pairNumber = idx + 1
        pairByPlayer.set(pair[0].id, { pairNumber, partnerName: pair[1].name })
        pairByPlayer.set(pair[1].id, { pairNumber, partnerName: pair[0].name })
      })

      const updated = group.map((p) => {
        const assignment = pairByPlayer.get(p.id)
        if (!assignment) return { ...p, pairNumber: undefined, partnerName: undefined }
        return { ...p, pairNumber: assignment.pairNumber, partnerName: assignment.partnerName }
      })
      return [...others, ...updated]
    })
  }

  const removePlayerFromAIQueue = (playerId: string) => {
    setAiQueuePlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  // ─── OPEN PLAY STATS & LEADERBOARD ACTIONS ──────────────────────────────────

  const recordMatchResult = (
    winnerName: string,
    loserName: string,
    score: string,
    sport: SportType
  ) => {
    setPlayerStats((prev) =>
      prev.map((p) => {
        if (p.name === winnerName && p.sport === sport) {
          const newWins = p.wins + 1
          const total = newWins + p.losses
          return {
            ...p,
            wins: newWins,
            winRate: Number(((newWins / total) * 100).toFixed(1)),
            streak: p.streak + 1,
            recentMatches: [{ opponent: loserName, score, result: 'W' }, ...p.recentMatches.slice(0, 4)],
          }
        }
        if (p.name === loserName && p.sport === sport) {
          const newLosses = p.losses + 1
          const total = p.wins + newLosses
          return {
            ...p,
            losses: newLosses,
            winRate: Number(((p.wins / total) * 100).toFixed(1)),
            streak: 0,
            recentMatches: [{ opponent: winnerName, score, result: 'L' }, ...p.recentMatches.slice(0, 4)],
          }
        }
        return p
      })
    )
  }

  // ─── ROULETTE RANDOM PAIRING ACTIONS ────────────────────────────────────────

  const spinRoulettePairing = (
    playerA: string,
    playerB: string,
    bracketPlacement: string,
    sport: SportType,
    courtAssigned: string
  ): RouletteSpinResult => {
    const result: RouletteSpinResult = {
      id: `roulette-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      playerA,
      playerB,
      bracketPlacement,
      sport,
      courtAssigned,
    }
    setRouletteResults((prev) => [result, ...prev])
    return result
  }

  const deleteRouletteResult = (id: string) => {
    setRouletteResults((prev) => prev.filter((r) => r.id !== id))
  }

  // ─── LIVE MATCH & SCORING LINK ACTIONS ──────────────────────────────────────

  const updateLiveScore = (matchId: string, team: 1 | 2, delta: number) => {
    setLiveMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              score1: team === 1 ? Math.max(0, m.score1 + delta) : m.score1,
              score2: team === 2 ? Math.max(0, m.score2 + delta) : m.score2,
            }
          : m
      )
    )
  }

  const switchLiveServer = (matchId: string) => {
    setLiveMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m
        const nextServer = m.currentServer === 1 ? 2 : 1
        return {
          ...m,
          currentServer: nextServer,
          serverName:
            nextServer === 1 ? m.team1Players[0] || m.team1Name : m.team2Players[0] || m.team2Name,
        }
      })
    )
  }

  const addPointHistory = (matchId: string, team: 1 | 2, text: string) => {
    setLiveMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              pointHistory: [
                {
                  team,
                  text,
                  time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
                ...(m.pointHistory || []),
              ],
            }
          : m
      )
    )
  }

  // ─── CLUB & REGISTERED TEAM ACTIONS ────────────────────────────────────────

  const registerClubTeam = (teamData: Omit<ClubTeam, 'id' | 'wins' | 'losses' | 'status'>) => {
    const newTeam: ClubTeam = {
      ...teamData,
      id: `club-${Date.now().toString().slice(-6)}`,
      wins: 0,
      losses: 0,
      status: 'registered',
    }
    setClubTeams((prev) => [newTeam, ...prev])
    return newTeam
  }

  return (
    <PickleballContext.Provider
      value={{
        paddles,
        paddleRentals,
        addPaddle,
        updatePaddle,
        deletePaddle,
        rentPaddle,
        returnPaddleRental,
        updatePaddleRentalStatus,
        openPlaySessions,
        createOpenPlaySession,
        updateOpenPlaySession,
        cancelOpenPlaySession,
        toggleRegistration,
        toggleQueue,
        joinOpenPlaySession,
        leaveOpenPlaySession,
        removeFromQueue,
        tournaments,
        bracketMatches,
        createTournament,
        addPairToTournament,
        updatePair,
        removePairFromTournament,
        updateMatchTeams,
        updateMatchScore,
        updateMatchSchedule,
        generateBracketFromPairs,
        declareChampion,
        reservations,
        addReservation,
        coaches,
        coachingBookings,
        playerProgress,
        bookCoachingSession,
        cancelCoachingBooking,
        shopItems,
        buyShopItem,
        aiQueuePlayers,
        generateAIQueue,
        rotateAIQueue,
        addPlayerToAIQueue,
        updatePlayerWinsLosses,
        adjustPlayerWins,
        adjustPlayerLosses,
        generateRandomPairs,
        removePlayerFromAIQueue,
        miniMatches,
        playerStats,
        recordMatchResult,
        rouletteResults,
        spinRoulettePairing,
        deleteRouletteResult,
        liveMatches,
        updateLiveScore,
        switchLiveServer,
        addPointHistory,
        clubTeams,
        registerClubTeam,
        resetToDefault,
      }}
    >
      {children}
    </PickleballContext.Provider>
  )
}

export const usePickleball = () => {
  const context = useContext(PickleballContext)
  if (!context) {
    throw new Error('usePickleball must be used within a PickleballProvider')
  }
  return context
}
