'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { BracketMatch, TournamentBracketFormat } from '@/lib/data'
import { Trophy, ArrowLeft, Award, Clock, MapPin, Users, RefreshCw, Edit3, Check } from 'lucide-react'

export default function TournamentBracketPage() {
  const { tournaments, bracketMatches, updateMatchScore, updateMatchTeams } = usePickleball()
  const activeTournament = tournaments[0] || tournaments[0]
  const isTeamEvent = activeTournament?.format === 'team-event'

  const [activeFormatTab, setActiveFormatTab] = useState<TournamentBracketFormat>('single-elimination')

  // Editing state for score input modal
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null)
  const [score1Input, setScore1Input] = useState(0)
  const [score2Input, setScore2Input] = useState(0)
  const [winnerInput, setWinnerInput] = useState('')

  const matches = bracketMatches.filter((m) => !m.tournamentId || m.tournamentId === activeTournament?.id)

  const qfMatches = matches.filter((m) => m.round === 'QF' || m.round === 'R1')
  const sfMatches = matches.filter((m) => m.round === 'SF')
  const finalMatch = matches.find((m) => m.round === 'Final')

  const handleOpenScoreEdit = (m: BracketMatch) => {
    setEditingMatch(m)
    setScore1Input(m.score1 || 0)
    setScore2Input(m.score2 || 0)
    setWinnerInput(m.winner || m.team1)
  }

  const handleSaveMatchScore = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMatch) return
    updateMatchScore(editingMatch.id, score1Input, score2Input, winnerInput)
    setEditingMatch(null)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#111827] pb-16">
      {/* Header Banner */}
      <div className="bg-[#1E5336] px-4 py-10 sm:px-6 text-white shadow-xl">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E1A728] hover:underline mb-4"
          >
            <ArrowLeft size={14} /> Back to Tournaments Overview
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#E1A728]">
                  Interactive Bracket Visualization & Editor
                </span>
                <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 uppercase rounded">
                  {isTeamEvent ? 'Team Event (Club)' : 'Pairing Tournament'}
                </span>
              </div>
              <h1 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
                {activeTournament?.name}
              </h1>
            </div>

            {/* Bracket Format Switcher Tabs */}
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/10 p-2 border border-white/20">
              {[
                { id: 'single-elimination', label: 'Single Elim' },
                { id: 'double-elimination', label: 'Double Elim' },
                { id: 'round-robin', label: 'Round Robin' },
                { id: 'group-stage', label: 'Group Stage' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setActiveFormatTab(fmt.id as any)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    activeFormatTab === fmt.id
                      ? 'bg-[#E1A728] text-[#111827] shadow font-extrabold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Canvas Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-blue-800">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" /> Live / In Progress
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Scheduled
            </span>
          </div>
          <span className="text-xs text-[#6B756B]">Active Format: <strong className="text-[#1E5336] uppercase">{activeFormatTab}</strong></span>
        </div>

        {/* Live Champion Banner */}
        {activeTournament?.championPairName && (
          <div className="mb-8 border-2 border-[#E1A728] bg-[#FDF6E7] p-6 text-center shadow-md rounded-2xl">
            <Award size={44} className="mx-auto text-[#E1A728] mb-1 animate-bounce" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C48E1A] block">
              2026 OFFICIAL CHAMPION
            </span>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[#111827]">{activeTournament.championPairName}</h2>
          </div>
        )}

        {/* ROUND ROBIN / GROUP STAGE ALTERNATIVE VIEW */}
        {activeFormatTab === 'round-robin' || activeFormatTab === 'group-stage' ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#1E5336]">
              {activeFormatTab === 'round-robin' ? 'Round Robin Points Matrix' : 'Group Stage Standings & Playoffs'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-[10px] font-extrabold uppercase text-[#E1A728]">
                  <tr>
                    <th className="p-3">Team / Pair</th>
                    <th className="p-3">Played</th>
                    <th className="p-3">Won</th>
                    <th className="p-3">Lost</th>
                    <th className="p-3">Points Diff</th>
                    <th className="p-3">Total Points</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold">Maria Santos & Juan Rivera</td>
                    <td className="p-3">3</td>
                    <td className="p-3 text-emerald-700 font-bold">3</td>
                    <td className="p-3 text-red-600">0</td>
                    <td className="p-3">+18</td>
                    <td className="p-3 font-bold text-[#1E5336]">9 PTS</td>
                    <td className="p-3"><span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">Advanced to Playoff</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Carlo Delos Santos & Jenny Aquino</td>
                    <td className="p-3">3</td>
                    <td className="p-3 text-emerald-700 font-bold">2</td>
                    <td className="p-3 text-red-600">1</td>
                    <td className="p-3">+8</td>
                    <td className="p-3 font-bold text-[#1E5336]">6 PTS</td>
                    <td className="p-3"><span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">Advanced to Playoff</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Smash Duo (Mike & Lisa)</td>
                    <td className="p-3">3</td>
                    <td className="p-3 text-emerald-700 font-bold">1</td>
                    <td className="p-3 text-red-600">2</td>
                    <td className="p-3">-4</td>
                    <td className="p-3 font-bold text-[#1E5336]">3 PTS</td>
                    <td className="p-3"><span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-600">Group Stage</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SINGLE / DOUBLE ELIMINATION KNOCKOUT TREE */
          <div className="overflow-x-auto pb-8 pt-4">
            <div className="min-w-[950px] flex items-start justify-between gap-8 px-2">
              {/* QUARTERFINALS */}
              <div className="flex-1 space-y-6">
                <h3 className="text-center text-xs font-bold uppercase tracking-wider text-[#1E5336] bg-white py-2.5 rounded-lg border border-gray-200 shadow-sm">
                  Quarterfinals
                </h3>
                <div className="space-y-6">
                  {qfMatches.map((m) => (
                    <InteractiveMatchCard key={m.id} match={m} onEdit={handleOpenScoreEdit} />
                  ))}
                </div>
              </div>

              {/* SEMIFINALS */}
              <div className="flex-1 space-y-6">
                <h3 className="text-center text-xs font-bold uppercase tracking-wider text-[#1E5336] bg-white py-2.5 rounded-lg border border-gray-200 shadow-sm">
                  Semifinals
                </h3>
                <div className="space-y-16 py-8">
                  {sfMatches.map((m) => (
                    <InteractiveMatchCard key={m.id} match={m} onEdit={handleOpenScoreEdit} />
                  ))}
                </div>
              </div>

              {/* FINALS */}
              <div className="flex-1 space-y-6">
                <h3 className="text-center text-xs font-bold uppercase tracking-wider text-[#E1A728] bg-[#1E5336] text-white py-2.5 rounded-lg shadow-sm">
                  Finals
                </h3>
                <div className="py-16 space-y-8">
                  {finalMatch && <InteractiveMatchCard match={finalMatch} isFinal onEdit={handleOpenScoreEdit} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Edit Modal */}
        {editingMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#1E5336]">Update Bracket Score</h3>
                <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-black">✕</button>
              </div>

              <form onSubmit={handleSaveMatchScore} className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl bg-[#F3F0EC] p-3 font-semibold text-[#111827]">
                  {editingMatch.team1} VS {editingMatch.team2}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#111827]">{editingMatch.team1} Score</label>
                    <input
                      type="number"
                      value={score1Input}
                      onChange={(e) => setScore1Input(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-base font-bold focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#111827]">{editingMatch.team2} Score</label>
                    <input
                      type="number"
                      value={score2Input}
                      onChange={(e) => setScore2Input(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-base font-bold focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Declare Winner</label>
                  <select
                    value={winnerInput}
                    onChange={(e) => setWinnerInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 font-bold focus:border-[#1E5336] focus:outline-none"
                  >
                    <option value={editingMatch.team1}>{editingMatch.team1}</option>
                    <option value={editingMatch.team2}>{editingMatch.team2}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#1E5336] py-3 font-bold uppercase tracking-wider text-white shadow hover:bg-[#153d27]"
                >
                  Save Bracket Score
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InteractiveMatchCard({ match, isFinal, onEdit }: { match: BracketMatch; isFinal?: boolean; onEdit: (m: BracketMatch) => void }) {
  const isCompleted = match.status === 'completed'
  const isInProgress = match.status === 'in-progress'

  return (
    <div
      onClick={() => onEdit(match)}
      className={`group cursor-pointer overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        isFinal ? 'border-2 border-[#E1A728]' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-gray-500 border-b border-gray-100 pb-2 mb-2">
        <span>{match.court || 'Court 1'} • {match.time || 'TBD'}</span>
        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
          isCompleted ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-gray-100 text-gray-600'
        }`}>
          {match.status}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className={`flex items-center justify-between p-2 rounded ${
          match.winner === match.team1 ? 'bg-emerald-50 font-bold text-[#1E5336]' : 'text-gray-700'
        }`}>
          <span className="truncate">{match.team1}</span>
          <span className="font-serif font-extrabold text-sm">{match.score1 ?? '—'}</span>
        </div>

        <div className={`flex items-center justify-between p-2 rounded ${
          match.winner === match.team2 ? 'bg-emerald-50 font-bold text-[#1E5336]' : 'text-gray-700'
        }`}>
          <span className="truncate">{match.team2}</span>
          <span className="font-serif font-extrabold text-sm">{match.score2 ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
