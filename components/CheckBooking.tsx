'use client'

import { useState } from 'react'
import { ArrowUpRight, Loader2, Search, SearchX } from 'lucide-react'
import type { BookingRecord } from '@/lib/bookings'

const statusStyle: Record<string, string> = {
  confirmed: 'bg-[#1E5336] text-[#FDFBF7]',
  pending: 'bg-[#E1A728] text-[#1E5336]',
  completed: 'bg-[#222222]/10 text-[#6B756B]',
  expired: 'bg-[#222222]/10 text-[#6B756B]',
  cancelled: 'bg-red-700 text-[#FDFBF7]',
}

export default function CheckBooking() {
  const [reference, setReference] = useState('')
  const [booking, setBooking] = useState<BookingRecord | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'notfound' | 'error'>('idle')

  const search = async () => {
    const ref = reference.trim()
    if (!ref) return
    setState('loading')
    setBooking(null)
    try {
      const res = await fetch(`/api/bookings?reference=${encodeURIComponent(ref)}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const found = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (found) {
        setBooking(found)
        setState('found')
      } else {
        setState('notfound')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <section id="check-booking" className="bg-white px-6 py-14 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border border-[#222222]/10 bg-[#F3F0EC] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14 lg:p-14">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Booking lookup</p>
            <h2 className="mt-3 font-serif text-3xl leading-[0.95] tracking-[-0.045em] text-[#1E5336] sm:text-4xl md:text-5xl">
              Have a reservation?
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#6B756B]">
              Enter the reference number from your confirmation email and check the status of your booking in seconds.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {Object.entries(statusStyle).slice(0, 3).map(([key, cls]) => (
                <span key={key} className={`px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${cls}`}>{key}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex gap-2">
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Enter your reference number e.g. ROL-123456"
                aria-label="Booking reference number"
                className="w-full border border-[#222222]/20 bg-[#FDFBF7] px-4 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-[#6B756B]/50 focus:border-[#1E5336]"
              />
              <button
                onClick={search}
                disabled={state === 'loading' || !reference.trim()}
                className="flex shrink-0 items-center gap-2 border border-[#222222]/20 bg-white px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] disabled:cursor-not-allowed disabled:bg-white disabled:text-[#6B756B]"
              >
                {state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                <span className="hidden sm:inline">Check status</span>
              </button>
            </div>

            <div className="mt-5">
              {state === 'notfound' && (
                <div className="flex items-start gap-2 border border-[#222222]/15 bg-white p-4 text-sm">
                  <SearchX size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-bold text-[#222222]">No booking found</p>
                    <p className="text-[#6B756B]">Double-check the reference you entered. It should look like ROL-123456.</p>
                  </div>
                </div>
              )}
              {state === 'error' && (
                <div className="border border-[#222222]/15 bg-white p-4 text-sm text-red-600">
                  Something went wrong. Please try again.
                </div>
              )}
              {booking && (
                <div className="border border-[#222222]/15 bg-white p-5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Reference</span>
                    <span className="font-bold text-[#1E5336]">{booking.reference}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#222222]/10 py-2">
                    <span className="text-[#6B756B]">Status</span>
                    <span className={`px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${statusStyle[booking.status] || statusStyle.pending}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#222222]/10 py-2">
                    <span className="text-[#6B756B]">Booking</span>
                    <span className="text-right">{booking.itemName}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#222222]/10 py-2">
                    <span className="text-[#6B756B]">Date & time</span>
                    <span>{booking.date} · {booking.time}</span>
                  </div>
                  {booking.nights ? (
                    <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Nights</span><span>{booking.nights}</span></div>
                  ) : booking.hours ? (
                    <div className="flex justify-between border-t border-[#222222]/10 py-2"><span className="text-[#6B756B]">Hours</span><span>{booking.hours}</span></div>
                  ) : null}
                  <div className="flex justify-between border-t border-[#222222]/10 pt-2">
                    <span className="text-[#6B756B]">Total</span>
                    <span className="font-bold text-[#1E5336]">₱{booking.amount.toLocaleString()}</span>
                  </div>
                  <a
                    href={`/pickleball/booking/receipt?ref=${encodeURIComponent(booking.reference)}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:text-[#E1A728]"
                  >
                    View full details <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}