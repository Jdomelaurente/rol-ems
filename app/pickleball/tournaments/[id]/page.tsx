'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePickleball } from '@/context/PickleballContext'
import { getPairDisplayName } from '@/lib/data'
import ConsentCheckbox from '@/components/legal/ConsentCheckbox'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, CircleCheck, AlertCircle } from 'lucide-react'

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const defaultRegistering = searchParams.get('action') === 'register'
  const { tournaments, addPairToTournament } = usePickleball()

  const tournament = tournaments.find((t) => t.id === resolvedParams.id) || tournaments[0]
  const pairs = tournament?.pairs || []
  const isTeamEvent = tournament?.format === 'team-event'

  const [isRegistering, setIsRegistering] = useState(defaultRegistering)
  const [pairName, setPairName] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [consent, setConsent] = useState(false)

  const isRegOpen = tournament.status === 'registration-open' || tournament.status === 'upcoming'

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1 || !player2 || !consent) return

    addPairToTournament(tournament.id, player1, player2, pairName)
    setSubmitted(true)
    setConsent(false)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/pickleball/tournaments"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#E1A728] hover:text-[#1E5336] mb-4"
          >
            <ArrowLeft size={12} /> Back to Tournaments
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">{tournament.type}</p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">{tournament.name}</h1>
              <span className="mt-2 inline-block border border-[#222222]/15 bg-[#FDFBF7] px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#6B756B]">
                {isTeamEvent ? 'Team Event (Club)' : 'Pairing Tournament'}
              </span>
            </div>
            {isRegOpen && !isRegistering && (
              <button
                onClick={() => setIsRegistering(true)}
                className="bg-[#E1A728] px-6 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#1E5336] hover:bg-[#c48e1a] shrink-0"
              >
                {isTeamEvent ? 'Register Club Team' : 'Register Pair'}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {submitted ? (
          <div className="mx-auto max-w-lg border border-[#222222]/15 bg-[#FDFBF7] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-[#1E5336] text-[#1E5336]">
              <CircleCheck size={28} />
            </div>
            <h2 className="font-serif text-2xl text-[#1E5336]">
              {isTeamEvent ? 'Team Squad Registered!' : 'Pair Registered Successfully!'}
            </h2>
            <p className="mt-2 text-sm text-[#6B756B]">
              <strong>{pairName || `${player1} & ${player2}`}</strong> has been registered for {tournament.name}. Please pay the registration fee of ₱{tournament.registrationFee} at the venue prior to match start.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setSubmitted(false)} className="flex-1 border border-[#1E5336] py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
                Register Another Entry
              </button>
              <Link href="/pickleball/tournaments/bracket" className="flex-1 bg-[#1E5336] py-2.5 text-center text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7]">
                View Tournament Bracket
              </Link>
            </div>
          </div>
        ) : isRegistering ? (
          <div className="mx-auto max-w-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#222222]/10 pb-4">
              <h2 className="font-serif text-2xl text-[#1E5336]">
                {isTeamEvent ? 'Club Team Squad Registration' : 'Doubles Pair Registration Form'}
              </h2>
              <button onClick={() => setIsRegistering(false)} className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B] hover:text-[#222222]">
                Cancel
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B]">
                  Team / Pair Name <span className="font-normal normal-case tracking-normal text-[#6B756B]">(optional - defaults to Player 1 & 2)</span>
                </label>
                <input
                  type="text"
                  value={pairName}
                  onChange={(e) => setPairName(e.target.value)}
                  placeholder="Optional e.g. Smash Duo"
                  className="mt-2 w-full border border-[#222222]/20 bg-[#F3F0EC] px-4 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B]">Player 1 Name *</label>
                <input
                  type="text"
                  required
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="mt-2 w-full border border-[#222222]/20 bg-[#F3F0EC] px-4 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B]">Player 2 Name *</label>
                <input
                  type="text"
                  required
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="e.g. Juan Rivera"
                  className="mt-2 w-full border border-[#222222]/20 bg-[#F3F0EC] px-4 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </div>

              <div className="border border-[#E1A728]/40 bg-[#FDFBF7] p-4 text-xs text-[#222222] space-y-1">
                <p className="font-bold text-[#1E5336]">Entry Fee: ₱{tournament.registrationFee} per entry</p>
                <p className="text-[#6B756B]">Registration deadline: {tournament.registrationDeadline}</p>
              </div>

              <ConsentCheckbox id="tournament-consent" agreed={consent} onChange={setConsent} />

              <button
                type="submit"
                disabled={!consent}
                className={`w-full py-3 text-[10px] uppercase tracking-[0.16em] font-bold transition ${
                  consent ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                }`}
              >
                Complete Registration
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
                <h2 className="font-serif text-2xl text-[#1E5336]">About the Tournament</h2>
                <p className="mt-3 text-sm leading-7 text-[#6B756B]">{tournament.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#222222]/10 pt-6 text-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Date & Time</span>
                    <p className="font-semibold text-[#222222]">{tournament.date} at {tournament.time}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Location</span>
                    <p className="font-semibold text-[#222222]">{tournament.location}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Registration Fee</span>
                    <p className="font-semibold text-[#1E5336]">₱{tournament.registrationFee} / entry</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Registration Deadline</span>
                    <p className="font-semibold text-[#222222]">{tournament.registrationDeadline}</p>
                  </div>
                </div>
              </div>

              <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6">
                <h3 className="font-serif text-xl text-[#1E5336] mb-4">
                  Registered {isTeamEvent ? 'Teams' : 'Pairs'} ({pairs.length}/{tournament.maxTeams})
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {pairs.map((p, idx) => {
                    const label = getPairDisplayName(p)

                    return (
                      <div key={p.id} className="flex items-center justify-between border border-[#222222]/10 bg-[#F3F0EC] p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1E5336]">#{idx + 1}</span>
                          <div>
                            <p className="font-bold text-[#222222]">{label}</p>
                            <p className="text-[#6B756B]">{p.player1} & {p.player2}</p>
                          </div>
                        </div>
                        <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${
                          p.status === 'active' ? 'border-[#1E5336]/20 text-[#1E5336]' : 'border-[#E1A728]/40 text-[#E1A728]'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-20 border border-[#222222]/15 bg-[#FDFBF7] p-6 space-y-4">
                <h3 className="font-serif text-xl text-[#1E5336]">Event Overview</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#222222]/10">
                    <span className="text-[#6B756B]">Format</span>
                    <span className="font-bold text-[#222222]">{isTeamEvent ? 'Team Event Tournament' : 'Pairing Tournament'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#222222]/10">
                    <span className="text-[#6B756B]">Courts Assigned</span>
                    <span className="font-bold text-[#222222]">Court 1, 2, 3</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#222222]/10">
                    <span className="text-[#6B756B]">Max Capacity</span>
                    <span className="font-bold text-[#222222]">{tournament.maxTeams} Entries</span>
                  </div>
                </div>

                <Link
                  href="/pickleball/tournaments/bracket"
                  className="w-full flex items-center justify-center bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
                >
                  View Tournament Bracket
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}