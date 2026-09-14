'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import { Activity, ArrowLeft, RotateCcw, AlertTriangle, Check, Volume2, Shield } from 'lucide-react'

export default function UmpireLiveConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const matchId = resolvedParams.id
  const { liveMatches, updateLiveScore, switchLiveServer, addPointHistory } = usePickleball()

  const match = liveMatches.find((m) => m.id === matchId) || liveMatches[0]

  if (!match) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif">Match Not Found</h2>
          <Link href="/" className="mt-4 inline-block bg-[#1E5336] px-4 py-2 text-xs font-bold uppercase rounded">
            Return to Hub
          </Link>
        </div>
      </div>
    )
  }

  const handlePoint = (team: 1 | 2) => {
    updateLiveScore(match.id, team, 1)
  }

  const handleUndo = (team: 1 | 2) => {
    updateLiveScore(match.id, team, -1)
  }

  const handleToggleServer = () => {
    switchLiveServer(match.id)
  }

  const handleLogFault = (team: 1 | 2) => {
    addPointHistory(match.id, team, `Fault called on ${team === 1 ? match.team1Name : match.team2Name}`)
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white px-4 py-8 sm:px-6 select-none">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E1A728] hover:underline"
          >
            <ArrowLeft size={14} /> Hub
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">
              OFFICIAL UMPIRE CONSOLE CONTROL
            </span>
          </div>

          <Link
            href={`/score/${match.id}`}
            className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-[10px] font-bold uppercase text-white hover:bg-gray-700"
          >
            Public Spectator View
          </Link>
        </div>

        {/* Title Header */}
        <div className="mt-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {match.sport} • {match.court}
          </span>
          <h1 className="font-serif text-2xl font-bold text-white">{match.matchTitle}</h1>
        </div>

        {/* TOUCH SCOREKEEPING BUTTONS CANVAS */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* TEAM 1 SCORE CONTROLLER */}
          <div className={`rounded-3xl border-2 p-6 text-center shadow-xl transition ${
            match.currentServer === 1 ? 'border-[#1E5336] bg-[#1E5336]/30' : 'border-gray-800 bg-gray-900/80'
          }`}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E5336] bg-white px-2 py-0.5 rounded">
              TEAM 1
            </span>
            <h3 className="mt-2 font-serif text-xl font-bold text-white">{match.team1Name}</h3>

            <div className="my-6">
              <span className="font-serif text-8xl font-extrabold text-white">{match.score1}</span>
            </div>

            {/* TOUCH ACTION BUTTONS */}
            <div className="space-y-3">
              <button
                onClick={() => handlePoint(1)}
                className="w-full rounded-2xl bg-[#1E5336] py-5 font-serif text-2xl font-extrabold text-white shadow-xl hover:bg-[#153d27] active:scale-95 transition"
              >
                +1 POINT TEAM 1
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUndo(1)}
                  className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-bold uppercase text-gray-300 hover:bg-gray-700"
                >
                  Undo (-1)
                </button>
                <button
                  onClick={() => handleLogFault(1)}
                  className="flex-1 rounded-xl bg-red-950 text-red-300 py-2.5 text-xs font-bold uppercase hover:bg-red-900 border border-red-800"
                >
                  Fault
                </button>
              </div>
            </div>
          </div>

          {/* TEAM 2 SCORE CONTROLLER */}
          <div className={`rounded-3xl border-2 p-6 text-center shadow-xl transition ${
            match.currentServer === 2 ? 'border-[#E1A728] bg-[#E1A728]/20' : 'border-gray-800 bg-gray-900/80'
          }`}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111827] bg-[#E1A728] px-2 py-0.5 rounded">
              TEAM 2
            </span>
            <h3 className="mt-2 font-serif text-xl font-bold text-[#E1A728]">{match.team2Name}</h3>

            <div className="my-6">
              <span className="font-serif text-8xl font-extrabold text-[#E1A728]">{match.score2}</span>
            </div>

            {/* TOUCH ACTION BUTTONS */}
            <div className="space-y-3">
              <button
                onClick={() => handlePoint(2)}
                className="w-full rounded-2xl bg-[#E1A728] py-5 font-serif text-2xl font-extrabold text-[#111827] shadow-xl hover:bg-[#c48e1a] active:scale-95 transition"
              >
                +1 POINT TEAM 2
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUndo(2)}
                  className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-bold uppercase text-gray-300 hover:bg-gray-700"
                >
                  Undo (-1)
                </button>
                <button
                  onClick={() => handleLogFault(2)}
                  className="flex-1 rounded-xl bg-red-950 text-red-300 py-2.5 text-xs font-bold uppercase hover:bg-red-900 border border-red-800"
                >
                  Fault
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MATCH CONTROLS TOOLBAR */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/90 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleServer}
              className="rounded-xl bg-[#1F2937] border border-gray-700 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700"
            >
              🔄 Switch Server (Current: {match.serverName})
            </button>
          </div>

          <span className="text-xs font-bold text-emerald-400">
            Umpire Scorekeeper Console Synced
          </span>
        </div>
      </div>
    </div>
  )
}
