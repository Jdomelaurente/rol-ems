'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import TournamentTabs from '@/components/tournament/TournamentTabs'
import { usePickleball } from '@/context/PickleballContext'
import { MiniMatch, AIQueuePlayer } from '@/lib/data'
import {
  Swords, Plus, Trophy, Zap, Clock, CheckCircle2,
  AlertCircle, Trash2, ArrowRight, Play, Users, Sparkles, Filter
} from 'lucide-react'

export default function MiniMatchesPage() {
  const {
    miniMatches,
    createMiniMatch,
    updateMiniMatch,
    deleteMiniMatch,
    completeMiniMatch,
    aiQueuePlayers,
  } = usePickleball()

  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form State
  const [court, setCourt] = useState('Court 1')
  const [team1Type, setTeam1Type] = useState<'pair' | 'custom'>('pair')
  const [team1PairNum, setTeam1PairNum] = useState<number | ''>('')
  const [team1P1, setTeam1P1] = useState('')
  const [team1P2, setTeam1P2] = useState('')

  const [team2Type, setTeam2Type] = useState<'pair' | 'custom'>('pair')
  const [team2PairNum, setTeam2PairNum] = useState<number | ''>('')
  const [team2P1, setTeam2P1] = useState('')
  const [team2P2, setTeam2P2] = useState('')

  // Identify all pairs in queue
  const availablePairs = useMemo(() => {
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
        label: `Pair #${pairNum}: ${players.map((p) => p.name).join(' & ')}`,
        p1: players[0]?.name || '',
        p2: players[1]?.name || '',
      }))
      .sort((a, b) => a.pairNumber - b.pairNumber)
  }, [aiQueuePlayers])

  const filteredMatches = useMemo(() => {
    if (filter === 'all') return miniMatches
    return miniMatches.filter((m) => m.status === filter)
  }, [miniMatches, filter])

  const liveCount = miniMatches.filter((m) => m.status === 'live').length
  const upcomingCount = miniMatches.filter((m) => m.status === 'upcoming').length
  const completedCount = miniMatches.filter((m) => m.status === 'completed').length

  // 1-Click Auto-Organize Next Match from Queue
  const handleAutoOrganizeNext = () => {
    const waitingPlayers = aiQueuePlayers.filter((p) => (p.status || 'waiting') === 'waiting')

    // Find 2 pairs or 4 waiting players
    let p1 = '', p2 = '', p3 = '', p4 = ''

    if (availablePairs.length >= 2) {
      p1 = availablePairs[0].p1
      p2 = availablePairs[0].p2
      p3 = availablePairs[1].p1
      p4 = availablePairs[1].p2
    } else if (waitingPlayers.length >= 4) {
      p1 = waitingPlayers[0].name
      p2 = waitingPlayers[1].name
      p3 = waitingPlayers[2].name
      p4 = waitingPlayers[3].name
    } else if (waitingPlayers.length >= 2) {
      p1 = waitingPlayers[0].name
      p2 = waitingPlayers[1].name
      p3 = 'Challenger'
    } else {
      alert('Not enough waiting players in Pickle Queue to auto-organize a match. Add players first!')
      return
    }

    // Assign to next court
    const courtOptions = ['Court 1', 'Court 2', 'Court 3']
    const assignedCourt = courtOptions[miniMatches.length % 3]

    createMiniMatch({
      sport: 'Pickleball',
      court: assignedCourt,
      player1: p1,
      player2: p2,
      player3: p3,
      player4: p4 || undefined,
      score1: 0,
      score2: 0,
      status: 'live',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let p1 = team1P1, p2 = team1P2, p3 = team2P1, p4 = team2P2

    if (team1Type === 'pair' && team1PairNum) {
      const found = availablePairs.find((p) => p.pairNumber === Number(team1PairNum))
      if (found) {
        p1 = found.p1
        p2 = found.p2
      }
    }

    if (team2Type === 'pair' && team2PairNum) {
      const found = availablePairs.find((p) => p.pairNumber === Number(team2PairNum))
      if (found) {
        p3 = found.p1
        p4 = found.p2
      }
    }

    if (!p1 || !p3) {
      alert('Please configure both teams with at least 1 player.')
      return
    }

    createMiniMatch({
      sport: 'Pickleball',
      court,
      player1: p1,
      player2: p2,
      player3: p3,
      player4: p4 || undefined,
      score1: 0,
      score2: 0,
      status: 'upcoming',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })

    setIsCreateModalOpen(false)
    setTeam1P1('')
    setTeam1P2('')
    setTeam2P1('')
    setTeam2P2('')
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
                Fast Play & Court Matchups
              </p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336] sm:text-5xl">
                Mini Matches
              </h1>
              <p className="mt-1.5 text-xs text-[#6B756B] max-w-2xl">
                Organize short pickleball games directly from Pickle Queue, assign courts, track live game scores, and log results.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">
                {liveCount} Live
              </span>
              <span className="rounded-md border border-amber-500/30 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
                {upcomingCount} Upcoming
              </span>
              <span className="rounded-md border border-slate-400/30 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">
                {completedCount} Completed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Tournament Navigation Submenu Tabs */}
      <TournamentTabs currentTab="mini-matches" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#222222]/10 bg-[#FDFBF7] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoOrganizeNext}
              className="flex items-center gap-1.5 rounded-md bg-[#E1A728] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:bg-[#c9921b] transition shadow-xs"
            >
              <Zap size={14} /> Auto-Organize Next Match
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#1E5336] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
            >
              <Plus size={14} /> Custom Match
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-md border border-[#222222]/20 bg-white p-0.5 text-xs font-bold">
            {(['all', 'live', 'upcoming', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded px-3 py-1.5 uppercase tracking-wider transition ${
                  filter === tab
                    ? 'bg-[#1E5336] text-white'
                    : 'text-[#6B756B] hover:text-[#222222]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Matches Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
            <h2 className="font-serif text-2xl text-[#1E5336]">
              {filter.toUpperCase()} Mini Matches ({filteredMatches.length})
            </h2>
            <span className="text-xs text-[#6B756B]">Target: 11 Points · Win by 2</span>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] py-16 text-center text-[#6B756B]">
              <Swords size={36} className="mx-auto text-[#E1A728] mb-2" />
              <p className="text-sm font-bold">No {filter !== 'all' ? filter : ''} mini matches recorded.</p>
              <p className="text-xs text-[#6B756B] mt-1">
                Click "Auto-Organize Next Match" or "Custom Match" to launch a game.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((match) => {
                const isLive = match.status === 'live'
                const isUpcoming = match.status === 'upcoming'
                const isCompleted = match.status === 'completed'
                const team1Won = isCompleted && match.score1 > match.score2
                const team2Won = isCompleted && match.score2 > match.score1

                return (
                  <div
                    key={match.id}
                    className={`flex flex-col justify-between rounded-xl border bg-[#FDFBF7] p-5 shadow-sm transition-all ${
                      isLive
                        ? 'border-emerald-600/50 ring-2 ring-emerald-500/10'
                        : isUpcoming
                        ? 'border-amber-500/40'
                        : 'border-[#222222]/15 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Match Header */}
                      <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#1E5336] px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                            {match.court}
                          </span>
                          <span className="text-[10px] text-[#6B756B]">{match.time}</span>
                        </div>

                        <span
                          className={`rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isUpcoming
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-200 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {isLive ? '● Live In Play' : match.status}
                        </span>
                      </div>

                      {/* Scoreboard Block */}
                      <div className="space-y-3 my-4">
                        {/* Team 1 */}
                        <div
                          className={`flex items-center justify-between rounded-lg p-3 border transition ${
                            team1Won
                              ? 'bg-emerald-50 border-emerald-400 font-bold'
                              : 'bg-white border-[#222222]/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {team1Won && <Trophy size={14} className="text-[#E1A728]" />}
                              <p className="font-bold text-xs text-[#222222]">
                                {match.player1} {match.player2 && `& ${match.player2}`}
                              </p>
                            </div>
                            <p className="text-[10px] text-[#6B756B]">Team A</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLive && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMiniMatch(match.id, {
                                      score1: Math.max(0, match.score1 - 1),
                                    })
                                  }
                                  className="h-6 w-6 rounded border border-[#222222]/20 bg-[#F3F0EC] text-xs font-bold text-[#6B756B] hover:bg-[#222222]/10"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMiniMatch(match.id, { score1: match.score1 + 1 })
                                  }
                                  className="h-6 w-6 rounded border border-[#1E5336]/30 bg-[#1E5336]/10 text-xs font-bold text-[#1E5336] hover:bg-[#1E5336] hover:text-white"
                                >
                                  +
                                </button>
                              </div>
                            )}
                            <span className="font-mono text-2xl font-black text-[#1E5336]">
                              {match.score1}
                            </span>
                          </div>
                        </div>

                        {/* VS Divider */}
                        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-[#6B756B]">
                          vs
                        </div>

                        {/* Team 2 */}
                        <div
                          className={`flex items-center justify-between rounded-lg p-3 border transition ${
                            team2Won
                              ? 'bg-emerald-50 border-emerald-400 font-bold'
                              : 'bg-white border-[#222222]/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {team2Won && <Trophy size={14} className="text-[#E1A728]" />}
                              <p className="font-bold text-xs text-[#222222]">
                                {match.player3} {match.player4 && `& ${match.player4}`}
                              </p>
                            </div>
                            <p className="text-[10px] text-[#6B756B]">Team B</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLive && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMiniMatch(match.id, {
                                      score2: Math.max(0, match.score2 - 1),
                                    })
                                  }
                                  className="h-6 w-6 rounded border border-[#222222]/20 bg-[#F3F0EC] text-xs font-bold text-[#6B756B] hover:bg-[#222222]/10"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMiniMatch(match.id, { score2: match.score2 + 1 })
                                  }
                                  className="h-6 w-6 rounded border border-[#1E5336]/30 bg-[#1E5336]/10 text-xs font-bold text-[#1E5336] hover:bg-[#1E5336] hover:text-white"
                                >
                                  +
                                </button>
                              </div>
                            )}
                            <span className="font-mono text-2xl font-black text-[#1E5336]">
                              {match.score2}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-[#222222]/10 pt-3 flex items-center justify-between gap-2">
                      {isUpcoming && (
                        <button
                          type="button"
                          onClick={() => updateMiniMatch(match.id, { status: 'live' })}
                          className="flex-1 rounded-md bg-[#1E5336] py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
                        >
                          Start Live Match
                        </button>
                      )}

                      {isLive && (
                        <button
                          type="button"
                          onClick={() => {
                            if (match.score1 === match.score2) {
                              alert('Cannot end match in a tie! One team must win.')
                              return
                            }
                            completeMiniMatch(match.id, match.score1, match.score2)
                          }}
                          className="flex-1 rounded-md bg-[#E1A728] py-2 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:bg-[#c9921b] transition shadow-xs"
                        >
                          Finish & Log Result
                        </button>
                      )}

                      {isCompleted && (
                        <span className="flex-1 text-center py-2 text-xs font-semibold text-[#6B756B]">
                          Logged to Queue Stats
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this mini match record?')) {
                            deleteMiniMatch(match.id)
                          }
                        }}
                        className="rounded p-2 text-[#6B756B] hover:text-rose-600 transition"
                        title="Delete Match"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Mini Match Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-2xl">
            <h3 className="font-serif text-2xl text-[#1E5336]">Configure Mini Match</h3>
            <p className="text-xs text-[#6B756B] mt-0.5 mb-4">
              Set court assignment and select teams from the Pickle Queue.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Court Assignment *
                </label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-2.5 outline-none focus:border-[#1E5336]"
                >
                  <option value="Court 1">Court 1</option>
                  <option value="Court 2">Court 2</option>
                  <option value="Court 3">Court 3</option>
                </select>
              </div>

              {/* Team 1 Configuration */}
              <div className="rounded-lg border border-[#222222]/15 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1E5336]">Team A</span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setTeam1Type('pair')}
                      className={`font-semibold ${team1Type === 'pair' ? 'text-[#1E5336] underline font-bold' : 'text-[#6B756B]'}`}
                    >
                      From Pair
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeam1Type('custom')}
                      className={`font-semibold ${team1Type === 'custom' ? 'text-[#1E5336] underline font-bold' : 'text-[#6B756B]'}`}
                    >
                      Individual
                    </button>
                  </div>
                </div>

                {team1Type === 'pair' ? (
                  <select
                    value={team1PairNum}
                    onChange={(e) => setTeam1PairNum(Number(e.target.value) || '')}
                    className="w-full rounded border border-[#222222]/20 p-2 text-xs"
                  >
                    <option value="">Select a pair from queue...</option>
                    {availablePairs.map((p) => (
                      <option key={p.pairNumber} value={p.pairNumber}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Player 1"
                      value={team1P1}
                      onChange={(e) => setTeam1P1(e.target.value)}
                      className="rounded border border-[#222222]/20 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Player 2 (Optional)"
                      value={team1P2}
                      onChange={(e) => setTeam1P2(e.target.value)}
                      className="rounded border border-[#222222]/20 p-2 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Team 2 Configuration */}
              <div className="rounded-lg border border-[#222222]/15 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1E5336]">Team B</span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setTeam2Type('pair')}
                      className={`font-semibold ${team2Type === 'pair' ? 'text-[#1E5336] underline font-bold' : 'text-[#6B756B]'}`}
                    >
                      From Pair
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeam2Type('custom')}
                      className={`font-semibold ${team2Type === 'custom' ? 'text-[#1E5336] underline font-bold' : 'text-[#6B756B]'}`}
                    >
                      Individual
                    </button>
                  </div>
                </div>

                {team2Type === 'pair' ? (
                  <select
                    value={team2PairNum}
                    onChange={(e) => setTeam2PairNum(Number(e.target.value) || '')}
                    className="w-full rounded border border-[#222222]/20 p-2 text-xs"
                  >
                    <option value="">Select a pair from queue...</option>
                    {availablePairs.map((p) => (
                      <option key={p.pairNumber} value={p.pairNumber}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Player 3"
                      value={team2P1}
                      onChange={(e) => setTeam2P1(e.target.value)}
                      className="rounded border border-[#222222]/20 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Player 4 (Optional)"
                      value={team2P2}
                      onChange={(e) => setTeam2P2(e.target.value)}
                      className="rounded border border-[#222222]/20 p-2 text-xs"
                    />
                  </div>
                )}
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
                  Schedule Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
