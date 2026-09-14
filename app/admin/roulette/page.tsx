'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePickleball } from '@/context/PickleballContext'
import {
  Dices,
  RotateCw,
  Trash2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Users,
  Trophy,
  AlertCircle,
  Sparkles,
  Layers,
  Volleyball,
} from 'lucide-react'

const DEFAULT_COURTS = [
  'Court 1 (Before)',
  'Court 2 (Patience)',
  'Court 3 (Power)',
]

export default function AdminRoulettePage() {
  const { rouletteResults, spinRoulettePairing, deleteRouletteResult, aiQueuePlayers } = usePickleball()

  // Bracket Configuration (Alphabetical: A, B, C, D...)
  const [bracketCount, setBracketCount] = useState<number>(4)

  // Player Pools
  const [poolA, setPoolA] = useState<string[]>([
    'Maria Santos',
    'Coach Mark Rivera',
    'Pedro Cruz',
    'Coach Elena Vance',
    'Dave Gibson',
  ])
  const [poolB, setPoolB] = useState<string[]>([
    'Ana Lopez',
    'Mike Tan',
    'Lisa Mendoza',
    'Carlo Delos Santos',
    'Art Santiago',
  ])

  // New player inputs
  const [newPlayerA, setNewPlayerA] = useState('')
  const [newPlayerB, setNewPlayerB] = useState('')

  // Court assignment preference
  const [selectedCourt, setSelectedCourt] = useState<string>('random')

  // Auto remove from pool option
  const [autoRemoveFromPool, setAutoRemoveFromPool] = useState(false)

  // Spin animation state
  const [isSpinning, setIsSpinning] = useState(false)
  const [tempPlayerA, setTempPlayerA] = useState('')
  const [tempPlayerB, setTempPlayerB] = useState('')
  const [tempBracket, setTempBracket] = useState('')
  const [lastGenerated, setLastGenerated] = useState<{
    playerA: string
    playerB: string
    bracket: string
    court: string
  } | null>(null)

  // Generate alphabetical bracket list: 1 -> ['Bracket A'], 4 -> ['Bracket A', 'Bracket B', 'Bracket C', 'Bracket D']
  const getBrackets = () => {
    const count = Math.max(1, Math.min(26, bracketCount || 1))
    return Array.from({ length: count }, (_, i) => `Bracket ${String.fromCharCode(65 + i)}`)
  }

  const openBrackets = getBrackets()

  // Add to Pool A
  const handleAddPlayerA = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newPlayerA.trim()
    if (!trimmed) return
    if (!poolA.includes(trimmed)) {
      setPoolA((prev) => [...prev, trimmed])
    }
    setNewPlayerA('')
  }

  // Add to Pool B
  const handleAddPlayerB = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newPlayerB.trim()
    if (!trimmed) return
    if (!poolB.includes(trimmed)) {
      setPoolB((prev) => [...prev, trimmed])
    }
    setNewPlayerB('')
  }

  // Remove from Pool A
  const handleRemoveFromPoolA = (name: string) => {
    setPoolA((prev) => prev.filter((p) => p !== name))
  }

  // Remove from Pool B
  const handleRemoveFromPoolB = (name: string) => {
    setPoolB((prev) => prev.filter((p) => p !== name))
  }

  // Quick import from AI Queue
  const handleImportFromQueue = () => {
    const queueNames = aiQueuePlayers.map((p: { name: string }) => p.name)
    if (queueNames.length === 0) return
    const half = Math.ceil(queueNames.length / 2)
    const firstHalf = queueNames.slice(0, half)
    const secondHalf = queueNames.slice(half)

    setPoolA((prev) => Array.from(new Set([...prev, ...firstHalf])))
    setPoolB((prev) => Array.from(new Set([...prev, ...secondHalf])))
  }

  // Spin & generate pairing
  const handleSpinPairing = () => {
    if (isSpinning) return
    if (poolA.length === 0 || poolB.length === 0) {
      alert('Please ensure both Pool A and Pool B have at least one player.')
      return
    }

    setIsSpinning(true)
    setLastGenerated(null)

    let step = 0
    const interval = setInterval(() => {
      const randA = poolA[Math.floor(Math.random() * poolA.length)]
      const randB = poolB[Math.floor(Math.random() * poolB.length)]
      const randBracket = openBrackets[Math.floor(Math.random() * openBrackets.length)]

      setTempPlayerA(randA)
      setTempPlayerB(randB)
      setTempBracket(randBracket)
      step++

      if (step >= 20) {
        clearInterval(interval)
        setIsSpinning(false)

        const finalA = poolA[Math.floor(Math.random() * poolA.length)]
        const finalB = poolB[Math.floor(Math.random() * poolB.length)]
        const finalBracket = openBrackets[Math.floor(Math.random() * openBrackets.length)]
        const finalCourt =
          selectedCourt === 'random'
            ? DEFAULT_COURTS[Math.floor(Math.random() * DEFAULT_COURTS.length)]
            : selectedCourt

        const fullPlacement = `${finalBracket} • ${finalCourt}`

        spinRoulettePairing(finalA, finalB, fullPlacement, 'Pickleball', finalCourt)

        setLastGenerated({
          playerA: finalA,
          playerB: finalB,
          bracket: finalBracket,
          court: finalCourt,
        })

        if (autoRemoveFromPool) {
          setPoolA((prev) => prev.filter((p) => p !== finalA))
          setPoolB((prev) => prev.filter((p) => p !== finalB))
        }
      }
    }, 80)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Header */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2"
              >
                <ArrowLeft size={14} /> Back to Admin Hub
              </Link>
              <h1 className="font-serif text-3xl font-extrabold text-[#1E5336] sm:text-4xl">
                Roulette Pairing Admin
              </h1>
              <p className="mt-1 text-xs text-[#6B756B]">
                Configure alphabetical brackets, manage player pools, and generate official blind pairings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/roulette"
                className="rounded-lg border border-[#1E5336] bg-white px-4 py-2 text-xs font-bold text-[#1E5336] shadow-sm hover:bg-[#1E5336] hover:text-white transition"
              >
                View Public Page
              </Link>
              <span className="rounded-full bg-[#E1A728]/20 border border-[#E1A728] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#111827]">
                Admin Only Access
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TOP CONFIGURATION ROW */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* 1. BRACKET COUNT SETTER */}
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={18} className="text-[#1E5336]" />
              <h3 className="font-serif text-base font-bold text-[#1E5336]">
                Alphabetical Brackets
              </h3>
            </div>
            <p className="text-xs text-[#6B756B] mb-4">
              Set how many brackets are currently open. Generates Bracket A, B, C...
            </p>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-700">Open Brackets:</label>
              <input
                type="number"
                min="1"
                max="26"
                value={bracketCount}
                onChange={(e) => setBracketCount(Math.max(1, Math.min(26, parseInt(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-center text-[#1E5336] focus:border-[#1E5336] focus:outline-none"
              />
            </div>

            {/* Rendered Bracket Badges */}
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
              {openBrackets.map((brk) => (
                <span
                  key={brk}
                  className="rounded bg-[#1E5336]/10 px-2 py-1 text-[11px] font-extrabold text-[#1E5336]"
                >
                  {brk}
                </span>
              ))}
            </div>
          </div>

          {/* 2. COURT SETTING */}
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Volleyball size={18} className="text-[#1E5336]" />
              <h3 className="font-serif text-base font-bold text-[#1E5336]">
                Court Assignment
              </h3>
            </div>
            <p className="text-xs text-[#6B756B] mb-4">
              Designate which court receives newly spun pairs.
            </p>

            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-800 focus:border-[#1E5336] focus:outline-none"
            >
              <option value="random">Randomize (Courts 1, 2, or 3)</option>
              {DEFAULT_COURTS.map((court) => (
                <option key={court} value={court}>
                  {court}
                </option>
              ))}
            </select>

            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
              <input
                type="checkbox"
                id="autoRemove"
                checked={autoRemoveFromPool}
                onChange={(e) => setAutoRemoveFromPool(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#1E5336] focus:ring-[#1E5336]"
              />
              <label htmlFor="autoRemove" className="text-xs text-gray-700 select-none">
                Remove players from pool after spinning
              </label>
            </div>
          </div>

          {/* 3. GENERATOR ACTION CARD */}
          <div className="rounded-xl border-2 border-[#E1A728] bg-gradient-to-br from-[#111827] to-[#1F2937] p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E1A728]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E1A728] border border-[#E1A728]/30">
                <Sparkles size={12} /> Live Generator
              </span>
              <h3 className="mt-2 font-serif text-xl font-bold text-white">
                Generate Blind Pair
              </h3>
              <p className="mt-1 text-xs text-gray-300">
                Randomly pairs 1 player from Pool A with 1 from Pool B and assigns an alphabetical bracket slot.
              </p>
            </div>

            <div className="mt-4">
              <button
                disabled={isSpinning || poolA.length === 0 || poolB.length === 0}
                onClick={handleSpinPairing}
                className={`w-full rounded-xl bg-[#E1A728] py-3.5 px-4 font-serif text-sm font-extrabold text-[#111827] shadow transition hover:bg-[#c48e1a] flex items-center justify-center gap-2 ${
                  isSpinning || poolA.length === 0 || poolB.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'active:scale-95'
                }`}
              >
                <RotateCw size={16} className={isSpinning ? 'animate-spin' : ''} />
                {isSpinning ? 'SPINNING WHEELS...' : 'GENERATE / SPIN PAIR'}
              </button>
            </div>
          </div>
        </div>

        {/* SPINNING ANIMATION / RESULT PREVIEW */}
        {isSpinning && (
          <div className="mb-8 rounded-2xl border-2 border-[#E1A728] bg-[#111827] p-6 text-center text-white shadow-xl animate-pulse">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#E1A728]">
              ROULETTE WHEELS SPINNING
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xl font-serif font-bold">
              <span className="text-white bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                {tempPlayerA || 'Pool A...'}
              </span>
              <span className="text-[#E1A728] text-2xl">&</span>
              <span className="text-[#E1A728] bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                {tempPlayerB || 'Pool B...'}
              </span>
              <span className="text-emerald-400 bg-emerald-950/80 px-4 py-2 rounded-lg border border-emerald-600/40 text-sm font-sans">
                {tempBracket || 'Bracket...'}
              </span>
            </div>
          </div>
        )}

        {/* RECENTLY GENERATED RESULT BANNER */}
        {lastGenerated && !isSpinning && (
          <div className="mb-8 rounded-2xl border-2 border-emerald-500 bg-emerald-950/90 p-6 text-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">
                  <CheckCircle2 size={12} /> Successfully Paired & Saved
                </span>
                <h3 className="mt-1 font-serif text-2xl font-extrabold">
                  {lastGenerated.playerA} <span className="text-[#E1A728]">&</span> {lastGenerated.playerB}
                </h3>
                <p className="mt-1 text-xs text-emerald-300">
                  Assigned to <strong className="text-white">{lastGenerated.bracket}</strong> on {lastGenerated.court}
                </p>
              </div>
              <button
                onClick={() => setLastGenerated(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* POOL MANAGEMENT SECTION */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* POOL A */}
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E5336]">
                  Pool A ({poolA.length} Players)
                </h3>
                <p className="text-[11px] text-[#6B756B]">First member of blind pair</p>
              </div>
              {aiQueuePlayers.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportFromQueue}
                  className="text-[10px] font-bold text-[#1E5336] hover:underline"
                >
                  Import from AI Queue
                </button>
              )}
            </div>

            {/* Add Player A Form */}
            <form onSubmit={handleAddPlayerA} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add player name to Pool A..."
                value={newPlayerA}
                onChange={(e) => setNewPlayerA(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#1E5336] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-[#1E5336] px-3 py-2 text-xs font-bold text-white hover:bg-[#163e28] transition"
              >
                <Plus size={14} /> Add
              </button>
            </form>

            {/* Player List */}
            {poolA.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Pool A is empty. Add players above.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {poolA.map((player) => (
                  <div
                    key={player}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-xs"
                  >
                    <span className="font-semibold text-gray-800">{player}</span>
                    <button
                      onClick={() => handleRemoveFromPoolA(player)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Remove from pool"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* POOL B */}
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E5336]">
                  Pool B ({poolB.length} Players)
                </h3>
                <p className="text-[11px] text-[#6B756B]">Second member of blind pair</p>
              </div>
              {aiQueuePlayers.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportFromQueue}
                  className="text-[10px] font-bold text-[#1E5336] hover:underline"
                >
                  Import from AI Queue
                </button>
              )}
            </div>

            {/* Add Player B Form */}
            <form onSubmit={handleAddPlayerB} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add player name to Pool B..."
                value={newPlayerB}
                onChange={(e) => setNewPlayerB(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#1E5336] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-[#E1A728] px-3 py-2 text-xs font-bold text-[#111827] hover:bg-[#c48e1a] transition"
              >
                <Plus size={14} /> Add
              </button>
            </form>

            {/* Player List */}
            {poolB.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Pool B is empty. Add players above.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {poolB.map((player) => (
                  <div
                    key={player}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-xs"
                  >
                    <span className="font-semibold text-gray-800">{player}</span>
                    <button
                      onClick={() => handleRemoveFromPoolB(player)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Remove from pool"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GENERATED ROULETTE LOG TABLE WITH DELETE ACTIONS */}
        <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1E5336]">
                Roulette Pairings History ({rouletteResults.length})
              </h3>
              <p className="text-xs text-[#6B756B]">
                Review all blind pairs generated. Admins can delete or remove any pairing entry.
              </p>
            </div>
            <span className="rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              Synced with Public Page
            </span>
          </div>

          {rouletteResults.length === 0 ? (
            <div className="py-12 text-center">
              <Dices size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-500">No roulette pairings generated yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Add players to Pool A and B and click "Generate / Spin Pair" above to create official blind matchups.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="py-2.5">Pairing / Matchup</th>
                    <th className="py-2.5">Bracket & Court Allocation</th>
                    <th className="py-2.5">Date & Time</th>
                    <th className="py-2.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rouletteResults.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 font-semibold text-[#111827]">
                        <span className="text-[#1E5336]">{res.playerA}</span>
                        <span className="mx-1 text-[#E1A728] font-bold">&</span>
                        <span className="text-[#1E5336]">{res.playerB}</span>
                      </td>
                      <td className="py-3">
                        <span className="inline-block rounded bg-[#1E5336]/10 px-2 py-0.5 font-bold text-[#1E5336]">
                          {res.bracketPlacement}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 font-mono text-[11px]">
                        {res.timestamp}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteRouletteResult(res.id)}
                          className="inline-flex items-center gap-1 rounded bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                          title="Delete this pairing"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
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
