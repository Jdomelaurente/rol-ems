'use client'

import { Suspense } from 'react'
import { ArrowLeft, MapPin } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import CottageBookingForm from '@/components/cottage/cottage-form'

function CottagePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const onSite = searchParams.get('src') === 'qr'

  return (
    <main className="min-h-screen bg-[#F3F0EC] text-[#222222]">
      <header className="border-b border-[#222222]/10 bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <a href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
            ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          </a>
          <div className="flex items-center gap-4">
            <a href="/booking/lookup" className="border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336]">
              Check a booking
            </a>
            <a href="/" className="border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336]">
              Back to home
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 pb-10 pt-10 lg:pt-12">
        <button
          onClick={() => router.push('/#facilities')}
          className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]"
        >
          <ArrowLeft size={14} /> Back to Stay &amp; play
        </button>

        {onSite && (
          <div className="mb-6 flex items-start gap-3 border border-[#1E5336]/25 bg-[#1E5336]/5 px-4 py-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#1E5336]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1E5336]">
                You&apos;re booking at the venue
              </p>
              <p className="mt-1 text-xs leading-5 text-[#6B756B]">
                Pick a cottage or event venue, choose your date, and settle at the counter. Your
                reference number is your pass — show it to our staff.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Cottage &amp; Event</p>
        <h1 className="mt-3 font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-5xl">
          Reserve a cottage or book a venue.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#6B756B]">
          Rent a cottage by the beach for a day or overnight, or book the whole area for your event — the leisure side of the resort, ready when you are.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-36">
        <CottageBookingForm onSite={onSite} onDone={() => router.push('/#facilities')} />
      </section>
    </main>
  )
}

export default function CottagePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F3F0EC] text-xs text-[#6B756B]">
          Loading booking form…
        </main>
      }
    >
      <CottagePageContent />
    </Suspense>
  )
}
