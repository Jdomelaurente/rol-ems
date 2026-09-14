'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { OpenPlaySession } from '@/lib/data'
import { Users, Plus, ArrowLeft, Calendar, Clock, Edit, Trash2, Lock, Unlock, ToggleLeft, ToggleRight, CheckCircle2, UserX, Shuffle, Sparkles, Zap } from 'lucide-react'

export default function AdminOpenPlayPage() {
  const {
    openPlaySessions,
    createOpenPlaySession,
    updateOpenPlaySession,
    cancelOpenPlaySession,
    toggleRegistration,
    toggleQueue,
    leaveOpenPlaySession,
    removeFromQueue,
    aiQueuePlayers,
    addPlayerToAIQueue,
    adjustPlayerWins,
    adjustPlayerLosses,
    generateRandomPairs,
    generateAIQueue,
    rotateAIQueue,
    removePlayerFromAIQueue,
  } = usePickleball()

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<OpenPlaySession | null>(null)
  const [activeAdminTab, setActiveAdminTab] = useState<'sessions' | 'ai-queue'>('sessions')

  // AI Queue Form State
  const [queuePlayerName, setQueuePlayerName] = useState('')
  const [queuePlayerWins, setQueuePlayerWins] = useState(0)
  const [queuePlayerLosses, setQueuePlayerLosses] = useState(0)
  const [queueFixedPartner, setQueueFixedPartner] = useState('')

  // Identify generated pairs
  const pairedGroups = React.useMemo(() => {
    const map = new Map<number, typeof aiQueuePlayers>()
    aiQueuePlayers.forEach((p) => {
      if (p.pairNumber) {
        const existing = map.get(p.pairNumber) || []
        existing.push(p)
        map.set(p.pairNumber, existing)
      }
    })
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [aiQueuePlayers])

  // Form State
  const [court, setCourt] = useState('Court 1')
  const [date, setDate] = useState('2026-08-31')
  const [dayOfWeek, setDayOfWeek] = useState('Monday')
  const [startTime, setStartTime] = useState('5:00 PM')
  const [endTime, setEndTime] = useState('8:00 PM')

  const handleOpenAdd = () => {
    setEditingSession(null)
    setCourt('Court 1')
    setDate('2026-08-31')
    setDayOfWeek('Monday')
    setStartTime('5:00 PM')
    setEndTime('8:00 PM')
    setIsAddSessionModalOpen(true)
  }

  const handleOpenEdit = (session: OpenPlaySession) => {
    setEditingSession(session)
    setCourt(session.court)
    setDate(session.date)
    setDayOfWeek(session.dayOfWeek || 'Monday')
    setStartTime(session.startTime)
    setEndTime(session.endTime)
    setIsAddSessionModalOpen(true)
  }

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSession) {
      updateOpenPlaySession(editingSession.id, {
        court,
        date,
        dayOfWeek,
        startTime,
        endTime,
      })
    } else {
      createOpenPlaySession({
        court,
        date,
        dayOfWeek,
        startTime,
        endTime,
      })
    }

    setIsAddSessionModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Open Play Controls</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Open Play & AI Queue</h1>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 bg-[#1E5336] text-[#FDFBF7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#153b26] transition shadow-sm"
            >
              <Plus size={16} /> Create Open Play Session
            </button>
          </div>

          {/* Admin Tabs */}
          <div className="mt-6 flex gap-2">
            {[
              { id: 'sessions', label: 'Session Management', icon: Users },
              { id: 'ai-queue', label: 'AI Queue & Rotation', icon: Zap },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveAdminTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border transition ${
                  activeAdminTab === id
                    ? 'bg-[#1E5336] text-white border-[#1E5336]'
                    : 'bg-white text-[#1E5336] border-[#1E5336]/30 hover:border-[#1E5336]'
                }`}
              >
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* SESSION MANAGEMENT TAB */}
        {activeAdminTab === 'sessions' && (
          <div className="mb-8 border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-6">
              <div>
                <h2 className="font-serif text-2xl text-[#1E5336]">Configured Open Play Sessions</h2>
                <p className="text-xs text-[#6B756B]">Sessions have <strong>unlimited player capacity</strong>. All joining players are confirmed automatically.</p>
              </div>
              <span className="text-xs text-[#1E5336] font-bold uppercase">{openPlaySessions.length} Sessions</span>
            </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {openPlaySessions.map((session) => {
              const currentPlayersCount = session.players.length
              const isFull = currentPlayersCount >= 12

              return (
                <div
                  key={session.id}
                  className={`border-2 p-5 bg-white shadow-sm flex flex-col justify-between ${
                    session.status === 'cancelled'
                      ? 'border-gray-300 opacity-60'
                      : isFull
                      ? 'border-amber-400'
                      : 'border-[#1E5336]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-3">
                      <div>
                        <h3 className="font-serif font-bold text-xl text-[#1E5336]">{session.court} — Open Play</h3>
                        <p className="text-xs font-bold text-[#E1A728] uppercase tracking-wider">{session.dayOfWeek || 'Monday'}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        session.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : isFull
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Schedule Time & Capacity */}
                    <div className="space-y-1 text-xs text-[#6B756B] mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#1E5336]" />
                          <span>Start: <strong>{session.startTime}</strong> · End: <strong>{session.endTime}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#1E5336]" />
                          <span>Date: <strong>{session.date}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-[#1E5336]">
                          <Users size={14} />
                          <span>Players: {currentPlayersCount} registered (Unlimited)</span>
                        </div>
                      </div>

                    {/* Quick Admin Toggles */}
                    <div className="grid grid-cols-2 gap-2 mb-4 bg-[#F3F0EC] p-2.5 rounded text-[11px]">
                      <button
                        onClick={() => toggleRegistration(session.id)}
                        className={`flex items-center justify-center gap-1 p-1.5 font-bold uppercase rounded transition ${
                          session.isRegistrationOpen
                            ? 'bg-emerald-700 text-white'
                            : 'bg-rose-700 text-white'
                        }`}
                      >
                        {session.isRegistrationOpen ? <Unlock size={12} /> : <Lock size={12} />}
                        {session.isRegistrationOpen ? 'Reg: Open' : 'Reg: Closed'}
                      </button>

                      <button
                        onClick={() => toggleQueue(session.id)}
                        className={`flex items-center justify-center gap-1 p-1.5 font-bold uppercase rounded transition ${
                          session.isQueueOpen
                            ? 'bg-blue-700 text-white'
                            : 'bg-stone-500 text-white'
                        }`}
                      >
                        {session.isQueueOpen ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {session.isQueueOpen ? 'Queue: Open' : 'Queue: Closed'}
                      </button>
                    </div>

                    {/* Player List */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[10px] font-bold uppercase text-[#6B756B] block">
                        Registered Players ({session.players.length}):
                      </span>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {session.players.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-stone-50 p-1.5 rounded">
                            <span>#{idx + 1} {p}</span>
                            <button
                              onClick={() => leaveOpenPlaySession(session.id, p)}
                              className="text-rose-600 font-bold text-[10px] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Queue List */}
                    {session.queue.length > 0 && (
                      <div className="space-y-1.5 bg-amber-50 p-2.5 rounded border border-amber-200 mb-4">
                        <span className="text-[10px] font-bold uppercase text-amber-900 block">
                          Waiting Queue ({session.queue.length}):
                        </span>
                        {session.queue.map((q, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-amber-950 font-bold">
                            <span>Pos #{idx + 1}: {q}</span>
                            <button
                              onClick={() => removeFromQueue(session.id, q)}
                              className="text-rose-700 text-[10px] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#222222]/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEdit(session)}
                      className="border border-[#222222]/20 px-3 py-1 text-[11px] font-bold uppercase hover:bg-stone-100 flex items-center gap-1"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => cancelOpenPlaySession(session.id)}
                      className="border border-rose-200 text-rose-600 px-3 py-1 text-[11px] font-bold uppercase hover:bg-rose-600 hover:text-white flex items-center gap-1"
                    >
                      Cancel Session
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* AI QUEUE ADMIN TAB */}
        {activeAdminTab === 'ai-queue' && (
          <div className="space-y-8">
            {/* AI Controls */}
            <div className="border border-[#222222]/15 bg-[#111827] p-6 shadow-sm text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E1A728]">Admin AI Queue Control</p>
                  <h2 className="font-serif text-2xl font-bold">Pickleball Queue & Rotation Engine</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => generateRandomPairs('Pickleball')}
                    className="flex items-center gap-2 bg-[#E1A728] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#111827] shadow hover:bg-[#c48e1a]"
                  >
                    <Shuffle size={14} /> Generate Random Pairs
                  </button>
                  <button
                    onClick={() => generateAIQueue('Pickleball')}
                    className="flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-xs font-bold uppercase text-white shadow hover:bg-[#153b26]"
                  >
                    <Sparkles size={14} /> Balance Queue
                  </button>
                  <button
                    onClick={() => rotateAIQueue('Pickleball')}
                    className="flex items-center gap-2 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-white/20"
                  >
                    Rotate Queue
                  </button>
                </div>
              </div>
            </div>

            {/* IDENTIFIED PAIRS - CLEAR MATCHUPS */}
            {pairedGroups.length > 0 && (
              <div className="border-2 border-[#1E5336] bg-[#E8F3ED]/60 p-5 rounded-xl">
                <div className="flex items-center justify-between border-b border-[#1E5336]/20 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5336]">
                      Pair Identification Control
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#1E5336]">
                      Current Active Pairs ({pairedGroups.length} Pairs)
                    </h3>
                  </div>
                  {pairedGroups.length >= 2 && (
                    <span className="rounded bg-[#1E5336] px-3 py-1 text-xs font-bold text-white">
                      Active Match: Pair #1 vs Pair #2
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {pairedGroups.map(([pairNum, players]) => (
                    <div
                      key={pairNum}
                      className={`p-3 rounded-lg border ${
                        pairNum === 1
                          ? 'bg-emerald-50 border-emerald-400'
                          : pairNum === 2
                          ? 'bg-amber-50 border-amber-400'
                          : pairNum === 3
                          ? 'bg-sky-50 border-sky-400'
                          : 'bg-purple-50 border-purple-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-black uppercase ${
                            pairNum === 1
                              ? 'bg-[#1E5336] text-white'
                              : pairNum === 2
                              ? 'bg-[#E1A728] text-black'
                              : pairNum === 3
                              ? 'bg-sky-700 text-white'
                              : 'bg-purple-700 text-white'
                          }`}
                        >
                          PAIR #{pairNum}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          {pairNum <= 2 ? 'On Court' : 'Waiting'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {players.map((p) => (
                          <div key={p.id} className="flex items-center justify-between bg-white p-1.5 rounded border text-xs">
                            <span className="font-bold text-gray-900">{p.name}</span>
                            <span className="font-mono text-[11px] font-bold text-[#1E5336]">{p.wins}W – {p.losses}L</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Queue Table */}
              <div className="lg:col-span-2 border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl text-[#1E5336]">
                    Player Queue ({aiQueuePlayers.length} Players)
                  </h3>
                  <span className="text-xs text-gray-500">Adjust W/L record with the +/- buttons</span>
                </div>

                {aiQueuePlayers.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                    No players in queue. Add players using the form →
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F3F0EC] text-[10px] font-extrabold uppercase text-[#6B756B]">
                        <tr>
                          <th className="p-3">Player</th>
                          <th className="p-3">Assigned Pair</th>
                          <th className="p-3">Wins</th>
                          <th className="p-3">Losses</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {aiQueuePlayers.map((player) => (
                          <tr key={player.id} className="hover:bg-stone-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {player.photo ? (
                                  <img
                                    src={player.photo}
                                    alt={player.name}
                                    className="h-8 w-8 rounded-full object-cover border border-gray-300"
                                    title="Face verification photo"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E5336]/10 text-xs font-bold text-[#1E5336]">
                                    {player.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-[#111827] block">{player.name}</span>
                                  {player.paymentMethod && (
                                    <span className="text-[9px] text-gray-500 block">
                                      {player.paymentMethod === 'Pay at Counter' ? '🏦 Counter Pay' : player.paymentMethod}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Assigned Pair Column */}
                            <td className="p-3">
                              {player.pairNumber ? (
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                    player.pairNumber === 1
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : player.pairNumber === 2
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : player.pairNumber === 3
                                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                      : 'bg-purple-100 text-purple-800 border border-purple-300'
                                  }`}
                                >
                                  Pair #{player.pairNumber} {player.partnerName ? `(with ${player.partnerName})` : ''}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">Unassigned</span>
                              )}
                            </td>

                            {/* Wins +/- */}
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => adjustPlayerWins(player.id, -1)}
                                  className="h-6 w-6 rounded bg-gray-200 text-xs font-bold hover:bg-gray-300 transition"
                                  title="Remove 1 win"
                                >-</button>
                                <span className="w-6 text-center font-mono font-bold text-emerald-700 text-xs">{player.wins}</span>
                                <button
                                  type="button"
                                  onClick={() => adjustPlayerWins(player.id, 1)}
                                  className="h-6 w-6 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                                  title="Add 1 win"
                                >+</button>
                              </div>
                            </td>

                            {/* Losses +/- */}
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => adjustPlayerLosses(player.id, -1)}
                                  className="h-6 w-6 rounded bg-gray-200 text-xs font-bold hover:bg-gray-300 transition"
                                  title="Remove 1 loss"
                                >-</button>
                                <span className="w-6 text-center font-mono font-bold text-red-600 text-xs">{player.losses}</span>
                                <button
                                  type="button"
                                  onClick={() => adjustPlayerLosses(player.id, 1)}
                                  className="h-6 w-6 rounded bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                                  title="Add 1 loss"
                                >+</button>
                              </div>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                  player.status === 'in-match'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {player.status}
                              </span>
                            </td>

                            <td className="p-3">
                              <button
                                onClick={() => removePlayerFromAIQueue(player.id)}
                                className="text-rose-600 text-[10px] font-bold uppercase hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Player Form */}
              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
                <h3 className="font-serif text-xl text-[#1E5336] mb-4">Add Player to Queue</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addPlayerToAIQueue(
                      queuePlayerName.trim(),
                      'Pickleball',
                      queuePlayerWins,
                      queuePlayerLosses,
                      queueFixedPartner.trim() || undefined
                    )
                    setQueuePlayerName('')
                    setQueuePlayerWins(0)
                    setQueuePlayerLosses(0)
                    setQueueFixedPartner('')
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold uppercase text-[#6B756B] mb-1">Player Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={queuePlayerName}
                      onChange={(e) => setQueuePlayerName(e.target.value)}
                      className="w-full border border-[#222222]/20 p-2.5 bg-white outline-none focus:border-[#1E5336]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase text-[#6B756B] mb-1">Wins</label>
                      <input
                        type="number" min="0" value={queuePlayerWins}
                        onChange={(e) => setQueuePlayerWins(parseInt(e.target.value) || 0)}
                        className="w-full border border-[#222222]/20 p-2.5 bg-white outline-none focus:border-[#1E5336]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-[#6B756B] mb-1">Losses</label>
                      <input
                        type="number" min="0" value={queuePlayerLosses}
                        onChange={(e) => setQueuePlayerLosses(parseInt(e.target.value) || 0)}
                        className="w-full border border-[#222222]/20 p-2.5 bg-white outline-none focus:border-[#1E5336]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-[#6B756B] mb-1">Fixed Partner (optional)</label>
                    <input
                      type="text" placeholder="Partner name"
                      value={queueFixedPartner}
                      onChange={(e) => setQueueFixedPartner(e.target.value)}
                      className="w-full border border-[#222222]/20 p-2.5 bg-white outline-none focus:border-[#1E5336]"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#1E5336] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#153b26]">
                    Add to Queue
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Session Modal */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#222222]/20 bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <h3 className="font-serif text-2xl text-[#1E5336]">
                {editingSession ? 'Edit Open Play Schedule' : 'Create Open Play Session'}
              </h3>
              <button onClick={() => setIsAddSessionModalOpen(false)} className="font-bold text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#6B756B] mb-1">Assigned Court *</label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                >
                  <option value="Court 1">Court 1</option>
                  <option value="Court 2">Court 2</option>
                  <option value="Court 3">Court 3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 5:00 PM"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#6B756B] mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 8:00 PM"
                    className="w-full border border-[#222222]/20 p-2.5 bg-white text-[#222222] outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#F3F0EC] p-3 text-[#1E5336] font-bold text-xs">
                Sessions have <strong>unlimited player capacity</strong>. All registrations are confirmed automatically.
              </div>

              <div className="pt-4 border-t border-[#222222]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSessionModalOpen(false)}
                  className="border border-[#222222]/20 px-4 py-2 font-bold uppercase text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E5336] text-white px-5 py-2 font-bold uppercase tracking-wider hover:bg-[#153b26]"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
