'use client'

import { useState } from 'react'
import { courts, courtSchedule } from '@/lib/data'
import type { Court } from '@/lib/data'
import { usePickleball } from '@/context/PickleballContext'
import { addBooking, getBookedTimes } from '@/lib/bookings'
import ConsentCheckbox from '@/components/legal/ConsentCheckbox'
import Navbar from '@/components/layout/Navbar'
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, Check, ArrowRight, ArrowLeft,
  Loader2, Wallet
} from 'lucide-react'

type Step = 'courts' | 'schedule' | 'details' | 'review' | 'confirm'
type PaymentMethod = 'Online Payment' | 'Pay at Counter'

const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']

const statusConfig = {
  available: { label: 'AVAILABLE', badge: 'bg-[#1E5336] text-[#FDFBF7]' },
  reserved: { label: 'RESERVED', badge: 'bg-[#E1A728] text-[#1E5336]' },
  occupied: { label: 'IN USE / OCCUPIED', badge: 'bg-red-700 text-white' },
  'open-play': { label: 'OPEN PLAY', badge: 'bg-blue-800 text-white' },
}

const steps: { key: Step; label: string }[] = [
  { key: 'courts', label: 'Pick Court' },
  { key: 'schedule', label: 'Date & Time' },
  { key: 'details', label: 'Your Details & Paddle' },
  { key: 'review', label: 'Review & Pay' },
]

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function BookingPage() {
  const { paddles, rentPaddle, addReservation } = usePickleball()

  const [step, setStep] = useState<Step>('courts')
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [viewSchedule, setViewSchedule] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [hours, setHours] = useState(1)
  const [players, setPlayers] = useState(2)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('Online Payment')
  const [paying, setPaying] = useState(false)
  const [confirmedRef, setConfirmedRef] = useState('')
  const [consent, setConsent] = useState(false)

  // Paddle Rental Option
  const [addPaddle, setAddPaddle] = useState(false)
  const [selectedPaddleId, setSelectedPaddleId] = useState('')
  const [rentedPaddleName, setRentedPaddleName] = useState('')

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))

  const courtId = selectedCourt?.id || ''
  const schedule = courtSchedule[courtId] || []
  const bookedSlotLabels = schedule.filter((s) => s.status !== 'available').map((s) => s.time)

  const facilityKey = selectedCourt ? `pickleball:${selectedCourt.name}` : ''

  const selectedPaddle = paddles.find((p) => p.id === selectedPaddleId)
  const paddleCost = addPaddle && selectedPaddle ? selectedPaddle.price : 0
  const hourlyRate = 350
  const courtTotal = hourlyRate * hours
  const total = courtTotal + paddleCost

  const canProceedSchedule = !!date && !!time
  const emailValid = /\S+@\S+\.\S+/.test(email.trim())
  const canProceedDetails = name.trim().length > 1 && contact.trim().length > 6 && emailValid
  const currentIndex = steps.findIndex((s) => s.key === step)

  const go = (s: Step) => setStep(s)

  const goBack = () => {
    if (step === 'schedule') go('courts')
    else if (step === 'details') go('schedule')
    else if (step === 'review') go('details')
  }

  const canNext = step === 'schedule'
    ? canProceedSchedule
    : step === 'details'
      ? canProceedDetails
      : step === 'review'
        ? consent && !paying
        : false

  const goNext = () => {
    if (step === 'schedule') go('details')
    else if (step === 'details') go('review')
    else if (step === 'review') confirm()
  }

  const bookingLabel = () => {
    const paddleText = addPaddle && selectedPaddle ? ` · Paddle rental: ${selectedPaddle.name}` : ''
    return `Court · ${selectedCourt?.name} (${hours} hr${hours > 1 ? 's' : ''})${paddleText}`
  }

  const persistBooking = async () => {
    const record = await addBooking({
      facility: facilityKey,
      itemName: bookingLabel(),
      date,
      time,
      hours,
      guests: players,
      name,
      contact,
      email,
      amount: total,
      payment: payment === 'Pay at Counter' ? 'cash' : 'online',
    })

    // Keep the pickleball hub state hydrated with this reservation.
    let pRentalId: string | undefined
    let pRentalName: string | undefined
    if (addPaddle && selectedPaddle) {
      const pRental = rentPaddle({
        paddleId: selectedPaddle.id,
        paddleName: selectedPaddle.name,
        renterName: name,
        renterContact: contact,
        attachedToType: 'Court Booking',
        courtOrSession: `${selectedCourt?.name} (${date} @ ${time})`,
        date,
        time,
        duration: `${hours} Hour(s)`,
        totalPrice: selectedPaddle.price,
        paymentMethod: payment === 'Pay at Counter' ? 'Pay at Counter' : 'Online Gateway',
        paymentStatus: payment === 'Pay at Counter' ? 'paid' : 'pending',
        status: payment === 'Pay at Counter' ? 'Reserved' : 'Active',
      })
      pRentalId = pRental.id
      pRentalName = selectedPaddle.name
      setRentedPaddleName(selectedPaddle.name)
    }

    addReservation({
      bookingId: record.reference,
      customerName: name,
      court: selectedCourt?.name || 'Court 1',
      date,
      time,
      duration: hours,
      players,
      paymentMethod: payment === 'Pay at Counter' ? 'Pay at Counter' : 'Online Gateway',
      paymentStatus: payment === 'Pay at Counter' ? 'paid' : 'pending',
      bookingStatus: 'confirmed',
      total,
      paddleRentalId: pRentalId,
      paddleRentalName: pRentalName,
    })

    setConfirmedRef(record.reference)
    return record
  }

  const confirm = async () => {
    setPaying(true)
    let record
    try {
      record = await persistBooking()
    } catch (err) {
      setPaying(false)
      const conflict = (err as Error & { conflict?: boolean }).conflict
      if (conflict) {
        alert((err as Error).message || 'This slot is no longer available. Please pick another date or time.')
        setStep('schedule')
        return
      }
      alert((err as Error).message || 'Could not create your booking. Please try again.')
      return
    }

    if (payment === 'Pay at Counter') {
      setPaying(false)
      setStep('confirm')
      return
    }

    // Online Payment → PayMongo checkout.
    const label = bookingLabel()
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          email,
          amount: total,
          description: `ROL-EMS · ${label} · ${date} at ${time}`,
          metadata: {
            reference: record.reference,
            booking: label,
            date,
            time,
            guests: players,
            hours,
            email,
            facility: facilityKey,
            addOns: addPaddle && selectedPaddle ? `Paddle rental: ${selectedPaddle.name}` : undefined,
          },
          cancelUrl: '/pickleball/booking',
        }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        if (data.id) localStorage.setItem('paymongo_session_id', data.id)
        window.location.href = data.checkout_url
        return
      }
      throw new Error(data.error || 'Payment could not start')
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error && err.message ? err.message : 'Something went wrong starting your payment. Please try again.'
      alert(msg)
      setPaying(false)
    }
  }

  const reset = () => {
    setStep('courts')
    setSelectedCourt(null)
    setDate(''); setTime(''); setHours(1); setPlayers(2)
    setName(''); setContact(''); setEmail('')
    setAddPaddle(false); setSelectedPaddleId('')
    setPayment('Online Payment')
    setViewSchedule(null)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />
      {/* Header */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Reservation</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Book a Pickleball Court</h1>
          <p className="mt-2 text-sm text-[#6B756B]">Reserve an entire private court for your selected date and time.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {step !== 'confirm' && (
          <div className="mb-8 border-b border-[#222222]/10 bg-[#FDFBF7] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              {steps.map((s, i) => {
                const isDone = i < currentIndex
                const isActive = i === currentIndex
                return (
                  <div key={s.key} className="flex flex-1 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isDone || isActive ? 'bg-[#1E5336] text-[#FDFBF7]' : 'border border-[#222222]/20 text-[#6B756B]'
                      }`}
                    >
                      {isDone ? <Check size={12} /> : i + 1}
                    </span>
                    <span className={`hidden text-[10px] uppercase tracking-[0.12em] sm:block ${isActive ? 'font-bold text-[#1E5336]' : isDone ? 'text-[#6B756B]' : 'text-[#6B756B]/60'}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP: SELECT COURT */}
        {step === 'courts' && (
          <div>
            <h2 className="font-serif text-2xl text-[#1E5336] mb-4">Which court would you like to reserve?</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {courts.map((c) => {
                const cfg = statusConfig[c.status]
                const isBookable = c.status === 'available'

                return (
                  <div key={c.id} className="border border-[#222222]/15 bg-[#FDFBF7] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-xl text-[#1E5336]">{c.name}</p>
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-4 text-[#6B756B]">{c.detail}</p>
                      <p className="mt-3 text-sm font-bold text-[#1E5336]">{c.price}</p>
                    </div>

                    <div className="mt-6 border-t border-[#222222]/10 pt-4 flex gap-2">
                      <button
                        onClick={() => setViewSchedule(viewSchedule === c.id ? null : c.id)}
                        className="flex-1 border border-[#222222]/20 py-2 text-[10px] uppercase tracking-[0.12em] text-[#6B756B] hover:border-[#1E5336]"
                      >
                        Schedule
                      </button>
                      <button
                        disabled={!isBookable}
                        onClick={() => {
                          setSelectedCourt(c)
                          go('schedule')
                        }}
                        className={`flex-1 py-2 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                          isBookable ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                        }`}
                      >
                        {isBookable ? 'Book Court' : 'Occupied'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP: SCHEDULE */}
        {step === 'schedule' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Selected Court</p>
            <h2 className="font-serif text-3xl text-[#1E5336] mt-1">{selectedCourt?.name}</h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="relative">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Date</span>
                <button
                  type="button"
                  onClick={() => { setCalendarOpen((v) => !v); setTimeOpen(false) }}
                  className="mt-2 flex w-full items-center justify-between border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none"
                >
                  <span className={date ? '' : 'text-[#6B756B]/50'}>{date || 'Select a date'}</span>
                  <CalendarDays size={16} className="text-[#1E5336]" />
                </button>
                {calendarOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 border border-[#222222]/15 bg-[#FDFBF7] p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <button onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1 text-[#6B756B]"><ChevronLeft size={16} /></button>
                      <span className="text-sm font-bold text-[#1E5336]">{monthLabel}</span>
                      <button onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1 text-[#6B756B]"><ChevronRight size={16} /></button>
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="pb-1 text-[10px] uppercase text-[#6B756B]">{d}</span>
                      ))}
                      {cells.map((c, i) => {
                        if (!c) return <span key={i} />
                        const iso = isoDate(c)
                        const disabled = c < today
                        const selected = iso === date
                        return (
                          <button
                            key={i}
                            disabled={disabled}
                            onClick={() => { setDate(iso); setCalendarOpen(false) }}
                            className={`h-8 text-xs ${selected ? 'bg-[#1E5336] text-[#FDFBF7] font-bold' : disabled ? 'text-[#6B756B]/30' : 'hover:bg-[#E1A728]'}`}
                          >
                            {c.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Start Time</span>
                <button
                  type="button"
                  onClick={() => { setTimeOpen((v) => !v); setCalendarOpen(false) }}
                  className="mt-2 flex w-full items-center justify-between border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none"
                >
                  <span className={time ? '' : 'text-[#6B756B]/50'}>{time || 'Select start time'}</span>
                  <Clock size={16} className="text-[#1E5336]" />
                </button>
                {timeOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto border border-[#222222]/15 bg-[#FDFBF7] p-2 shadow-xl">
                    {loadingSlots && <p className="px-3 py-2 text-sm text-[#6B756B]">Checking availability…</p>}
                    {!loadingSlots && timeSlots.map((slot) => {
                      const taken = bookedSlotLabels.includes(slot) || (date && bookedTimes.includes(slot))
                      return (
                        <button
                          key={slot}
                          disabled={taken}
                          onClick={() => { setTime(slot); setTimeOpen(false) }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                            taken ? 'cursor-not-allowed text-[#6B756B]/40 line-through' : time === slot ? 'bg-[#1E5336] text-[#FDFBF7] font-bold' : 'hover:bg-[#E1A728]'
                          }`}
                        >
                          <span>{slot}</span>
                          {taken && <span className="text-[9px] uppercase">Booked</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP: DETAILS & PADDLE RENTAL */}
        {step === 'details' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Reservation Info</p>
            <h2 className="font-serif text-3xl text-[#1E5336] mt-1">Player Details & Paddle Add-on</h2>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Contact Number</span>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Email <span className="normal-case text-red-600">(required)</span></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maria@gmail.com"
                  className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                />
                <span className="mt-1.5 block text-[10px] text-[#6B756B]/70">We&apos;ll send your receipt and confirmation to this email.</span>
              </label>
            </div>

            {/* Optional Paddle Rental */}
            <div className="mt-8">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Paddle rental (optional)</span>
              <div className="mt-3 divide-y divide-[#222222]/10 border border-[#222222]/15">
                {paddles.filter((p) => p.availability === 'Available' && p.quantityAvailable > 0).map((p) => {
                  const selected = addPaddle && selectedPaddleId === p.id
                  return (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#222222]">
                          {p.name}
                          <span className="ml-2 font-normal text-[#1E5336]">₱{p.price} / rental</span>
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#6B756B]">{p.brand} · {p.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {selected && <span className="text-sm font-bold text-[#1E5336]">₱{p.price}</span>}
                        <button
                          aria-label={selected ? `Remove ${p.name}` : `Add ${p.name}`}
                          onClick={() => {
                            if (selected) {
                              setAddPaddle(false)
                              setSelectedPaddleId('')
                            } else {
                              setAddPaddle(true)
                              setSelectedPaddleId(p.id)
                            }
                          }}
                          className={`h-8 w-8 border text-lg leading-none transition ${
                            selected ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]' : 'border-[#222222]/20 text-[#222222] hover:border-[#1E5336]'
                          }`}
                        >
                          {selected ? '−' : '+'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* STEP: REVIEW & PAY */}
        {step === 'review' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Step 4 · Review & payment</p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Almost there.</h2>

            <div className="mt-6 divide-y divide-[#222222]/10 border border-[#222222]/15">
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Court</span>
                <span>{selectedCourt?.name}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Date & time</span>
                <span>{date} · {time}</span>
              </div>
              {addPaddle && selectedPaddle && (
                <div className="px-4 py-3 text-sm">
                  <span className="text-[#6B756B]">Add-on</span>
                  <div className="mt-1.5 text-[#222222]">
                    {selectedPaddle.name}
                    <span className="ml-1 text-[#6B756B]">₱{selectedPaddle.price}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Guest</span>
                <span>{name} · {contact}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Email</span>
                <span>{email}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#6B756B]">Total</span>
                <span className="font-bold text-[#1E5336]">₱{total}</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Payment method</span>
              <div className="mt-2 flex flex-col gap-2">
                {([
                  { id: 'Online Payment', label: 'Online (GCash / card)' },
                  { id: 'Pay at Counter', label: 'Pay at the venue' },
                ] as { id: PaymentMethod; label: string }[]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition ${payment === m.id ? 'border-[#1E5336] bg-[#F3F0EC] text-[#1E5336]' : 'border-[#222222]/20 text-[#6B756B] hover:border-[#1E5336]/40'}`}
                  >
                    <span className="flex items-center gap-2.5">
                      {m.id === 'Online Payment' ? <Wallet size={16} /> : <span className="h-4 w-4 rounded-full border border-current" />}
                      {m.label}
                    </span>
                    <span className={`h-3 w-3 rounded-full border border-current ${payment === m.id ? 'bg-current' : ''}`} />
                  </button>
                ))}
              </div>
              {payment === 'Online Payment' && (
                <p className="mt-2 text-[10px] text-[#6B756B]">
                  You&apos;ll be redirected to our payment page to pay by GCash, card, or other e-wallets.
                </p>
              )}
            </div>

            <ConsentCheckbox id="book-court-consent" agreed={consent} onChange={setConsent} />
          </div>
        )}

        {/* STEP: CONFIRMED */}
        {step === 'confirm' && (
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8">
            <div className="flex flex-col items-center py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E5336] text-[#FDFBF7]">
                <Check size={26} />
              </span>
              <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Reservation confirmed</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
                Your court is on hold for {date} at {time}. A confirmation and receipt have been sent to {email}.
                {payment === 'Pay at Counter' && ' You may pay at the venue when you arrive.'}
              </p>
              <div className="mt-6 w-full max-w-sm border border-[#222222]/15 p-4 text-left text-sm">
                <div className="flex justify-between py-1"><span className="text-[#6B756B]">Reference</span><span className="font-bold text-[#1E5336]">{confirmedRef}</span></div>
                <div className="flex justify-between py-1"><span className="text-[#6B756B]">Court</span><span>{selectedCourt?.name} · {hours} hr</span></div>
                {rentedPaddleName && (
                  <div className="flex justify-between py-1"><span className="text-[#6B756B]">Add-on</span><span>{rentedPaddleName}</span></div>
                )}
                <div className="flex justify-between py-1"><span className="text-[#6B756B]">Guest</span><span>{name}</span></div>
                <div className="flex justify-between py-1"><span className="text-[#6B756B]">Payment</span><span>{payment === 'Online Payment' ? 'Online (GCash / card)' : 'Pay at the venue'}</span></div>
                <div className="mt-2 flex justify-between border-t border-[#222222]/15 pt-2"><span className="text-[#6B756B]">Total</span><span className="font-bold text-[#1E5336]">₱{total}</span></div>
              </div>
            </div>
          </div>
        )}

        {step !== 'confirm' && step !== 'courts' && (
          <div className="flex items-center justify-between border-t border-[#222222]/10 bg-[#FDFBF7] px-6 py-5">
            <button onClick={goBack} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={goNext}
              disabled={!canNext || paying}
              className={`flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-[0.16em] transition ${canNext && !paying ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]' : 'cursor-not-allowed bg-[#222222]/10 text-[#6B756B]'}`}
            >
              {paying ? (
                <><Loader2 size={14} className="animate-spin" /> Starting payment…</>
              ) : step === 'review' ? (
                payment === 'Online Payment' ? 'Pay now' : 'Confirm & book'
              ) : (
                <>Continue <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="flex justify-center gap-4 border-t border-[#222222]/10 bg-[#FDFBF7] px-6 py-5">
            <a
              href={`/pickleball/booking/receipt?ref=${encodeURIComponent(confirmedRef)}`}
              className="border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
            >
              View receipt
            </a>
            <button onClick={reset} className="bg-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] hover:bg-[#153d27]">
              Book another
            </button>
          </div>
        )}
      </div>
    </div>
  )
}