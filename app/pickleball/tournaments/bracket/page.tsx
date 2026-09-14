'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { BracketMatch, TournamentBracketFormat } from '@/lib/data'
import { ArrowLeft, Award } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function TournamentBracketPage() {
  const { tournaments, bracketMatches, updateMatchScore, updateMatchTeams } = usePickleball()
  const activeTournament = tournaments[0] || tournaments[0]
  const isTeamEvent = activeTournament?.format === 'team-event'

  const [activeFormatTab, setActiveFormatTab] = useState<TournamentBracketFormat>('single-elimination')

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
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/pickleball/tournaments"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#E1A728] hover:text-[#1E5336] mb-4"
          >
            <ArrowLeft size={12} /> Back to Tournaments
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Interactive Bracket Visualization & Editor</p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">{activeTournament?.name}</h1>
              <span className="mt-2 inline-block border border-[#222222]/15 bg-[#FDFBF7] px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#6B756B]">
                {isTeamEvent ? 'Team Event (Club)' : 'Pairing Tournament'}
              </span>
            </div>

            <div className="flex gap-0 border border-[#222222]/15 bg-[#FDFBF7] p-1">
              {[
                { id: 'single-elimination', label: 'Single Elim' },
                { id: 'double-elimination', label: 'Double Elim' },
                { id: 'round-robin', label: 'Round Robin' },
                { id: 'group-stage', label: 'Group Stage' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setActiveFormatTab(fmt.id as any)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                    activeFormatTab === fmt.id
                      ? 'bg-[#1E5336] text-[#FDFBF7]'
                      : 'text-[#6B756B] hover:text-[#222222]'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-[#222222]/10 bg-[#FDFBF7] p-4">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-[#1E5336]">
              <span className="h-2.5 w-2.5 bg-[#1E5336]" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-[#E1A728]">
              <span className="h-2.5 w-2.5 bg-[#E1A728] animate-pulse" /> Live / In Progress
            </span>
            <span className="flex items-center gap-1.5 text-[#6B756B]">
              <span className="h-2.5 w-2.5 bg-[#222222]/15" /> Scheduled
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Active Format: <strong className="text-[#1E5336]">{activeFormatTab}</strong></span>
        </div>

        {activeTournament?.championPairName && (
          <div className="mb-8 border-2 border-[#E1A728] bg-[#FDFBF7] p-6 text-center">
            <Award size={36} className="mx-auto text-[#E1A728] mb-1" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728] font-bold block">
              2026 Official Champion
            </span>
            <h2 className="mt-1 font-serif text-3xl text-[#1E5336]">{activeTournament.championPairName}</h2>
          </div>
        )}

        {(activeFormatTab === 'round-robin' || activeFormatTab === 'group-stage') ? (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 space-y-6">
            <h3 className="font-serif text-xl text-[#1E5336]">
              {activeFormatTab === 'round-robin' ? 'Round Robin Points Matrix' : 'Group Stage Standings & Playoffs'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#222222]/10 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                  <tr>
                    <th className="py-3 pr-3">Team / Pair</th>
                    <th className="py-3 px-3 text-center">Played</th>
                    <th className="py-3 px-3 text-center">Won</th>
                    <th className="py-3 px-3 text-center">Lost</th>
                    <th className="py-3 px-3 text-center">Diff</th>
                    <th className="py-3 px-3">Points</th>
                    <th className="py-3 pl-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {[
                    { name: 'Maria Santos & Juan Rivera', played: 3, won: 3, lost: 0, diff: '+18', pts: 9, advanced: true },
                    { name: 'Carlo Delos Santos & Jenny Aquino', played: 3, won: 2, lost: 1, diff: '+8', pts: 6, advanced: true },
                    { name: 'Smash Duo (Mike & Lisa)', played: 3, won: 1, lost: 2, diff: '-4', pts: 3, advanced: false },
                  ].map((row) => (
                    <tr key={row.name}>
                      <td className="py-3 pr-3 font-bold text-[#222222]">{row.name}</td>
                      <td className="py-3 px-3 text-center">{row.played}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#1E5336]">{row.won}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#E1A728]">{row.lost}</td>
                      <td className="py-3 px-3 text-center">{row.diff}</td>
                      <td className="py-3 px-3 font-bold text-[#1E5336]">{row.pts} PTS</td>
                      <td className="py-3 pl-3">
                        <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${
                          row.advanced
                            ? 'border-[#1E5336]/20 text-[#1E5336]'
                            : 'border-[#222222]/15 text-[#6B756B]'
                        }`}>
                          {row.advanced ? 'Advanced to Playoff' : 'Group Stage'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-8 pt-4">
            <div className="min-w-[950px] flex items-start justify-between gap-8 px-2">
              <div className="flex-1 space-y-6">
                <h3 className="text-center border border-[#222222]/15 bg-[#FDFBF7] py-2.5 text-[10px] uppercase tracking-[0.18em] font-bold text-[#1E5336]">
                  Quarterfinals
                </h3>
                <div className="space-y-6">
                  {qfMatches.map((m) => (
                    <InteractiveMatchCard key={m.id} match={m} onEdit={handleOpenScoreEdit} />
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <h3 className="text-center border border-[#222222]/15 bg-[#FDFBF7] py-2.5 text-[10px] uppercase tracking-[0.18em] font-bold text-[#1E5336]">
                  Semifinals
                </h3>
                <div className="space-y-16 py-8">
                  {sfMatches.map((m) => (
                    <InteractiveMatchCard key={m.id} match={m} onEdit={handleOpenScoreEdit} />
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <h3 className="text-center bg-[#1E5336] py-2.5 text-[10px] uppercase tracking-[0.18em] font-bold text-[#E1A728]">
                  Finals
                </h3>
                <div className="py-16 space-y-8">
                  {finalMatch && <InteractiveMatchCard match={finalMatch} isFinal onEdit={handleOpenScoreEdit} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {editingMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md border border-[#222222]/10 bg-[#FDFBF7] p-6">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <h3 className="font-serif text-xl text-[#1E5336]">Update Bracket Score</h3>
                <button onClick={() => setEditingMatch(null)} className="text-[#6B756B] hover:text-black">✕</button>
              </div>

              <form onSubmit={handleSaveMatchScore} className="mt-4 space-y-4 text-xs">
                <div className="border border-[#222222]/10 bg-[#F3F0EC] p-3 font-bold text-[#222222]">
                  {editingMatch.team1} <span className="mx-1 text-[#E1A728]">VS</span> {editingMatch.team2}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">{editingMatch.team1} Score</label>
                    <input
                      type="number"
                      value={score1Input}
                      onChange={(e) => setScore1Input(parseInt(e.target.value) || 0)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent p-2.5 text-base font-bold focus:border-[#1E5336] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">{editingMatch.team2} Score</label>
                    <input
                      type="number"
                      value={score2Input}
                      onChange={(e) => setScore2Input(parseInt(e.target.value) || 0)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent p-2.5 text-base font-bold focus:border-[#1E5336] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Declare Winner</label>
                  <select
                    value={winnerInput}
                    onChange={(e) => setWinnerInput(e.target.value)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent p-2.5 font-bold focus:border-[#1E5336] outline-none"
                  >
                    <option value={editingMatch.team1}>{editingMatch.team1}</option>
                    <option value={editingMatch.team2}>{editingMatch.team2}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
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
      className={`group cursor-pointer border bg-[#FDFBF7] p-4 transition hover:border-[#1E5336] ${
        isFinal ? 'border-2 border-[#E1A728]' : 'border-[#222222]/15'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-[#6B756B] border-b border-[#222222]/10 pb-2 mb-2">
        <span>{match.court || 'Court 1'} · {match.time || 'TBD'}</span>
        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${
          isCompleted ? 'border border-[#1E5336]/20 text-[#1E5336]' : isInProgress ? 'border border-[#E1A728]/40 text-[#E1A728] animate-pulse' : 'border border-[#222222]/15 text-[#6B756B]'
        }`}>
          {match.status}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className={`flex items-center justify-between p-2 ${
          match.winner === match.team1 ? 'bg-[#1E5336]/5 font-bold text-[#1E5336]' : 'text-[#6B756B]'
        }`}>
          <span className="truncate">{match.team1}</span>
          <span className="font-serif font-extrabold text-sm text-[#222222]">{match.score1 ?? '—'}</span>
        </div>
        <div className={`flex items-center justify-between p-2 ${
          match.winner === match.team2 ? 'bg-[#1E5336]/5 font-bold text-[#1E5336]' : 'text-[#6B756B]'
        }`}>
          <span className="truncate">{match.team2}</span>
          <span className="font-serif font-extrabold text-sm text-[#222222]">{match.score2 ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}