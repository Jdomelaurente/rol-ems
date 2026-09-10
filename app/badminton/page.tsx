'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BadmintonBookingForm from '@/components/badminton/badminton-form'

export default function BadmintonPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#F3F0EC] text-[#222222]">
      <header className="border-b border-[#222222]/10 bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <a href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
            ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          </a>
          <a href="/" className="border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336]">
            Back to home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
        <button
          onClick={() => router.push('/#facilities')}
          className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]"
        >
          <ArrowLeft size={14} /> Back to Stay & play
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Badminton & Games</p>
        <h1 className="mt-4 font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-5xl md:text-6xl">
          Rackets up, game on.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#6B756B]">
          Reserve an air-conditioned badminton court by the hour, then unwind with dart, chess, UNO, and other card and board games — Rackets and shuttlecocks available, just bring your game.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-16">
        <BadmintonBookingForm onDone={() => router.push('/#facilities')} />
      </section>
    </main>
  )
}