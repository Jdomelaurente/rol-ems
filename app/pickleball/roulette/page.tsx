'use client'

import React from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import Navbar from '@/components/layout/Navbar'
import { Dices, ArrowRight, Clock, Sparkles } from 'lucide-react'

export default function RoulettePairingPage() {
  const { rouletteResults } = usePickleball()

  const latestPair = rouletteResults.length > 0 ? rouletteResults[0] : null

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Matchmaking</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Roulette Pairings</h1>
          <p className="mt-2 text-sm text-[#6B756B]">Unbiased tournament and open play partner allocation for all courts.</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="border border-[#222222]/15 bg-[#FDFBF7] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
              Admin Managed
            </span>
            <Link
              href="/admin/roulette"
              className="inline-flex items-center gap-1 border-b border-[#1E5336] pb-0.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]"
            >
              Admin Pair Console <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {latestPair && (
          <div className="mb-8 border border-[#E1A728]/40 bg-[#FDFBF7] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728] font-bold">
                  <Sparkles size={12} className="mr-1 inline" /> Latest Official Matchup
                </span>
                <h3 className="mt-2 font-serif text-2xl text-[#1E5336] sm:text-3xl">
                  {latestPair.playerA} <span className="mx-1 text-[#E1A728]">&</span> {latestPair.playerB}
                </h3>
                <p className="mt-1 text-xs text-[#6B756B]">{latestPair.bracketPlacement}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                  <Clock size={12} /> Spun at {latestPair.timestamp}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222]/10 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Pairing Log</p>
              <h2 className="mt-1 font-serif text-xl text-[#1E5336]">Live Blind Pairings</h2>
            </div>
            <span className="border border-[#222222]/15 bg-[#FDFBF7] px-3 py-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
              {rouletteResults.length} {rouletteResults.length === 1 ? 'Pair' : 'Pairs'} Generated
            </span>
          </div>

          {rouletteResults.length === 0 ? (
            <div className="py-16 text-center">
              <Dices size={28} className="mx-auto text-[#E1A728] mb-3" />
              <h4 className="font-serif text-lg text-[#1E5336]">No Pairings Generated Yet</h4>
              <p className="mx-auto mt-1 max-w-md text-xs text-[#6B756B]">
                Tournament directors will spin the roulette before bracket matches.
              </p>
              <Link
                href="/admin/roulette"
                className="mt-5 inline-flex items-center gap-1.5 border border-[#1E5336] px-4 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]"
              >
                Admin: Open Roulette Generator <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222]/10 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                    <th className="py-3">Pairing Duos</th>
                    <th className="py-3">Sport</th>
                    <th className="py-3">Bracket & Court</th>
                    <th className="py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {rouletteResults.map((res) => (
                    <tr key={res.id}>
                      <td className="py-3 font-bold text-[#222222]">
                        {res.playerA} <span className="mx-1 text-[#E1A728]">&</span> {res.playerB}
                      </td>
                      <td className="py-3">
                        <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                          {res.sport}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#222222]">{res.bracketPlacement}</td>
                      <td className="py-3 text-right text-[10px] text-[#6B756B]">{res.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}