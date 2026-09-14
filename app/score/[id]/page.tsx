'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { Activity, ArrowLeft, Trophy, Share2, Volume2, Shield } from 'lucide-react'

export default function PlayerLiveScorePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const matchId = resolvedParams.id
  const { liveMatches } = usePickleball()

  const match = liveMatches.find((m) => m.id === matchId) || liveMatches[0]

  if (!match) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif">Match Not Found</h2>
          <p className="mt-2 text-sm text-gray-400">The requested live scoring link does not exist.</p>
          <Link href="/" className="mt-4 inline-block bg-[#1E5336] px-4 py-2 text-xs font-bold uppercase rounded">
            Return to Hub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E1A728] hover:underline"
          >
            <ArrowLeft size={14} /> Multi-Sports Hub
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-400">
              SPECTATOR LIVE BROADCAST
            </span>
          </div>

          <Link
            href={`/umpire/${match.id}`}
            className="rounded-lg bg-[#E1A728] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#111827] shadow hover:bg-[#c48e1a]"
          >
            Switch to Umpire View
          </Link>
        </div>

        {/* Title Header */}
        <div className="mt-6 text-center">
          <span className="inline-block rounded-full bg-[#1E5336] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#E1A728] border border-[#E1A728]/30">
            {match.sport} • {match.court}
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold text-white sm:text-4xl">
            {match.matchTitle}
          </h1>
          <p className="mt-1 text-xs text-gray-400">Umpire: {match.umpireName}</p>
        </div>

        {/* LIVE SCOREBOARD CANVAS */}
        <div className="mt-8 rounded-3xl border-2 border-[#E1A728]/40 bg-gradient-to-b from-[#1F2937] to-[#111827] p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 text-xs font-semibold text-gray-400">
            <span>CURRENT SET: <strong className="text-white">SET {match.currentSet}</strong></span>
            <span>SERVER: <strong className="text-[#E1A728]">🎾 {match.serverName}</strong></span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 text-center">
            {/* Team 1 Score */}
            <div className={`rounded-2xl p-6 transition ${
              match.currentServer === 1 ? 'bg-[#1E5336]/40 border-2 border-[#1E5336]' : 'bg-gray-900/60 border border-gray-800'
            }`}>
              <h3 className="font-serif text-xl font-bold text-white leading-tight">{match.team1Name}</h3>
              <p className="mt-1 text-[10px] text-gray-400">{match.team1Players.join(' & ')}</p>
              <div className="my-6">
                <span className="font-serif text-7xl font-extrabold text-white sm:text-8xl">
                  {match.score1}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-x-2">
                <span>Set 1: {match.set1Score1}</span>
                <span>Set 2: {match.set2Score1}</span>
              </div>
            </div>

            {/* Team 2 Score */}
            <div className={`rounded-2xl p-6 transition ${
              match.currentServer === 2 ? 'bg-[#E1A728]/20 border-2 border-[#E1A728]' : 'bg-gray-900/60 border border-gray-800'
            }`}>
              <h3 className="font-serif text-xl font-bold text-[#E1A728] leading-tight">{match.team2Name}</h3>
              <p className="mt-1 text-[10px] text-gray-400">{match.team2Players.join(' & ')}</p>
              <div className="my-6">
                <span className="font-serif text-7xl font-extrabold text-[#E1A728] sm:text-8xl">
                  {match.score2}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-x-2">
                <span>Set 1: {match.set1Score2}</span>
                <span>Set 2: {match.set2Score2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* POINT LOG HISTORY */}
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-white">Live Point History Log</h3>
          <div className="mt-4 divide-y divide-gray-800">
            {match.pointHistory.map((pt, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${pt.team === 1 ? 'bg-[#1E5336]' : 'bg-[#E1A728]'}`} />
                  <span className="font-medium text-gray-200">{pt.text}</span>
                </div>
                <span className="text-[10px] text-gray-500">{pt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
