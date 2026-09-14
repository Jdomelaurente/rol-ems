'use client'

import React from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import {
  Dices,
  ShieldCheck,
  Trophy,
  Users,
  Volleyball,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'

export default function RoulettePairingPage() {
  const { rouletteResults } = usePickleball()

  const latestPair = rouletteResults.length > 0 ? rouletteResults[0] : null

  return (
    <div className="min-h-screen bg-[#F3F0EC] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Hero */}
        <div className="mb-8 rounded-2xl bg-[#111827] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#E1A728]/20 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E1A728]/40 bg-[#1F2937] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E1A728]">
                  <Dices size={14} /> Pickleball Roulette Matchmaker
                </span>
                <h1 className="mt-3 font-serif text-4xl font-extrabold sm:text-5xl">
                  Official Blind Pairings & Brackets
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
                  Unbiased tournament and open play partner allocation for Court 1 (Before), Court 2 (Patience), and Court 3 (Power).
                </p>
              </div>

              {/* Admin Notice / Link */}
              <div className="rounded-xl border border-[#E1A728]/30 bg-black/40 p-4 backdrop-blur text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E1A728]">
                  <ShieldCheck size={13} /> Admin Managed
                </span>
                <p className="mt-1 text-xs text-gray-300">
                  Only tournament admins can trigger roulette spins.
                </p>
                <Link
                  href="/admin/roulette"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#E1A728] hover:underline"
                >
                  Admin Pair Console <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LATEST BLIND PAIR HIGHLIGHT (IF AVAILABLE) */}
        {latestPair && (
          <div className="mb-8 rounded-2xl border-2 border-[#E1A728]/60 bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] p-6 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E1A728]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E1A728] border border-[#E1A728]/40">
                  <Sparkles size={12} /> Latest Official Matchup
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                  <span className="text-white">{latestPair.playerA}</span>
                  <span className="mx-2 text-[#E1A728]">&</span>
                  <span className="text-white">{latestPair.playerB}</span>
                </h3>
                <p className="mt-1 text-xs text-emerald-400 font-semibold">
                  {latestPair.bracketPlacement}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock size={12} /> Spun at {latestPair.timestamp}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL ROULETTE LOG TABLE */}
        <div className="rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1E5336]">
                Live Blind Pairings Log
              </h2>
              <p className="text-xs text-[#6B756B]">
                All randomized player duos and their assigned bracket slots.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-[#1E5336]">
              {rouletteResults.length} {rouletteResults.length === 1 ? 'Pair' : 'Pairs'} Generated
            </span>
          </div>

          {rouletteResults.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E1A728]/10 text-[#C48E1A] mb-3">
                <Dices size={28} />
              </div>
              <h4 className="font-serif text-lg font-bold text-gray-800">
                No Roulette Pairings Generated Yet
              </h4>
              <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
                Tournament directors and administrators will spin the roulette wheels before bracket matches. Check back soon!
              </p>
              <div className="mt-5">
                <Link
                  href="/admin/roulette"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E5336] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#163e28] transition"
                >
                  Admin: Open Roulette Generator <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="py-3">Pairing Duos</th>
                    <th className="py-3">Sport</th>
                    <th className="py-3">Assigned Bracket & Court</th>
                    <th className="py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rouletteResults.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 font-bold text-[#111827]">
                        <span className="text-[#1E5336]">{res.playerA}</span>
                        <span className="mx-1.5 text-[#E1A728] font-black">&</span>
                        <span className="text-[#1E5336]">{res.playerB}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          {res.sport}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-[#111827] bg-[#F3F0EC] px-2.5 py-1 rounded border border-gray-200">
                          {res.bracketPlacement}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-[11px] text-gray-500">
                        {res.timestamp}
                      </td>
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
