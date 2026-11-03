'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import TournamentTabs from '@/components/tournament/TournamentTabs'
import { usePickleball } from '@/context/PickleballContext'
import { AIQueuePlayer } from '@/lib/data'
import {
  Users2, Plus, Shuffle, Unlink, Swords, Trophy,
  Sparkles, CheckCircle2, ShieldCheck, Flame, Search
} from 'lucide-react'

export default function PairsManagementPage() {
  const {
    aiQueuePlayers,
    assignPairToPlayers,
    unassignPair,
    generateRandomPairs,
    addPlayerToAIQueue,
  } = usePickleball()

  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPlayer1Id, setSelectedPlayer1Id] = useState('')
  const [selectedPlayer2Id, setSelectedPlayer2Id] = useState('')
  const [customPairName, setCustomPairName] = useState('')

  // Identify all paired groups
  const pairedGroups = useMemo(() => {
    const map = new Map<number, AIQueuePlayer[]>()
    aiQueuePlayers.forEach((p) => {
      if (p.pairNumber) {
        const arr = map.get(p.pairNumber) || []
        arr.push(p)
        map.set(p.pairNumber, arr)
      }
    })
    return Array.from(map.entries())
      .map(([pairNum, players]) => ({
        pairNumber: pairNum,
        players,
        p1: players[0],
        p2: players[1] || null,
        combinedWins: players.reduce((acc, p) => acc + p.wins, 0),
        combinedLosses: players.reduce((acc, p) => acc + p.losses, 0),
        combinedPoints: players.reduce((acc, p) => acc + (p.points || 0), 0),
      }))
      .sort((a, b) => a.pairNumber - b.pairNumber)
  }, [aiQueuePlayers])

  // Unpaired players
  const unpairedPlayers = useMemo(() => {
    return aiQueuePlayers.filter((p) => !p.pairNumber)
  }, [aiQueuePlayers])

  // Filtered pairs
  const filteredPairs = useMemo(() => {
    if (!searchTerm.trim()) return pairedGroups
    const term = searchTerm.toLowerCase()
    return pairedGroups.filter(
      (pg) =>
        pg.players.some((p) => p.name.toLowerCase().includes(term)) ||
        (customPairName && customPairName.toLowerCase().includes(term))
    )
  }, [pairedGroups, searchTerm, customPairName])

  const handleCreatePair = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlayer1Id || !selectedPlayer2Id || selectedPlayer1Id === selectedPlayer2Id) {
      alert('Please select two distinct players to form a pair.')
      return
    }

    assignPairToPlayers(selectedPlayer1Id, selectedPlayer2Id)
    setIsCreateModalOpen(false)
    setSelectedPlayer1Id('')
    setSelectedPlayer2Id('')
    setCustomPairName('')
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
                Team & Doubles Coordination
              </p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336] sm:text-5xl">
                Pairs Management
              </h1>
              <p className="mt-1.5 text-xs text-[#6B756B] max-w-2xl">
                Organize doubles partners, custom teams, and pair rotations for tournament brackets and mini matches.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">
                {pairedGroups.length} Active Pairs
              </span>
              <span className="rounded-md border border-amber-500/30 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
                {unpairedPlayers.length} Unpaired Players
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Tournament Navigation Submenu Tabs */}
      <TournamentTabs currentTab="pairs" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#222222]/10 bg-[#FDFBF7] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#1E5336] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
            >
              <Plus size={14} /> Create Pair
            </button>

            <button
              type="button"
              onClick={() => generateRandomPairs('Pickleball')}
              className="flex items-center gap-1.5 rounded-md border border-[#222222]/20 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#6B756B] hover:text-[#1E5336] hover:border-[#1E5336] transition"
            >
              <Shuffle size={14} /> Auto-Generate Random Pairs
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B756B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pairs or players..."
              className="rounded-md border border-[#222222]/20 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#1E5336]"
            />
          </div>
        </div>

        {/* Active Pairs Grid */}
        <div>
          <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-6">
            <h2 className="font-serif text-2xl text-[#1E5336]">
              Registered Doubles Pairs ({filteredPairs.length})
            </h2>
            <span className="text-xs text-[#6B756B]">
              Ready for Mini Matches & Tournament Brackets
            </span>
          </div>

          {filteredPairs.length === 0 ? (
            <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] py-16 text-center text-[#6B756B]">
              <Users2 size={36} className="mx-auto text-[#E1A728] mb-2" />
              <p className="text-sm font-bold">No pairs formed yet.</p>
              <p className="text-xs text-[#6B756B] mt-1">
                Click "Create Pair" or "Auto-Generate Random Pairs" to assign partners.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPairs.map((pair) => (
                <div
                  key={pair.pairNumber}
                  className="flex flex-col justify-between rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm transition hover:shadow-md hover:border-[#1E5336]/40"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2.5 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#1E5336]">
                        <Users2 size={14} className="text-[#E1A728]" />
                        Pair #{pair.pairNumber}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                        {pair.players.every((p) => p.status === 'playing') ? 'In Match' : 'Active'}
                      </span>
                    </div>

                    {/* Both Players Cards */}
                    <div className="space-y-2 mb-4">
                      {pair.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-[#222222]/10 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E5336]/10 font-bold text-[#1E5336]">
                              {player.name.charAt(0)}
                            </div>
                            <span className="font-bold text-[#222222]">{player.name}</span>
                          </div>
                          <span className="font-mono text-[11px] text-[#6B756B]">
                            {player.wins}W - {player.losses}L
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between border-t border-[#222222]/10 pt-2.5 text-xs text-[#6B756B]">
                      <span>Combined Record:</span>
                      <span className="font-mono font-bold text-[#1E5336]">
                        {pair.combinedWins}W – {pair.combinedLosses}L ({pair.combinedPoints} pts)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-[#222222]/10 pt-3 mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Break up Pair #${pair.pairNumber}?`)) {
                          unassignPair(pair.p1.id)
                        }
                      }}
                      className="flex-1 rounded border border-[#222222]/20 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-50 transition"
                    >
                      Unpair
                    </button>
                    <Link
                      href="/pickleball/tournament/mini-matches"
                      className="flex-1 rounded bg-[#1E5336] py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
                    >
                      Match Court
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unpaired Players Pool */}
        {unpairedPlayers.length > 0 && (
          <div className="rounded-xl border border-[#222222]/15 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl text-[#1E5336] mb-1">
              Unpaired Players Available ({unpairedPlayers.length})
            </h3>
            <p className="text-xs text-[#6B756B] mb-4">
              These players in Pickle Queue are waiting for a doubles partner.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {unpairedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-[#222222]/15 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-[#222222]">{player.name}</p>
                    <p className="text-[10px] text-[#6B756B]">
                      {player.points || 0} pts · {player.wins}W - {player.losses}L
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlayer1Id(player.id)
                      setIsCreateModalOpen(true)
                    }}
                    className="rounded bg-[#1E5336]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#1E5336] hover:bg-[#1E5336] hover:text-white transition"
                  >
                    Pair Up
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Pair Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-2xl">
            <h3 className="font-serif text-2xl text-[#1E5336]">Create Doubles Pair</h3>
            <p className="text-xs text-[#6B756B] mt-0.5 mb-4">
              Select two players from the Pickle Queue to form a partnership.
            </p>

            <form onSubmit={handleCreatePair} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Player 1 *
                </label>
                <select
                  required
                  value={selectedPlayer1Id}
                  onChange={(e) => setSelectedPlayer1Id(e.target.value)}
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                >
                  <option value="">Select first player...</option>
                  {aiQueuePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.pairNumber ? `(Currently Pair #${p.pairNumber})` : '(Unpaired)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Player 2 *
                </label>
                <select
                  required
                  value={selectedPlayer2Id}
                  onChange={(e) => setSelectedPlayer2Id(e.target.value)}
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                >
                  <option value="">Select second player...</option>
                  {aiQueuePlayers
                    .filter((p) => p.id !== selectedPlayer1Id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.pairNumber ? `(Currently Pair #${p.pairNumber})` : '(Unpaired)'}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-md border border-[#222222]/20 py-2.5 text-xs font-semibold text-[#6B756B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-[#1E5336] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27]"
                >
                  Confirm Pair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
