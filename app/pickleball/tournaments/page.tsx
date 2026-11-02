'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { TrendingUp, Plus } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import TournamentTabs from '@/components/tournament/TournamentTabs'

export default function TournamentsPage() {
  const { tournaments, clubTeams, registerClubTeam } = usePickleball()

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
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Competitive Calendar</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Tournaments, Brackets & Clubs</h1>
          <p className="mt-2 text-sm text-[#6B756B]">Single elimination, round robin, group stage, and club team slot allocations.</p>
          <div className="mt-5">
            <Link
              href="/pickleball/tournaments/bracket"
              className="inline-flex items-center gap-2 bg-[#1E5336] px-5 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
            >
              <TrendingUp size={14} /> View Tournament Bracket
            </Link>
          </div>
        </div>
      </section>

      <TournamentTabs currentTab="tournaments" />

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-12">
        <div>
          <div className="mb-6 flex items-end justify-between border-b border-[#222222]/10 pb-4">
            <h2 className="font-serif text-2xl text-[#1E5336]">Upcoming Tournaments</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">{publishedTournaments.length} Events</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {publishedTournaments.map((t) => {
              const isRegOpen = t.status === 'registration-open' || t.status === 'upcoming'

              return (
                <div key={t.id} className="flex flex-col justify-between border border-[#222222]/10 bg-[#FDFBF7] p-6">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                          Pickleball
                        </span>
                        <span className="border border-[#E1A728]/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#E1A728]">
                          {t.bracketFormat || 'Single Elimination'}
                        </span>
                      </div>
                      <span className={`border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${
                        isRegOpen ? 'border-[#1E5336]/20 text-[#1E5336]' : 'border-[#222222]/15 text-[#6B756B]'
                      }`}>
                        {isRegOpen ? 'Registration Open' : t.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl text-[#1E5336]">{t.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#6B756B]">{t.description}</p>

                    <div className="mt-6 border-t border-[#222222]/10 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-[#6B756B]">Date & Time</span><span className="font-bold text-[#222222]">{t.date} · {t.time}</span></div>
                      <div className="flex justify-between"><span className="text-[#6B756B]">Location</span><span className="font-bold text-[#222222]">{t.location}</span></div>
                      <div className="flex justify-between"><span className="text-[#6B756B]">Fee</span><span className="font-bold text-[#1E5336]">₱{t.registrationFee} / Team</span></div>
                      <div className="flex justify-between"><span className="text-[#6B756B]">Teams</span><span className="font-bold text-[#222222]">{t.registeredTeams} / {t.maxTeams}</span></div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 border-t border-[#222222]/10 pt-4">
                    <Link
                      href={`/pickleball/tournaments/${t.id}`}
                      className="flex-1 border border-[#1E5336] py-2.5 text-center text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
                    >
                      View Details
                    </Link>
                    <Link
                      href="/pickleball/tournaments/bracket"
                      className="flex-1 bg-[#E1A728] py-2.5 text-center text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336] hover:bg-[#c48e1a]"
                    >
                      Bracket Editor
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border border-[#222222]/10 bg-[#FDFBF7] p-6">
          <div className="flex flex-wrap items-center justify-between border-b border-[#222222]/10 pb-4 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Squad Roster System</p>
              <h2 className="mt-1 font-serif text-2xl text-[#1E5336]">Registered Club Team Slots</h2>
            </div>
            <button
              onClick={() => setIsRegisteringClub(true)}
              className="flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
            >
              <Plus size={14} /> Register Club Team
            </button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clubTeams.map((club) => (
              <div key={club.id} className="border border-[#222222]/10 bg-[#F3F0EC] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-[#222222]/10 bg-[#FDFBF7] text-xl">
                      {club.logoBadge}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg text-[#1E5336]">{club.name}</h3>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Pickleball Club</span>
                    </div>
                  </div>
                  <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                    {club.status}
                  </span>
                </div>

                <div className="mt-4 border-t border-[#222222]/10 pt-3 text-xs space-y-1.5">
                  <p><strong className="text-[#6B756B]">Captain:</strong> {club.captain} ({club.contact})</p>
                  <p><strong className="text-[#6B756B]">Record:</strong> {club.wins} W - {club.losses} L</p>
                  <p><strong className="text-[#6B756B]">Squad Slots ({club.squadMembers.length}/{club.maxSlots}):</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {club.squadMembers.map((m, idx) => (
                      <span key={idx} className="border border-[#222222]/10 bg-[#FDFBF7] px-2 py-0.5 text-[10px] font-semibold text-[#222222]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isRegisteringClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md border border-[#222222]/10 bg-[#FDFBF7] p-6">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <h3 className="font-serif text-xl text-[#1E5336]">Register Pickleball Club Team</h3>
                <button onClick={() => setIsRegisteringClub(false)} className="text-[#6B756B] hover:text-black">✕</button>
              </div>

              <form onSubmit={handleRegisterClubSubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Club / Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Emerald Smashers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Captain Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Captain Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0917-111-2233"
                    value={captainContact}
                    onChange={(e) => setCaptainContact(e.target.value)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Squad Roster (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Player 1, Player 2, Player 3"
                    value={squadInput}
                    onChange={(e) => setSquadInput(e.target.value)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
                >
                  Submit Registration
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}