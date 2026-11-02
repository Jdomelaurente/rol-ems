'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { usePickleball } from '@/context/PickleballContext'
import { OpenPlaySession } from '@/lib/data'
import {
  Users,
  Clock,
  Calendar,
  Camera,
  Upload,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Flame,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

function OpenPlayContent() {
  const {
    openPlaySessions,
    paddles,
    joinOpenPlaySession,
    leaveOpenPlaySession,
    rentPaddle,
    playerStats,
  } = usePickleball()

  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab')

  // Streamlined Open Play tabs: 'sessions' (default) & 'stats'
  // (Courts are managed under the dedicated Courts navbar category)
  const [activeTab, setActiveTab] = useState<'sessions' | 'stats'>(() => {
    if (initialTab === 'stats') {
      return 'stats'
    }
    return 'sessions'
  })

  // Join Open Play Session Modal State
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

  useEffect(() => {
    if (initialTab === 'stats' || initialTab === 'sessions') {
      setActiveTab(initialTab)
    }
  }, [initialTab])

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

    const result = joinOpenPlaySession(
      selectedSession.id,
      playerName.trim(),
      paymentMethod,
      facePhoto || undefined
    )

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

  const availablePaddles = paddles.filter((p) => p.availability === 'Available' && p.quantityAvailable > 0)

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#E1A728]">
                Open Play & Drop-In Hub
              </p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">
                Drop-In Open Play Sessions
              </h1>
              <p className="mt-2 text-sm text-[#6B756B] max-w-2xl">
                Join drop-in open play sessions with unlimited player slots, flexible payments, on-site paddle rentals, and live player leaderboards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="border border-[#222222]/15 bg-white px-3.5 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336] rounded-md shadow-2xs">
                {openPlaySessions.length} Scheduled Open Play Sessions
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Open Play Sub-Navigation */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-[#222222]/10 pb-3">
          {[
            {
              id: 'sessions' as const,
              label: 'Open Play Sessions',
              icon: Users,
              badge: `${openPlaySessions.length} Active`,
            },
            {
              id: 'stats' as const,
              label: 'Leaderboard',
              icon: Trophy,
              badge: `${playerStats.length} Players`,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  isActive
                    ? 'bg-[#1E5336] text-[#FDFBF7] shadow-sm'
                    : 'bg-[#FDFBF7] text-[#6B756B] border border-[#222222]/15 hover:border-[#1E5336] hover:text-[#1E5336]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#E1A728]' : 'text-[#6B756B]'} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? 'bg-white/20 text-[#FDFBF7]' : 'bg-[#222222]/10 text-[#6B756B]'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </div>

        {/* =========================================================================
            TAB 1: ACTIVE OPEN PLAY SESSIONS
            ========================================================================= */}
        {activeTab === 'sessions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#222222]/10 pb-4">
              <h2 className="font-serif text-3xl text-[#1E5336]">Active Open Play Sessions</h2>
              <p className="mt-1 text-xs text-[#6B756B]">
                Select a session and register with your details to join. Unlimited participants accepted per session.
              </p>
            </div>

            {openPlaySessions.length === 0 ? (
              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-12 text-center text-[#6B756B] rounded-xl shadow-xs">
                <Users size={36} className="mx-auto text-[#E1A728] mb-2" />
                <p className="text-sm font-semibold">No open play sessions currently scheduled.</p>
                <p className="mt-1 text-xs text-[#6B756B]">Check back soon or ask the front desk to start an open play rotation.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {openPlaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col justify-between rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-xs transition hover:border-[#1E5336] hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-3">
                        <span className="font-serif text-xl font-bold text-[#1E5336]">{session.court}</span>
                        <span className="border border-[#1E5336]/20 bg-[#1E5336]/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336] rounded">
                          Open Play
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-[#6B756B]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#1E5336]" />
                          <span className="font-medium text-[#222222]">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#1E5336]" />
                          <span className="font-mono font-bold text-[#1E5336]">
                            {session.startTime} – {session.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-[#1E5336]">
                          <Users size={14} />
                          <span>{session.players.length} Players Registered (Unlimited)</span>
                        </div>
                      </div>

                      {session.players.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#222222]/10">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B756B] block mb-1.5">
                            Registered Players
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {session.players.map((p, idx) => (
                              <span
                                key={idx}
                                className="border border-[#222222]/10 bg-[#F3F0EC] px-2 py-0.5 text-[11px] text-[#222222] rounded"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-2 pt-3 border-t border-[#222222]/10">
                      <button
                        type="button"
                        onClick={() => handleOpenJoinModal(session)}
                        className="w-full rounded-md bg-[#1E5336] py-2.5 text-[11px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Users size={14} />
                        <span>Join Session</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: PLAYER LEADERBOARD
            ========================================================================= */}
        {activeTab === 'stats' && (
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8 shadow-sm animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222222]/10 pb-4 mb-4">
              <div>
                <h2 className="font-serif text-3xl text-[#1E5336]">Player Win/Loss Leaderboard</h2>
                <p className="text-xs text-[#6B756B] mt-1">
                  Player performance rankings and win rates across Open Play sessions and club matches.
                </p>
              </div>
              <span className="text-xs font-bold text-[#E1A728] uppercase tracking-wider">
                {playerStats.length} Ranked Players
              </span>
            </div>

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
                    <tr key={st.id} className="hover:bg-[#F3F0EC]/60 transition">
                      <td className="py-3 pr-3 font-bold text-[#1E5336]">#{st.rank}</td>
                      <td className="py-3 pr-3 font-bold text-[#222222]">{st.name}</td>
                      <td className="py-3 pr-3 font-bold text-[#1E5336]">{st.wins}W</td>
                      <td className="py-3 pr-3 font-bold text-[#E1A728]">{st.losses}L</td>
                      <td className="py-3 pr-3 font-mono font-bold">{st.winRate}%</td>
                      <td className="py-3 font-bold text-[#E1A728] flex items-center gap-1">
                        <Flame size={13} className="text-[#E1A728]" />
                        <span>{st.streak}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Informational Tournament Central Callout */}
        <div className="mt-12 rounded-xl border border-[#222222]/10 bg-[#FDFBF7] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#E1A728]/15 text-[#E1A728]">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#222222]">
                Looking for Pickle Queue, Pairs Management, or Mini Matches?
              </p>
              <p className="text-[11px] text-[#6B756B]">
                Competitive rotational queuing, dynamic team pairing, and live match scoring are managed in the dedicated Tournament Central.
              </p>
            </div>
          </div>
          <Link
            href="/pickleball/tournaments"
            className="shrink-0 rounded-md border border-[#1E5336] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#1E5336] hover:bg-[#1E5336] hover:text-white transition shadow-2xs"
          >
            Go to Tournament Central →
          </Link>
        </div>

        {/* Join Session Modal */}
        {isJoinModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E1A728] tracking-wider">
                    Open Play Registration
                  </span>
                  <h3 className="font-serif text-2xl text-[#1E5336]">Join Open Play</h3>
                  <p className="mt-0.5 text-xs text-[#6B756B]">
                    {selectedSession.court} · {selectedSession.startTime}–{selectedSession.endTime}
                  </p>
                </div>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className="rounded p-1 text-sm text-[#6B756B] hover:text-black hover:bg-[#222222]/10 transition"
                >
                  ✕
                </button>
              </div>

              {feedback && (
                <div
                  className={`my-3 rounded-md border p-3 text-xs flex items-start gap-2 ${
                    feedback.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-50 text-emerald-800'
                      : 'border-rose-500/30 bg-rose-50 text-rose-800'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{feedback.title}</p>
                    <p className="mt-0.5">{feedback.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirmJoin} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 text-sm focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">
                    Contact / Mobile Number (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0917-123-4567"
                    value={playerContact}
                    onChange={(e) => setPlayerContact(e.target.value)}
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] mb-1">
                    Select Payment Method *
                  </label>
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
                        className={`rounded-md border py-2 px-2 text-center text-[10px] uppercase tracking-[0.12em] font-bold transition ${
                          paymentMethod === m.id
                            ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7] shadow-xs'
                            : 'border-[#222222]/20 bg-white text-[#6B756B] hover:border-[#222222]/40'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'Pay at Counter' && (
                  <div className="rounded-md border-2 border-dashed border-[#1E5336]/40 bg-[#F3F0EC] p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1E5336] mb-1">
                      <Camera size={16} />
                      <span>Upload Face Photo for Counter Verification</span>
                    </div>
                    <p className="text-[11px] text-[#6B756B] mb-3">
                      Please upload a clear photo of your face so front desk staff can confirm your identity when paying at the counter.
                    </p>

                    {facePhoto ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={facePhoto}
                          alt="Face Verification Preview"
                          className="h-20 w-20 object-cover border-2 border-[#1E5336] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setFacePhoto('')}
                          className="text-[11px] font-bold text-rose-700 hover:underline"
                        >
                          Remove / Re-upload
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="inline-flex items-center gap-1.5 rounded bg-[#1E5336] px-3.5 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27] cursor-pointer shadow-xs">
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
                  <div className="rounded-md border border-[#222222]/10 bg-[#F3F0EC] p-3.5 space-y-2">
                    <p className="font-bold text-[#222222]">Send to {paymentMethod} Account:</p>
                    <p className="font-mono text-sm font-bold text-[#1E5336]">
                      0917-123-4567 (ROL-EMS Pickleball)
                    </p>
                    <div>
                      <label className="block text-[11px] text-[#6B756B] mb-0.5">Reference Number (optional):</label>
                      <input
                        type="text"
                        placeholder="e.g. 100234589"
                        value={paymentRefNumber}
                        onChange={(e) => setPaymentRefNumber(e.target.value)}
                        className="w-full rounded border border-[#222222]/20 bg-white p-1.5 text-xs"
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
                      <label htmlFor="paddleRental" className="font-bold text-[#222222] select-none cursor-pointer">
                        Add Rental Paddle
                      </label>
                    </div>

                    {wantPaddleRental && (
                      <select
                        value={selectedPaddleId}
                        onChange={(e) => setSelectedPaddleId(e.target.value)}
                        className="w-full rounded border border-[#222222]/20 bg-white p-2 text-xs focus:border-[#1E5336] focus:outline-none"
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
                  className="w-full rounded-md bg-[#1E5336] py-3 text-[11px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27] transition shadow-xs"
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

export default function OpenPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F0EC] pt-[64px] pb-16 flex items-center justify-center text-xs text-[#6B756B]">
          Loading Open Play...
        </div>
      }
    >
      <OpenPlayContent />
    </Suspense>
  )
}