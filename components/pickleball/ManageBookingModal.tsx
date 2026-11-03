'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, X, AlertTriangle, CheckCircle2, Calendar, Clock, User, DollarSign, ArrowUpRight } from 'lucide-react'
import { usePickleball } from '@/context/PickleballContext'

interface ManageBookingModalProps {
  isOpen: boolean
  onClose: () => void
  initialReference?: string
}

export default function ManageBookingModal({
  isOpen,
  onClose,
  initialReference = '',
}: ManageBookingModalProps) {
  const { cancelReservation, reservations } = usePickleball()
  const [reference, setReference] = useState(initialReference)
  const [booking, setBooking] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const lookupReference = useCallback(
    async (codeToSearch: string) => {
      const cleanRef = codeToSearch.trim().toUpperCase()
      if (!cleanRef) return

      setLoading(true)
      setFeedback(null)
      setBooking(null)
      setConfirmCancel(false)

      try {
        const res = await fetch(`/api/bookings?reference=${encodeURIComponent(cleanRef)}`)
        if (!res.ok) throw new Error('Failed to query database')
        const data = await res.json()
        const found = Array.isArray(data) && data.length > 0 ? data[0] : null

        if (found) {
          setBooking(found)
        } else {
          // Fallback search in pickleball context reservations
          const contextRes = reservations.find(
            (r) => r.bookingId?.toUpperCase() === cleanRef || r.id?.toUpperCase() === cleanRef
          )
          if (contextRes) {
            setBooking({
              reference: contextRes.bookingId || cleanRef,
              itemName: `Court · ${contextRes.court} (${contextRes.duration} hrs)`,
              facility: `pickleball:${contextRes.court}`,
              date: contextRes.date,
              time: contextRes.time,
              hours: contextRes.duration,
              guests: contextRes.players,
              name: contextRes.customerName,
              amount: contextRes.total,
              payment: contextRes.paymentMethod,
              status: contextRes.bookingStatus,
            })
          } else {
            setFeedback({ type: 'error', message: 'No reservation found matching this reference code.' })
          }
        }
      } catch {
        setFeedback({ type: 'error', message: 'Error communicating with booking service.' })
      } finally {
        setLoading(false)
      }
    },
    [reservations]
  )

  useEffect(() => {
    if (isOpen) {
      setFeedback(null)
      setConfirmCancel(false)
      if (initialReference?.trim()) {
        const clean = initialReference.trim().toUpperCase()
        setReference(clean)
        lookupReference(clean)
      } else {
        setReference('')
        setBooking(null)
      }
    }
  }, [isOpen, initialReference, lookupReference])

  if (!isOpen) return null

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    lookupReference(reference)
  }

  const handleCancelBooking = async () => {
    if (!booking) return
    setCancelling(true)
    setFeedback(null)

    try {
      // 1. Cancel in database
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      // 2. Also cancel in PickleballContext to immediately free up court
      const matchingRes = reservations.find(
        (r) => r.bookingId === booking.reference || r.id === booking.reference
      )
      if (matchingRes) {
        cancelReservation(matchingRes.id)
      }

      setBooking({ ...booking, status: 'cancelled' })
      setFeedback({
        type: 'success',
        message: 'Your booking has been cancelled successfully. The court slot is now released.',
      })
      setConfirmCancel(false)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Could not cancel booking. Please contact support.' })
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-none border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Reservation Management</span>
            <h3 className="font-serif text-2xl tracking-[-0.03em] text-[#1E5336]">Manage Your Court Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-none p-1 text-[#6B756B] hover:bg-[#222222]/10 hover:text-black transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Reference Search Form */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            placeholder="Enter reference (e.g. ROL-123456 or PB-123456)"
            className="flex-1 rounded-none border border-[#222222]/20 bg-white px-3.5 py-2.5 text-xs font-semibold uppercase outline-none focus:border-[#1E5336]"
          />
          <button
            type="submit"
            disabled={loading || !reference.trim()}
            className="flex items-center gap-1.5 rounded-none bg-[#1E5336] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-50 transition"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Lookup</span>
          </button>
        </form>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 rounded-none border p-3 text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-50 text-emerald-800'
                : 'border-rose-500/30 bg-rose-50 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="shrink-0 text-rose-600 mt-0.5" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Booking Details Card */}
        {booking && (
          <div className="mt-5 rounded-none border border-[#222222]/15 bg-white p-5 space-y-3.5 shadow-sm text-xs">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2.5">
              <div>
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Reference</span>
                <p className="text-sm font-bold text-[#1E5336]">{booking.reference}</p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-none text-[10px] uppercase tracking-[0.12em] ${
                  booking.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : booking.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#6B756B] text-[10px] uppercase tracking-[0.14em]">Reserved Item</span>
                <p className="font-bold text-[#222222]">{booking.itemName}</p>
              </div>
              <div>
                <span className="text-[#6B756B] text-[10px] uppercase tracking-[0.14em]">Booked For</span>
                <p className="font-bold text-[#222222]">{booking.name || 'Guest'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#1E5336]" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#1E5336]" />
                <span>{booking.time} ({booking.hours || 1} hr{booking.hours > 1 ? 's' : ''})</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#222222]/10 pt-2.5">
              <span className="text-[#6B756B] font-semibold">Total Price</span>
              <span className="text-base font-bold text-[#1E5336]">₱{booking.amount?.toLocaleString()}</span>
            </div>

            {/* Actions */}
            {booking.status !== 'cancelled' && (
              <div className="pt-2">
                {!confirmCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="w-full rounded-none border border-rose-300 bg-rose-50 py-2 text-[10px] uppercase tracking-[0.16em] text-rose-700 hover:bg-rose-100 transition"
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <div className="rounded-none border border-rose-300 bg-rose-50 p-3 text-center space-y-2">
                    <p className="text-xs font-bold text-rose-900">
                      Are you sure you want to cancel this court reservation?
                    </p>
                    <p className="text-[10px] text-rose-700">
                      This will immediately release the court slot for other players.
                    </p>
                    <div className="flex gap-2 justify-center pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(false)}
                        className="rounded-none border border-[#222222]/20 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#222222]"
                      >
                        Keep Booking
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="rounded-none bg-rose-700 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white hover:bg-rose-800 disabled:opacity-50"
                      >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
