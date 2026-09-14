'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { Trophy, Calendar, MapPin, Users, Tag, ChevronRight, TrendingUp, ShieldAlert, Plus, CheckCircle2 } from 'lucide-react'

export default function TournamentsPage() {
  const { tournaments, clubTeams, registerClubTeam } = usePickleball()

  // Register Club Team Modal State
  const [isRegisteringClub, setIsRegisteringClub] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [captainName, setCaptainName] = useState('')
  const [captainContact, setCaptainContact] = useState('')
  const [logoBadge, setLogoBadge] = useState('🛡️')
  const [squadInput, setSquadInput] = useState('')

  const publishedTournaments = tournaments.filter((t) => t.published)

  const handleRegisterClubSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName || !captainName) return

    const squad = squadInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    registerClubTeam({
      name: teamName,
      sport: 'Pickleball',
      captain: captainName,
      contact: captainContact,
      logoBadge,
      squadMembers: squad.length > 0 ? squad : [captainName],
      maxSlots: 8,
    })

    setIsRegisteringClub(false)
    setTeamName('')
    setCaptainName('')
    setCaptainContact('')
    setSquadInput('')
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#111827] pb-16">
      {/* Header Banner */}
      <section className="bg-[#111827] text-white px-6 py-12 shadow-xl border-b border-[#E1A728]/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E1A728]/40 bg-[#1F2937] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E1A728]">
                <Trophy size={14} /> Official Pickleball Competitive Engine
              </span>
              <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-bold text-white">
                Pickleball Tournaments, Brackets & Clubs
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-2xl">
                Single Elimination, Double Elimination, Round Robin, and Group Stage formats with interactive drag-and-drop bracket editing and Club Team Slot allocations.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tournaments/bracket"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E5336] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#153d27] transition shrink-0"
              >
                <TrendingUp size={16} className="text-[#E1A728]" />
                Interactive Bracket Editor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        {/* SECTION 1: TOURNAMENT LISTINGS */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#1E5336]">Upcoming Pickleball Tournaments</h2>
            <span className="text-xs text-[#6B756B]">{publishedTournaments.length} Events Listed</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {publishedTournaments.map((t) => {
              const isRegOpen = t.status === 'registration-open' || t.status === 'upcoming'
              const spotsLeft = t.maxTeams - t.registeredTeams

              return (
                <div key={t.id} className="rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#1E5336]/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#1E5336]">
                          Pickleball
                        </span>
                        <span className="rounded bg-[#FDF6E7] px-2 py-0.5 text-[9px] font-bold uppercase text-[#C48E1A] border border-[#E1A728]/30">
                          {t.bracketFormat || 'Single Elimination'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                        isRegOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isRegOpen ? 'REGISTRATION OPEN' : t.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-[#111827]">{t.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#6B756B]">{t.description}</p>

                    <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-[#6B756B]">Date & Time</span><span className="font-bold text-[#111827]">{t.date} · {t.time}</span></div>
                      <div className="flex justify-between"><span className="text-[#6B756B]">Location</span><span>{t.location}</span></div>
                      <div className="flex justify-between"><span className="text-[#6B756B]">Registration Fee</span><span className="font-bold text-[#1E5336]">₱{t.registrationFee} / Team</span></div>
                      <div className="flex justify-between"><span className="text-[#6B756B]">Teams Registered</span><span className="font-bold text-[#111827]">{t.registeredTeams} / {t.maxTeams} Teams</span></div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-4 flex gap-3">
                    <Link
                      href={`/tournaments/${t.id}`}
                      className="flex-1 rounded-lg border border-[#1E5336] py-2.5 text-center text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:bg-[#1E5336] hover:text-white transition"
                    >
                      View Details & Bracket
                    </Link>
                    <Link
                      href="/tournaments/bracket"
                      className="flex-1 rounded-lg bg-[#E1A728] py-2.5 text-center text-xs font-bold uppercase tracking-wider text-[#111827] hover:bg-[#c48e1a] transition"
                    >
                      Bracket Editor
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTION 2: CLUB TEAM SLOTS MANAGEMENT */}
        <div className="rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1A728]">
                Pickleball Squad Roster System
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1E5336]">
                Registered Pickleball Club Team Slots
              </h2>
            </div>
            <button
              onClick={() => setIsRegisteringClub(true)}
              className="flex items-center gap-2 rounded-lg bg-[#1E5336] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-[#153d27]"
            >
              <Plus size={14} /> Register New Club Team
            </button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clubTeams.map((club) => (
              <div key={club.id} className="rounded-xl border border-gray-100 bg-[#F3F0EC]/60 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                      {club.logoBadge}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#111827]">{club.name}</h3>
                      <span className="text-[10px] font-bold text-[#6B756B]">Pickleball Club</span>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                    {club.status}
                  </span>
                </div>

                <div className="mt-4 border-t border-gray-200/60 pt-3 text-xs space-y-1.5">
                  <p><strong className="text-gray-600">Captain:</strong> {club.captain} ({club.contact})</p>
                  <p><strong className="text-gray-600">Record:</strong> {club.wins} Wins - {club.losses} Losses</p>
                  <p><strong className="text-gray-600">Squad Slots ({club.squadMembers.length}/{club.maxSlots}):</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {club.squadMembers.map((m, idx) => (
                      <span key={idx} className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#111827] border border-gray-200">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register Club Modal */}
        {isRegisteringClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#1E5336]">Register Pickleball Club Team</h3>
                <button onClick={() => setIsRegisteringClub(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>

              <form onSubmit={handleRegisterClubSubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#111827]">Club / Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Emerald Smashers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Captain Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Captain Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0917-111-2233"
                    value={captainContact}
                    onChange={(e) => setCaptainContact(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Squad Roster Members (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Player 1, Player 2, Player 3, Player 4"
                    value={squadInput}
                    onChange={(e) => setSquadInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#1E5336] py-3 font-bold uppercase tracking-wider text-white shadow hover:bg-[#153d27]"
                >
                  Submit Club Registration
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
