'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import TournamentTabs from '@/components/tournament/TournamentTabs'
import { usePickleball } from '@/context/PickleballContext'
import { AIQueuePlayer } from '@/lib/data'
import {
  ListOrdered, Plus, ArrowUp, ArrowDown, Trash2, Shuffle,
  RotateCw, Swords, Users, Sparkles, CheckCircle2, Clock,
  Search, Filter, ShieldCheck, Flame
} from 'lucide-react'

export default function PickleQueuePage() {
  const {
    aiQueuePlayers,
    addPlayerToAIQueue,
    removePlayerFromAIQueue,
    updateQueuePlayerStatus,
    moveQueuePlayer,
    rotateAIQueue,
    generateRandomPairs,
    generateAIQueue,
  } = usePickleball()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'playing' | 'completed'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New Player Form State
  const [name, setName] = useState('')
  const [points, setPoints] = useState(50)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [fixedPartner, setFixedPartner] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'Pay at Counter' | 'GCash' | 'Maya'>('Pay at Counter')

  // Filtered Queue
  const filteredPlayers = useMemo(() => {
    return aiQueuePlayers.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const pStatus = p.status || 'waiting'
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'waiting'
          ? pStatus === 'waiting' || pStatus === 'in-match'
          : pStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [aiQueuePlayers, searchTerm, statusFilter])

  // Next Scheduled to Play (Next Up / On Deck)
  const nextPlayers = useMemo(() => {
    const waitingList = aiQueuePlayers.filter((p) => (p.status || 'waiting') === 'waiting')
    // Check if waiting players belong to pairs
    const pairsGroup = new Map<number, AIQueuePlayer[]>()
    waitingList.forEach((p) => {
      if (p.pairNumber) {
        const arr = pairsGroup.get(p.pairNumber) || []
        arr.push(p)
        pairsGroup.set(p.pairNumber, arr)
      }
    })

    if (pairsGroup.size >= 2) {
      const keys = Array.from(pairsGroup.keys()).sort((a, b) => a - b)
      const p1 = pairsGroup.get(keys[0]) || []
      const p2 = pairsGroup.get(keys[1]) || []
      return [...p1, ...p2]
    }
    return waitingList.slice(0, 4)
  }, [aiQueuePlayers])

  const waitingCount = aiQueuePlayers.filter((p) => (p.status || 'waiting') === 'waiting').length
  const playingCount = aiQueuePlayers.filter((p) => p.status === 'playing' || p.status === 'in-match').length
  const completedCount = aiQueuePlayers.filter((p) => p.status === 'completed').length

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addPlayerToAIQueue(
      name.trim(),
      'Pickleball',
      wins,
      losses,
      points,
      fixedPartner.trim() || undefined,
      undefined,
      paymentMethod
    )

    setName('')
    setPoints(50)
    setWins(0)
    setLosses(0)
    setFixedPartner('')
    setIsAddModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#E1A728]">
                Rotational Order of Play
              </p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336] sm:text-5xl">
                Pickle Queue
              </h1>
              <p className="mt-1.5 text-xs text-[#6B756B] max-w-2xl">
                Real-time queue tracking player order of play, team pair assignments, and match status.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-amber-500/30 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
                {waitingCount} Waiting
              </span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">
                {playingCount} Playing
              </span>
              <span className="rounded-md border border-slate-400/30 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">
                {completedCount} Completed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Tournament Navigation Submenu Tabs */}
      <TournamentTabs currentTab="queue" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* =========================================================================
            NEXT PLAYERS SCHEDULED TO PLAY (ON DECK SPOTLIGHT)
            ========================================================================= */}
        {nextPlayers.length > 0 && (
          <div className="rounded-xl border-2 border-[#E1A728] bg-linear-to-r from-[#FDFBF7] to-[#F7F3E9] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1A728]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-[#E1A728] animate-ping" />
                <span className="text-xs uppercase tracking-[0.18em] font-black text-[#1E5336]">
                  On Deck · Next Scheduled to Play
                </span>
              </div>
              <Link
                href="/pickleball/tournament/mini-matches"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1E5336] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
              >
                <Swords size={13} />
                Send to Mini Match
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nextPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 rounded-lg border border-[#E1A728]/40 bg-white p-3 shadow-xs"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E5336] text-sm font-black text-[#FDFBF7]">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#222222]">{player.name}</p>
                    <p className="text-[10px] text-[#6B756B]">
                      {player.pairNumber ? `Pair #${player.pairNumber}` : 'Unpaired'} · {player.points || 0} pts
                    </p>
                  </div>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                    Next Up
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ADMIN / STAFF ACTION TOOLBAR
            ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#222222]/10 bg-[#FDFBF7] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#1E5336] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
            >
              <Plus size={14} /> Add Player
            </button>

            <button
              type="button"
              onClick={() => rotateAIQueue('Pickleball')}
              className="flex items-center gap-1.5 rounded-md border border-[#222222]/20 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#6B756B] hover:text-[#1E5336] hover:border-[#1E5336] transition"
              title="Rotates the queue order"
            >
              <RotateCw size={14} /> Rotate Queue
            </button>

            <button
              type="button"
              onClick={() => generateRandomPairs('Pickleball')}
              className="flex items-center gap-1.5 rounded-md border border-[#222222]/20 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#6B756B] hover:text-[#1E5336] hover:border-[#1E5336] transition"
              title="Pair up waiting players"
            >
              <Shuffle size={14} /> Pair Players
            </button>

            {aiQueuePlayers.length === 0 && (
              <button
                type="button"
                onClick={() => generateAIQueue('Pickleball')}
                className="flex items-center gap-1.5 rounded-md border border-[#E1A728] bg-[#E1A728]/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:bg-[#E1A728]/20 transition"
              >
                <Sparkles size={14} /> Auto-Fill Queue
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B756B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search player name..."
                className="rounded-md border border-[#222222]/20 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#1E5336]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border border-[#222222]/20 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#1E5336]"
            >
              <option value="all">All Statuses ({aiQueuePlayers.length})</option>
              <option value="waiting">Waiting ({waitingCount})</option>
              <option value="playing">Playing ({playingCount})</option>
              <option value="completed">Completed ({completedCount})</option>
            </select>
          </div>
        </div>

        {/* =========================================================================
            PICKLE QUEUE TABLE
            ========================================================================= */}
        <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-5 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
            <h2 className="font-serif text-2xl text-[#1E5336]">
              Queue Order of Play ({filteredPlayers.length})
            </h2>
            <span className="text-[11px] text-[#6B756B]">
              Use order controls to adjust position
            </span>
          </div>

          {filteredPlayers.length === 0 ? (
            <div className="py-16 text-center text-[#6B756B]">
              <Users size={36} className="mx-auto text-[#E1A728] mb-2" />
              <p className="text-sm font-bold">No players found in queue.</p>
              <p className="text-xs text-[#6B756B] mt-1">
                Add players using the toolbar above or click Auto-Fill Queue.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222]/15 text-[10px] uppercase tracking-wider font-black text-[#6B756B]">
                    <th className="py-3 px-2 w-12 text-center">Pos</th>
                    <th className="py-3 px-3">Player Name</th>
                    <th className="py-3 px-3">Team / Pair Assignment</th>
                    <th className="py-3 px-3">Skill & Record</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-2 text-center">Order Controls</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10 font-medium">
                  {filteredPlayers.map((player, idx) => {
                    const originalIdx = aiQueuePlayers.findIndex((p) => p.id === player.id)
                    const status = player.status || 'waiting'

                    return (
                      <tr
                        key={player.id}
                        className={`transition hover:bg-black/2 ${
                          idx < 4 && status === 'waiting' ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Queue Position */}
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              originalIdx < 2
                                ? 'bg-[#E1A728] text-[#1E5336]'
                                : originalIdx < 4
                                ? 'bg-[#1E5336] text-[#FDFBF7]'
                                : 'bg-[#222222]/10 text-[#6B756B]'
                            }`}
                          >
                            {originalIdx + 1}
                          </span>
                        </td>

                        {/* Player Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E5336]/10 text-xs font-bold text-[#1E5336]">
                              {player.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#222222]">{player.name}</p>
                              {player.paymentMethod && (
                                <p className="text-[9px] text-[#6B756B]">{player.paymentMethod}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Team / Pair Assignment */}
                        <td className="py-3 px-3">
                          {player.pairNumber ? (
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#1E5336]/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#1E5336]">
                              Pair #{player.pairNumber}
                              {player.partnerName && (
                                <span className="text-[#6B756B] font-normal">
                                  w/ {player.partnerName}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B756B] italic">Unpaired</span>
                          )}
                        </td>

                        {/* Skill & Record */}
                        <td className="py-3 px-3">
                          <div className="font-mono text-[11px]">
                            <span className="font-bold text-[#1E5336]">{player.points || 0} pts</span>
                            <span className="mx-1 text-[#6B756B]">·</span>
                            <span className="font-semibold text-emerald-700">{player.wins}W</span>
                            <span className="mx-0.5 text-[#6B756B]">-</span>
                            <span className="font-semibold text-rose-700">{player.losses}L</span>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3 px-3">
                          <select
                            value={status}
                            onChange={(e) => updateQueuePlayerStatus(player.id, e.target.value as any)}
                            className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none border cursor-pointer ${
                              status === 'playing' || status === 'in-match'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : status === 'waiting'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            <option value="waiting">Waiting</option>
                            <option value="playing">Playing</option>
                            <option value="completed">Completed</option>
                            <option value="resting">Resting</option>
                          </select>
                        </td>

                        {/* Order Controls (Move Up / Down) */}
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex rounded border border-[#222222]/15 bg-white shadow-xs">
                            <button
                              type="button"
                              disabled={originalIdx === 0}
                              onClick={() => moveQueuePlayer(player.id, 'up')}
                              className="p-1 text-[#6B756B] hover:text-[#1E5336] disabled:opacity-30 transition border-r border-[#222222]/10"
                              title="Move Up in Queue"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={originalIdx === aiQueuePlayers.length - 1}
                              onClick={() => moveQueuePlayer(player.id, 'down')}
                              className="p-1 text-[#6B756B] hover:text-[#1E5336] disabled:opacity-30 transition"
                              title="Move Down in Queue"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${player.name} from Pickle Queue?`)) {
                                removePlayerFromAIQueue(player.id)
                              }
                            }}
                            className="rounded p-1 text-[#6B756B] hover:text-rose-600 transition"
                            title="Remove player"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Player to Queue Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-2xl">
            <h3 className="font-serif text-2xl text-[#1E5336]">Add Player to Pickle Queue</h3>
            <p className="text-xs text-[#6B756B] mt-0.5 mb-4">
              Player will be entered at the next available position in rotation.
            </p>

            <form onSubmit={handleAddPlayer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Player Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                    Wins
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wins}
                    onChange={(e) => setWins(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                    Losses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={losses}
                    onChange={(e) => setLosses(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Fixed Partner (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Partner name if pre-paired"
                  value={fixedPartner}
                  onChange={(e) => setFixedPartner(e.target.value)}
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                >
                  <option value="Pay at Counter">Pay at Counter</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-md border border-[#222222]/20 py-2.5 text-xs font-semibold text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-[#1E5336] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27]"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
