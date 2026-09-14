'use client'

import React, { useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import { OpenPlaySession, AIQueuePlayer } from '@/lib/data'
import {
  Users,
  Clock,
  Calendar,
  RefreshCw,
  Shuffle,
  Camera,
  Upload,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function OpenPlayPage() {
  const {
    openPlaySessions,
    paddles,
    joinOpenPlaySession,
    leaveOpenPlaySession,
    rentPaddle,
    aiQueuePlayers,
    miniMatches,
    generateAIQueue,
    rotateAIQueue,
    generateRandomPairs,
    addPlayerToAIQueue,
    removePlayerFromAIQueue,
    playerStats,
  } = usePickleball()

  const [activeTab, setActiveTab] = useState<'sessions' | 'ai-queue' | 'mini-queue' | 'stats'>('sessions')

  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerWins, setNewPlayerWins] = useState(0)
  const [newPlayerLosses, setNewPlayerLosses] = useState(0)
  const [newPlayerPoints, setNewPlayerPoints] = useState(0)
  const [newFixedPartner, setNewFixedPartner] = useState('')
  const [fixedPartnerMode, setFixedPartnerMode] = useState(false)

  const [selectedSession, setSelectedSession] = useState<OpenPlaySession | null>(null)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerContact, setPlayerContact] = useState('')
  const [wantPaddleRental, setWantPaddleRental] = useState(false)
  const [selectedPaddleId, setSelectedPaddleId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'Pay at Counter' | 'GCash' | 'Maya'>('Pay at Counter')
  const [facePhoto, setFacePhoto] = useState<string>('')
  const [paymentRefNumber, setPaymentRefNumber] = useState('')

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    title: string
    message: string
  } | null>(null)

  const handleFacePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFacePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOpenJoinModal = (session: OpenPlaySession) => {
    setSelectedSession(session)
    setFeedback(null)
    setPlayerName('')
    setPlayerContact('')
    setFacePhoto('')
    setPaymentRefNumber('')
    setWantPaddleRental(false)
    setSelectedPaddleId('')
    setPaymentMethod('Pay at Counter')
    setIsJoinModalOpen(true)
  }

  const handleConfirmJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession || !playerName.trim()) return

    const result = joinOpenPlaySession(selectedSession.id, playerName.trim(), paymentMethod, facePhoto || undefined)

    if (result.joined) {
      if (wantPaddleRental && selectedPaddleId) {
        const paddleObj = paddles.find((p) => p.id === selectedPaddleId)
        if (paddleObj) {
          rentPaddle({
            paddleId: paddleObj.id,
            paddleName: paddleObj.name,
            renterName: playerName.trim(),
            renterContact: playerContact.trim(),
            attachedToType: 'Open Play',
            attachedToId: selectedSession.id,
            courtOrSession: `${selectedSession.court} (${selectedSession.startTime} - ${selectedSession.endTime})`,
            date: selectedSession.date,
            time: selectedSession.startTime,
            duration: 'Open Play Session',
            totalPrice: paddleObj.price,
            paymentMethod,
            paymentStatus: paymentMethod === 'Pay at Counter' ? 'pending' : 'paid',
            status: paymentMethod === 'Pay at Counter' ? 'Reserved' : 'Active',
          })
        }
      }
      setFeedback({
        type: 'success',
        title: 'Registration Successful!',
        message: `${playerName} is registered for ${selectedSession.court}. Payment method: ${paymentMethod}.${
          paymentMethod === 'Pay at Counter' ? ' Present your face verification at the desk.' : ''
        }`,
      })
    } else {
      setFeedback({
        type: 'error',
        title: 'Registration Alert',
        message: result.message,
      })
    }
  }

  const handleAddAIPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return
    addPlayerToAIQueue(
      newPlayerName.trim(),
      'Pickleball',
      newPlayerWins,
      newPlayerLosses,
      newPlayerPoints,
      fixedPartnerMode && newFixedPartner.trim() ? newFixedPartner.trim() : undefined
    )
    setNewPlayerName('')
    setNewPlayerWins(0)
    setNewPlayerLosses(0)
    setNewPlayerPoints(0)
    setNewFixedPartner('')
  }

  const pairedGroups = React.useMemo(() => {
    const map = new Map<number, AIQueuePlayer[]>()
    aiQueuePlayers.forEach((p) => {
      if (p.pairNumber) {
        const existing = map.get(p.pairNumber) || []
        existing.push(p)
        map.set(p.pairNumber, existing)
      }
    })
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [aiQueuePlayers])

  const availablePaddles = paddles.filter((p) => p.availability === 'Available' && p.quantityAvailable > 0)

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Open Play & Rotation Hub</p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Drop-In Open Play & Player Queue</h1>
              <p className="mt-2 text-sm text-[#6B756B]">Join sessions with unlimited player slots, flexible payment, and simple pair rotation.</p>
            </div>
            <span className="border border-[#222222]/15 bg-[#FDFBF7] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
              {aiQueuePlayers.length} Players in Queue
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-0 border border-[#222222]/15 bg-[#FDFBF7] p-1">
          {[
            { id: 'sessions', label: 'Open Play Sessions' },
            { id: 'ai-queue', label: 'Player Queue & Pairs' },
            { id: 'mini-queue', label: 'Mini Matches' },
            { id: 'stats', label: 'Leaderboard' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                activeTab === tab.id
                  ? 'bg-[#1E5336] text-[#FDFBF7]'
                  : 'text-[#6B756B] hover:text-[#222222]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#1E5336]">Active Open Play Sessions</h2>
                <p className="mt-1 text-xs text-[#6B756B]">Select a session and input your name to join. Unlimited participants accepted.</p>
              </div>
            </div>

            {openPlaySessions.length === 0 ? (
              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-12 text-center text-[#6B756B]">
                <Users size={36} className="mx-auto text-[#E1A728] mb-2" />
                <p className="text-sm font-semibold">No open play sessions scheduled.</p>
                <p className="mt-1 text-xs text-[#6B756B]">Check back soon or ask the front desk to start a session.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {openPlaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col justify-between border border-[#222222]/15 bg-[#FDFBF7] p-5 transition hover:border-[#1E5336]"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-3">
                        <span className="font-serif text-lg text-[#1E5336]">{session.court}</span>
                        <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                          Open Play
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-[#6B756B]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#1E5336]" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#1E5336]" />
                          <span>{session.startTime} – {session.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[#1E5336]">
                          <Users size={14} />
                          <span>{session.players.length} Players Registered (Unlimited)</span>
                        </div>
                      </div>

                      {session.players.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#222222]/10">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B756B] block mb-1">
                            Registered Players
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {session.players.map((p, idx) => (
                              <span key={idx} className="border border-[#222222]/10 bg-[#F3F0EC] px-2 py-0.5 text-[11px] text-[#222222]">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenJoinModal(session)}
                      className="mt-5 w-full bg-[#1E5336] py-2.5 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition"
                    >
                      Join Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-queue' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border border-[#222222]/15 bg-[#FDFBF7] p-5">
              <div>
                <h3 className="font-serif text-xl text-[#1E5336]">Simple Queue & Rotation</h3>
                <p className="mt-1 text-xs text-[#6B756B]">Generate pairs, rotate next players onto court, or add new players.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => generateRandomPairs('Pickleball')}
                  className="flex items-center gap-1.5 bg-[#E1A728] px-4 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336] hover:bg-[#c48e1a] transition"
                >
                  <Shuffle size={14} /> Generate Pairs
                </button>
                <button
                  onClick={() => rotateAIQueue('Pickleball')}
                  className="flex items-center gap-1.5 bg-[#1E5336] px-4 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition"
                >
                  <RefreshCw size={14} /> Rotate Court
                </button>
              </div>
            </div>

            {pairedGroups.length > 0 && (
              <div className="border-2 border-[#1E5336] bg-[#FDFBF7] p-6">
                <div className="flex items-center justify-between mb-4 border-b border-[#1E5336]/20 pb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#1E5336] font-bold">Identified Pair Matchups</p>
                    <h3 className="mt-1 font-serif text-xl text-[#1E5336]">Current Generated Pairs ({pairedGroups.length} Pairs)</h3>
                  </div>
                  {pairedGroups.length >= 2 && (
                    <span className="bg-[#1E5336] px-3 py-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7]">
                      Match: Pair #1 VS Pair #2
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {pairedGroups.map(([pairNum, players]) => {
                    const isCourtMatch = pairNum <= 2
                    const pairStyles =
                      pairNum === 1
                        ? 'border-[#1E5336]/40'
                        : pairNum === 2
                        ? 'border-[#E1A728]/60'
                        : pairNum === 3
                        ? 'border-[#6B756B]/40'
                        : 'border-[#222222]/20'

                    return (
                      <div key={pairNum} className={`border bg-[#F3F0EC] p-4 transition ${pairStyles}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-[#1E5336] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-black text-[#FDFBF7]">
                            PAIR #{pairNum}
                          </span>
                          <span className="text-[10px] font-semibold text-[#6B756B]">
                            {isCourtMatch ? 'Active Court Match' : 'Next in Queue'}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {players.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 border border-[#222222]/10 bg-[#FDFBF7] p-2">
                              {p.photo ? (
                                <img src={p.photo} alt={p.name} className="h-8 w-8 object-cover border border-[#222222]/10" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center bg-[#1E5336]/10 font-bold text-[#1E5336] text-xs">
                                  {p.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#222222] truncate">{p.name}</p>
                                <p className="text-[10px] text-[#6B756B] font-mono font-medium">
                                  {p.points || 0} pts · {p.wins}W - {p.losses}L
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4 border-b border-[#222222]/10 pb-3">
                  <div>
                    <h3 className="font-serif text-xl text-[#1E5336]">All Players in Queue ({aiQueuePlayers.length})</h3>
                    <p className="mt-1 text-xs text-[#6B756B]">Shows player points, assigned pair, and win/loss records.</p>
                  </div>
                </div>

                {aiQueuePlayers.length === 0 ? (
                  <div className="py-12 text-center text-[#6B756B]">
                    <Users size={32} className="mx-auto text-[#E1A728] mb-2" />
                    <p className="text-sm font-semibold text-[#6B756B]">Queue is currently empty.</p>
                    <p className="mt-1 text-xs text-[#6B756B]">Use the quick add form on the right or join an open play session.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#222222]/10 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        <tr>
                          <th className="py-3 pr-3">Player</th>
                          <th className="py-3 pr-3">Points</th>
                          <th className="py-3 pr-3">Assigned Pair</th>
                          <th className="py-3 pr-3">Record (W-L)</th>
                          <th className="py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]/10 font-medium">
                        {aiQueuePlayers.map((player) => (
                          <tr key={player.id} className="hover:bg-[#F3F0EC]/50">
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2">
                                {player.photo ? (
                                  <img src={player.photo} alt={player.name} className="h-7 w-7 object-cover border border-[#222222]/10" />
                                ) : (
                                  <div className="flex h-7 w-7 items-center justify-center bg-[#1E5336]/10 text-xs font-bold text-[#1E5336]">
                                    {player.name.charAt(0)}
                                  </div>
                                )}
                                <span className="font-bold text-[#222222]">{player.name}</span>
                              </div>
                            </td>

                            <td className="py-3 pr-3 font-mono font-bold text-sm text-[#1E5336]">
                              {player.points || 0} pts
                            </td>

                            <td className="py-3 pr-3">
                              {player.pairNumber ? (
                                <span
                                  className={`border px-2.5 py-0.5 text-[10px] font-bold ${
                                    player.pairNumber === 1
                                      ? 'border-[#1E5336]/30 text-[#1E5336]'
                                      : player.pairNumber === 2
                                      ? 'border-[#E1A728]/50 text-[#E1A728]'
                                      : 'border-[#222222]/15 text-[#6B756B]'
                                  }`}
                                >
                                  Pair #{player.pairNumber} {player.partnerName && `(with ${player.partnerName})`}
                                </span>
                              ) : (
                                <span className="text-[#6B756B] text-[11px]">Unpaired</span>
                              )}
                            </td>

                            <td className="py-3 pr-3 font-mono text-[11px]">
                              <span className="font-bold text-[#1E5336]">{player.wins}W</span>
                              <span className="mx-1 text-[#6B756B]">–</span>
                              <span className="font-bold text-[#E1A728]">{player.losses}L</span>
                            </td>

                            <td className="py-3">
                              <span
                                className={`border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${
                                  player.status === 'in-match'
                                    ? 'border-[#1E5336]/30 text-[#1E5336]'
                                    : 'border-[#222222]/15 text-[#6B756B]'
                                }`}
                              >
                                {player.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6">
                <h3 className="font-serif text-xl text-[#1E5336]">Quick Add to Queue</h3>
                <p className="mt-1 text-xs text-[#6B756B] mb-4">Add a player directly into rotation.</p>

                <form onSubmit={handleAddAIPlayer} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Player Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="w-full border border-[#222222]/20 bg-transparent p-2.5 focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Starting Points</label>
                    <input
                      type="number"
                      min="0"
                      value={newPlayerPoints}
                      onChange={(e) => setNewPlayerPoints(parseInt(e.target.value) || 0)}
                      className="w-full border border-[#222222]/20 bg-transparent p-2.5 focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Wins</label>
                      <input
                        type="number"
                        min="0"
                        value={newPlayerWins}
                        onChange={(e) => setNewPlayerWins(parseInt(e.target.value) || 0)}
                        className="w-full border border-[#222222]/20 bg-transparent p-2.5 focus:border-[#1E5336] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Losses</label>
                      <input
                        type="number"
                        min="0"
                        value={newPlayerLosses}
                        onChange={(e) => setNewPlayerLosses(parseInt(e.target.value) || 0)}
                        className="w-full border border-[#222222]/20 bg-transparent p-2.5 focus:border-[#1E5336] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition"
                  >
                    Add Player to Queue
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mini-queue' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-[#1E5336]">Mini Match Queue</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {miniMatches.map((match) => (
                <div key={match.id} className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
                  <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2 mb-3">
                    <span className="text-xs font-bold text-[#1E5336]">{match.court}</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B]">{match.status}</span>
                  </div>
                  <p className="font-bold text-sm text-[#222222]">{match.player1} & {match.player2}</p>
                  {match.player3 && (
                    <p className="mt-1 text-xs text-[#6B756B]">vs {match.player3} & {match.player4}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-[#222222]/10 pt-2 text-xs">
                    <span className="font-bold text-[#1E5336]">Score: {match.score1} – {match.score2}</span>
                    <span className="text-[#6B756B]">{match.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6">
            <h2 className="font-serif text-2xl text-[#1E5336] mb-4">Player Win/Loss Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#222222]/10 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                  <tr>
                    <th className="py-3 pr-3">Rank</th>
                    <th className="py-3 pr-3">Player</th>
                    <th className="py-3 pr-3">Wins</th>
                    <th className="py-3 pr-3">Losses</th>
                    <th className="py-3 pr-3">Win Rate</th>
                    <th className="py-3">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {playerStats.map((st) => (
                    <tr key={st.id} className="hover:bg-[#F3F0EC]/50">
                      <td className="py-3 pr-3 font-bold text-[#1E5336]">#{st.rank}</td>
                      <td className="py-3 pr-3 font-bold text-[#222222]">{st.name}</td>
                      <td className="py-3 pr-3 font-bold text-[#1E5336]">{st.wins}W</td>
                      <td className="py-3 pr-3 font-bold text-[#E1A728]">{st.losses}L</td>
                      <td className="py-3 pr-3 font-bold">{st.winRate}%</td>
                      <td className="py-3 font-bold text-[#E1A728]">🔥 {st.streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isJoinModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md border border-[#222222]/10 bg-[#FDFBF7] p-6">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <div>
                  <h3 className="font-serif text-xl text-[#1E5336]">Join Open Play</h3>
                  <p className="mt-0.5 text-xs text-[#6B756B]">
                    {selectedSession.court} · {selectedSession.startTime}–{selectedSession.endTime}
                  </p>
                </div>
                <button onClick={() => setIsJoinModalOpen(false)} className="p-1 text-sm text-[#6B756B] hover:text-black">
                  ✕
                </button>
              </div>

              {feedback && (
                <div
                  className={`my-3 border p-3 text-xs ${
                    feedback.type === 'success'
                      ? 'border-[#1E5336]/20 bg-[#F3F0EC] text-[#1E5336]'
                      : 'border-[#E1A728]/40 bg-[#FDFBF7] text-[#e0742c]'
                  }`}
                >
                  <p className="font-bold">{feedback.title}</p>
                  <p className="mt-0.5">{feedback.message}</p>
                </div>
              )}

              <form onSubmit={handleConfirmJoin} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-sm focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Contact / Mobile Number (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0917-123-4567"
                    value={playerContact}
                    onChange={(e) => setPlayerContact(e.target.value)}
                    className="w-full border border-[#222222]/20 bg-transparent p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">Select Payment Method *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Pay at Counter', label: 'Pay at Counter' },
                      { id: 'GCash', label: 'GCash' },
                      { id: 'Maya', label: 'Maya' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`border py-2 px-2 text-center text-[10px] uppercase tracking-[0.12em] font-bold transition ${
                          paymentMethod === m.id
                            ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                            : 'border-[#222222]/20 bg-[#FDFBF7] text-[#6B756B] hover:border-[#222222]/40'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'Pay at Counter' && (
                  <div className="border-2 border-dashed border-[#1E5336]/40 bg-[#F3F0EC] p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1E5336] mb-1">
                      <Camera size={16} />
                      <span>Upload Face Photo for Counter Verification</span>
                    </div>
                    <p className="text-[11px] text-[#6B756B] mb-3">
                      Please upload a clear photo of your face so the front desk staff can confirm your identity when paying at the counter.
                    </p>

                    {facePhoto ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={facePhoto}
                          alt="Face Verification Preview"
                          className="h-20 w-20 object-cover border-2 border-[#1E5336]"
                        />
                        <button
                          type="button"
                          onClick={() => setFacePhoto('')}
                          className="text-[11px] font-bold text-[#e0742c] hover:underline"
                        >
                          Remove / Re-upload
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="inline-flex items-center gap-1.5 bg-[#1E5336] px-3.5 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27] cursor-pointer">
                          <Upload size={14} />
                          <span>Choose or Take Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFacePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {(paymentMethod === 'GCash' || paymentMethod === 'Maya') && (
                  <div className="border border-[#222222]/10 bg-[#F3F0EC] p-3.5 space-y-2">
                    <p className="font-bold text-[#222222]">Send to {paymentMethod} Account:</p>
                    <p className="font-mono text-sm font-bold text-[#1E5336]">0917-123-4567 (ROL-EMS Pickleball)</p>
                    <div>
                      <label className="block text-[11px] text-[#6B756B] mb-0.5">Reference Number (optional):</label>
                      <input
                        type="text"
                        placeholder="e.g. 100234589"
                        value={paymentRefNumber}
                        onChange={(e) => setPaymentRefNumber(e.target.value)}
                        className="w-full border border-[#222222]/20 bg-[#FDFBF7] p-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}

                {availablePaddles.length > 0 && (
                  <div className="border-t border-[#222222]/10 pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="paddleRental"
                        checked={wantPaddleRental}
                        onChange={(e) => setWantPaddleRental(e.target.checked)}
                        className="accent-[#1E5336] h-4 w-4"
                      />
                      <label htmlFor="paddleRental" className="font-bold text-[#222222] select-none">
                        Add Rental Paddle
                      </label>
                    </div>

                    {wantPaddleRental && (
                      <select
                        value={selectedPaddleId}
                        onChange={(e) => setSelectedPaddleId(e.target.value)}
                        className="w-full border border-[#222222]/20 bg-transparent p-2 focus:border-[#1E5336] focus:outline-none"
                      >
                        <option value="">— Select a paddle —</option>
                        {availablePaddles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₱{p.price}/session ({p.quantityAvailable} avail.)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition"
                >
                  Confirm Registration
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}