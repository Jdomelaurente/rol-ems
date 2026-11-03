'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { courts, courtSchedule } from '@/lib/data'
import type { Court } from '@/lib/data'
import { usePickleball } from '@/context/PickleballContext'
import { addBooking } from '@/lib/bookings'
import ConsentCheckbox from '@/components/legal/ConsentCheckbox'
import Navbar from '@/components/layout/Navbar'
import PickleballCourtIllustration from '@/components/pickleball/PickleballCourtIllustration'
import CourtsSection from '@/components/pickleball/CourtsSection'
import ManageBookingModal from '@/components/pickleball/ManageBookingModal'
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, Check, ArrowRight, ArrowLeft,
  Loader2, Sparkles, CheckCircle2, AlertCircle, Calendar, Users, Layers,
  ShieldCheck, HelpCircle, Eye, Wrench
} from 'lucide-react'

import {
  toIso,
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateEndTime,
  getReservationCountdown,
  isCourtSlotOverlapping
} from '@/lib/booking-overlap'

type Step = 'courts' | 'schedule' | 'details' | 'review' | 'confirm'
type PaymentMethod = 'Online Payment' | 'Pay at Counter'

// 1-hour time slots from 7:00 AM to 10:00 PM
const allTimeOptions = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
  '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
]

const startOptions = allTimeOptions.slice(0, allTimeOptions.length - 1) // 7:00 AM to 9:00 PM
const endOptions = allTimeOptions.slice(1) // 8:00 AM to 10:00 PM

const statusConfig: Record<string, { label: string; badge: string; border: string }> = {
  available: {
    label: 'AVAILABLE',
    badge: 'bg-emerald-700 text-white shadow-xs',
    border: 'border-emerald-600/40 ring-1 ring-emerald-500/20',
  },
  reserved: {
    label: 'RESERVED',
    badge: 'bg-amber-600 text-white shadow-xs',
    border: 'border-amber-500/30',
  },
  occupied: {
    label: 'IN USE / OCCUPIED',
    badge: 'bg-rose-700 text-white shadow-xs',
    border: 'border-rose-600/30',
  },
  maintenance: {
    label: 'MAINTENANCE',
    badge: 'bg-orange-600 text-white shadow-xs',
    border: 'border-orange-500/30',
  },
  'open-play': {
    label: 'OPEN PLAY',
    badge: 'bg-blue-700 text-white shadow-xs',
    border: 'border-blue-500/30',
  },
}

const steps: { key: Step; label: string }[] = [
  { key: 'courts', label: '1. Select Court' },
  { key: 'schedule', label: '2. Date & Hours' },
  { key: 'details', label: '3. Details & Add-ons' },
  { key: 'review', label: '4. Review & Confirm' },
]

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function BookingContent() {
  const {
    paddles,
    rentPaddle,
    addReservation,
    cancelReservation,
    reservations = [],
    openPlaySessions = [],
    courtOverrides = {},
  } = usePickleball()

  const searchParams = useSearchParams()
  const courtParam = searchParams.get('court')

  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = toIso(today)

  const [step, setStep] = useState<Step>('courts')
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [viewScheduleId, setViewScheduleId] = useState<string | null>(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)

  // Auto-select court if passed in URL (e.g. from Open Play)
  useEffect(() => {
    if (courtParam) {
      const clean = courtParam.toLowerCase().trim()
      const match = courts.find(
        (c) => c.id === clean || c.name.toLowerCase().includes(clean) || clean.includes(c.id)
      )
      if (match) {
        setSelectedCourt(match)
        setStep('schedule')
      }
    }
  }, [courtParam])

  // Booking Form State
  const [date, setDate] = useState(() => todayIso)
  const [startTime, setStartTime] = useState('8:00 AM')
  const [endTime, setEndTime] = useState('10:00 AM')
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

  // Calendar State
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  // Calculate Duration
  const startMin = parseTimeToMinutes(startTime)
  const endMin = parseTimeToMinutes(endTime)
  const isTimeOrderValid = endMin > startMin
  const durationMinutes = isTimeOrderValid ? endMin - startMin : 0
  const durationHours = durationMinutes / 60

  // Rates
  const hourlyRate = 350
  const courtTotal = durationHours * hourlyRate
  const selectedPaddle = paddles.find((p) => p.id === selectedPaddleId)
  const paddleCost = addPaddle && selectedPaddle ? selectedPaddle.price : 0
  const total = courtTotal + paddleCost

  // Overlap Validation for Selected Date & Court
  const overlapConflict = useMemo(() => {
    if (!selectedCourt || !date || !startTime || !endTime || !isTimeOrderValid) return null
    const selectedCourtClean = selectedCourt.name.toLowerCase().trim()

    // 1. Check existing reservations
    const conflictRes = reservations.find((r) => {
      if (r.bookingStatus === 'cancelled') return false
      const rCourtClean = r.court.toLowerCase().trim()
      const sameCourt =
        rCourtClean === selectedCourtClean ||
        rCourtClean.includes(selectedCourtClean) ||
        selectedCourtClean.includes(rCourtClean)
      if (!sameCourt) return false
      const rEnd = calculateEndTime(r.time, r.duration || 1)
      return isCourtSlotOverlapping(date, startTime, endTime, r.date, r.time, rEnd)
    })
    if (conflictRes) {
      const rEnd = calculateEndTime(conflictRes.time, conflictRes.duration || 1)
      return `Court is already booked by ${conflictRes.customerName} on ${conflictRes.date} from ${conflictRes.time} to ${rEnd}.`
    }

    // 2. Check open play sessions
    const conflictOp = openPlaySessions.find((s) => {
      if (s.status === 'cancelled') return false
      const sCourtClean = s.court.toLowerCase().trim()
      const sameCourt =
        sCourtClean === selectedCourtClean ||
        sCourtClean.includes(selectedCourtClean) ||
        selectedCourtClean.includes(sCourtClean)
      if (!sameCourt) return false
      return isCourtSlotOverlapping(date, startTime, endTime, s.date, s.startTime, s.endTime)
    })
    if (conflictOp) {
      return `Court is assigned to Open Play session (${conflictOp.startTime} – ${conflictOp.endTime}).`
    }

    return null
  }, [selectedCourt, date, startTime, endTime, isTimeOrderValid, reservations, openPlaySessions])

  // Calendar calculations
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))

  // Proceed conditions
  const canProceedSchedule = !!date && !!startTime && !!endTime && isTimeOrderValid && !overlapConflict
  const emailValid = /\S+@\S+\.\S+/.test(email.trim())
  const canProceedDetails = name.trim().length > 1 && contact.trim().length > 6 && emailValid
  const currentIndex = steps.findIndex((s) => s.key === step)

  const go = (s: Step) => setStep(s)

  const goBack = () => {
    if (step === 'schedule') go('courts')
    else if (step === 'details') go('schedule')
    else if (step === 'review') go('details')
  }

  const goNext = () => {
    if (step === 'schedule' && canProceedSchedule) go('details')
    else if (step === 'details' && canProceedDetails) go('review')
    else if (step === 'review' && consent && !paying) confirm()
  }

  const facilityKey = selectedCourt ? `pickleball:${selectedCourt.name}` : ''

  const bookingLabel = () => {
    const paddleText = addPaddle && selectedPaddle ? ` · Paddle: ${selectedPaddle.name}` : ''
    return `Court · ${selectedCourt?.name} (${startTime}–${endTime}, ${durationHours} hr${durationHours > 1 ? 's' : ''})${paddleText}`
  }

  const persistBooking = async () => {
    const record = await addBooking({
      facility: facilityKey,
      itemName: bookingLabel(),
      date,
      time: startTime,
      hours: durationHours,
      guests: players,
      name,
      contact,
      email,
      amount: total,
      payment: payment === 'Pay at Counter' ? 'cash' : 'online',
    })

    let pRentalId: string | undefined
    let pRentalName: string | undefined
    if (addPaddle && selectedPaddle) {
      const pRental = rentPaddle({
        paddleId: selectedPaddle.id,
        paddleName: selectedPaddle.name,
        renterName: name,
        renterContact: contact,
        attachedToType: 'Court Booking',
        courtOrSession: `${selectedCourt?.name} (${date} @ ${startTime}–${endTime})`,
        date,
        time: startTime,
        duration: `${durationHours} Hour(s)`,
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
      time: startTime,
      duration: durationHours,
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
    } catch (err: any) {
      setPaying(false)
      if (err?.conflict) {
        alert(err.message || 'This slot is no longer available. Please pick another time.')
        setStep('schedule')
        return
      }
      alert(err?.message || 'Could not create your booking. Please try again.')
      return
    }

    if (payment === 'Pay at Counter') {
      setPaying(false)
      setStep('confirm')
      return
    }

    // Online Payment via PayMongo
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
          description: `ROL-EMS · ${label} · ${date} (${startTime}–${endTime})`,
          metadata: {
            reference: record.reference,
            booking: label,
            date,
            time: startTime,
            endTime,
            guests: players,
            hours: durationHours,
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
      throw new Error(data.error || 'Payment initialization failed')
    } catch (err: any) {
      alert(err?.message || 'Something went wrong starting payment.')
      setPaying(false)
    }
  }

  const reset = () => {
    setStep('courts')
    setSelectedCourt(null)
    setDate(todayIso)
    setStartTime('8:00 AM')
    setEndTime('10:00 AM')
    setName('')
    setContact('')
    setEmail('')
    setAddPaddle(false)
    setSelectedPaddleId('')
    setPayment('Online Payment')
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      {/* Page Header Banner */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#E1A728]">
                Professional Court Reservations
              </p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">
                Court Booking & Schedules
              </h1>
              <p className="mt-2 text-sm text-[#6B756B] max-w-2xl">
                Reserve Court 1, Court 2, or Court 3 with full schedule flexibility. Select your exact start and end times, preview real-time court availability, and manage active reservations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsManageModalOpen(true)}
                className="flex items-center gap-2 rounded-md border border-[#1E5336] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#1E5336] hover:bg-[#1E5336] hover:text-white transition shadow-xs"
              >
                <Wrench size={14} />
                Manage Existing Booking
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Step Indicator */}
        {step !== 'confirm' && (
          <div className="mb-8 rounded-lg border border-[#222222]/10 bg-[#FDFBF7] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto">
              {steps.map((s, i) => {
                const isDone = i < currentIndex
                const isActive = i === currentIndex
                return (
                  <div key={s.key} className="flex flex-1 items-center gap-2 shrink-0">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        isDone || isActive
                          ? 'bg-[#1E5336] text-[#FDFBF7] shadow-xs'
                          : 'border border-[#222222]/20 text-[#6B756B]'
                      }`}
                    >
                      {isDone ? <Check size={14} /> : i + 1}
                    </span>
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        isActive
                          ? 'font-black text-[#1E5336]'
                          : isDone
                          ? 'font-bold text-[#6B756B]'
                          : 'text-[#6B756B]/60 font-medium'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: SELECT COURT (Courts 1, 2, 3 with Shared CourtsSection)
            ========================================================================= */}
        {step === 'courts' && (
          <CourtsSection
            onSelectCourt={(court) => {
              setSelectedCourt(court)
              setStep('schedule')
            }}
            title="Pickleball Courts"
            subtitle="Championship outdoor courts equipped with regulation markings, kitchen lines, and premium LED lighting."
          />
        )}

        {/* =========================================================================
            STEP 2: COURT BOOKING SCHEDULE (Start Time, End Time & Auto-Calculation)
            ========================================================================= */}
        {step === 'schedule' && selectedCourt && (
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between border-b border-[#222222]/10 pb-4 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-[#E1A728]">Selected Facility</p>
                <h2 className="font-serif text-3xl text-[#1E5336] mt-0.5">{selectedCourt.name}</h2>
                <p className="text-xs text-[#6B756B]">Standard rate: ₱350.00 / hour</p>
              </div>

              <button
                type="button"
                onClick={() => go('courts')}
                className="flex items-center gap-1.5 rounded border border-[#222222]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#6B756B] hover:text-[#1E5336]"
              >
                Change Court
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-2">
                  1. Select Booking Date *
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[240px]">
                    <button
                      type="button"
                      onClick={() => setCalendarOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg border border-[#222222]/20 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5336]"
                    >
                      <span>{date || 'Select a date'}</span>
                      <CalendarDays size={18} className="text-[#1E5336]" />
                    </button>

                    {/* Interactive Calendar Dropdown */}
                    {calendarOpen && (
                      <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-[#222222]/15 bg-white p-4 shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                            className="p-1 text-[#6B756B] hover:text-black rounded"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-bold text-[#1E5336]">{monthLabel}</span>
                          <button
                            type="button"
                            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                            className="p-1 text-[#6B756B] hover:text-black rounded"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                            <span key={i} className="pb-1 text-[10px] font-bold uppercase text-[#6B756B]">
                              {d}
                            </span>
                          ))}
                          {cells.map((c, i) => {
                            if (!c) return <span key={i} />
                            const iso = isoDate(c)
                            const disabled = c < today
                            const selected = iso === date
                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                  setDate(iso)
                                  setCalendarOpen(false)
                                }}
                                className={`h-8 rounded text-xs transition ${
                                  selected
                                    ? 'bg-[#1E5336] text-[#FDFBF7] font-bold'
                                    : disabled
                                    ? 'text-[#6B756B]/30 cursor-not-allowed'
                                    : 'hover:bg-[#E1A728]/30 font-medium'
                                }`}
                              >
                                {c.getDate()}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Date Chips */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDate(todayIso)}
                      className={`rounded-lg px-3 py-2.5 text-xs font-bold transition border ${
                        date === todayIso
                          ? 'bg-[#1E5336] text-white border-[#1E5336]'
                          : 'bg-white text-[#6B756B] border-[#222222]/20 hover:border-[#1E5336]'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tmrw = new Date(today)
                        tmrw.setDate(tmrw.getDate() + 1)
                        setDate(toIso(tmrw))
                      }}
                      className={`rounded-lg px-3 py-2.5 text-xs font-bold transition border ${
                        date !== todayIso
                          ? 'bg-[#1E5336] text-white border-[#1E5336]'
                          : 'bg-white text-[#6B756B] border-[#222222]/20 hover:border-[#1E5336]'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
              </div>

              {/* Start Time and End Time Fields */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-2">
                    2. Start Time *
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-[#222222]/20 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5336]"
                  >
                    {startOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-2">
                    3. End Time *
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-[#222222]/20 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E5336]"
                  >
                    {endOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Validation & Duration Indicator */}
              <div className="rounded-lg border border-[#222222]/15 bg-white p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#1E5336]" />
                    <span className="text-xs text-[#6B756B] uppercase font-bold tracking-wider">
                      Calculated Duration:
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm font-black ${
                      isTimeOrderValid ? 'text-[#1E5336]' : 'text-rose-600'
                    }`}
                  >
                    {isTimeOrderValid
                      ? `${durationHours} Hour${durationHours === 1 ? '' : 's'} (${durationMinutes} mins)`
                      : 'Invalid Selection'}
                  </span>
                </div>

                {/* Validation Warnings */}
                {!isTimeOrderValid && (
                  <div className="rounded bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>
                      <strong>Time Error:</strong> The End Time must be later than the Start Time.
                    </span>
                  </div>
                )}

                {overlapConflict && (
                  <div className="rounded bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>
                      <strong>Slot Overlap Conflict:</strong> {overlapConflict}
                    </span>
                  </div>
                )}

                {isTimeOrderValid && !overlapConflict && (
                  <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Court is completely available for this schedule!
                    </span>
                    <span className="font-bold">
                      Subtotal: ₱{(durationHours * hourlyRate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Court Day Slots Timeline Matrix */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-2">
                  4. Available Hourly Slots for {selectedCourt.name} on {date}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {allTimeOptions.slice(0, 14).map((slot) => {
                    const slotStart = slot
                    const slotEnd = calculateEndTime(slot, 1)

                    const isTaken = reservations.some((r) => {
                      if (r.bookingStatus === 'cancelled') return false
                      const rCourt = r.court.toLowerCase().trim()
                      const sCourt = selectedCourt.name.toLowerCase().trim()
                      if (!rCourt.includes(sCourt) && !sCourt.includes(rCourt)) return false
                      const rEnd = calculateEndTime(r.time, r.duration || 1)
                      return isCourtSlotOverlapping(date, slotStart, slotEnd, r.date, r.time, rEnd)
                    })

                    const isCurrentSelection =
                      isTimeOrderValid &&
                      parseTimeToMinutes(slot) >= startMin &&
                      parseTimeToMinutes(slot) < endMin

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isTaken}
                        onClick={() => {
                          setStartTime(slot)
                          setEndTime(calculateEndTime(slot, 2))
                        }}
                        className={`rounded-md p-2 text-center text-xs transition border ${
                          isTaken
                            ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-not-allowed line-through'
                            : isCurrentSelection
                            ? 'bg-[#1E5336] border-[#1E5336] text-white font-bold shadow-xs'
                            : 'bg-white border-[#222222]/15 text-[#222222] hover:border-[#1E5336]'
                        }`}
                      >
                        <p className="font-semibold">{slot}</p>
                        <p className="text-[9px] uppercase tracking-tight mt-0.5">
                          {isTaken ? 'Booked' : isCurrentSelection ? 'Selected' : 'Open'}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between border-t border-[#222222]/10 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-md border border-[#222222]/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6B756B] hover:text-black bg-white"
              >
                <ArrowLeft size={14} /> Back to Courts
              </button>

              <button
                type="button"
                disabled={!canProceedSchedule}
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-md bg-[#1E5336] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-40 transition shadow-xs"
              >
                <span>Continue to Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DETAILS & PADDLE RENTAL ADD-ONS
            ========================================================================= */}
        {step === 'details' && selectedCourt && (
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-3xl text-[#1E5336]">Guest Details & Equipment</h2>
            <p className="text-xs text-[#6B756B] mt-1 mb-6">
              Please enter your contact information to receive your confirmation receipt.
            </p>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-3 text-xs font-medium outline-none focus:border-[#1E5336]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. 0917 123 4567"
                    className="w-full rounded-md border border-[#222222]/20 bg-white p-3 text-xs font-medium outline-none focus:border-[#1E5336]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Email Address * (For official receipt)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maria.santos@gmail.com"
                  className="w-full rounded-md border border-[#222222]/20 bg-white p-3 text-xs font-medium outline-none focus:border-[#1E5336]"
                />
              </div>

              {/* Number of Players */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B] mb-1">
                  Estimated Number of Players
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPlayers(num)}
                      className={`flex-1 rounded-md py-2 text-xs font-bold transition border ${
                        players === num
                          ? 'bg-[#1E5336] text-white border-[#1E5336]'
                          : 'bg-white text-[#6B756B] border-[#222222]/20 hover:border-[#1E5336]'
                      }`}
                    >
                      {num} {num === 1 ? 'Player' : num === 2 ? 'Singles (2)' : 'Doubles (4)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paddle Rental Add-on */}
              <div className="rounded-lg border border-[#222222]/15 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-[#1E5336]">Pro Paddle Rental Add-on</h3>
                    <p className="text-xs text-[#6B756B]">
                      Borrow a USA Pickleball certified carbon fiber paddle during your court reservation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="addPaddle"
                    checked={addPaddle}
                    onChange={(e) => setAddPaddle(e.target.checked)}
                    className="h-5 w-5 accent-[#1E5336] cursor-pointer"
                  />
                </div>

                {addPaddle && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-[#222222]/10">
                    {paddles
                      .filter((p) => p.availability === 'Available')
                      .slice(0, 4)
                      .map((paddle) => (
                        <div
                          key={paddle.id}
                          onClick={() => setSelectedPaddleId(paddle.id)}
                          className={`cursor-pointer rounded-lg border p-3 transition ${
                            selectedPaddleId === paddle.id
                              ? 'border-[#1E5336] bg-[#1E5336]/5 ring-1 ring-[#1E5336]'
                              : 'border-[#222222]/15 hover:border-[#1E5336]'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-xs text-[#222222]">{paddle.name}</p>
                              <p className="text-[10px] text-[#6B756B]">{paddle.brand} · {paddle.type}</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#1E5336]">
                              +₱{paddle.price}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between border-t border-[#222222]/10 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-md border border-[#222222]/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6B756B] hover:text-black bg-white"
              >
                <ArrowLeft size={14} /> Back to Schedule
              </button>

              <button
                type="button"
                disabled={!canProceedDetails}
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-md bg-[#1E5336] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-40 transition shadow-xs"
              >
                <span>Review Booking</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: REVIEW & CONFIRM (Comprehensive Booking Summary)
            ========================================================================= */}
        {step === 'review' && selectedCourt && (
          <div className="rounded-xl border border-[#222222]/15 bg-[#FDFBF7] p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl text-[#1E5336]">Booking Summary</h2>
            <p className="text-xs text-[#6B756B] mt-1 mb-6">
              Please double check all booking details before final confirmation.
            </p>

            {/* Structured Summary Card */}
            <div className="rounded-xl border border-[#1E5336]/20 bg-white p-6 space-y-4 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <span className="text-[#6B756B] uppercase font-bold text-[10px]">Facility</span>
                <span className="font-bold text-sm text-[#1E5336]">{selectedCourt.name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <span className="text-[#6B756B] uppercase font-bold text-[10px]">Booking Date</span>
                <span className="font-bold text-[#222222]">{date}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <span className="text-[#6B756B] uppercase font-bold text-[10px]">Reserved Time Slot</span>
                <span className="font-bold text-[#1E5336]">
                  {startTime} – {endTime}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <span className="text-[#6B756B] uppercase font-bold text-[10px]">Total Duration</span>
                <span className="font-mono font-bold text-[#222222]">
                  {durationHours} Hour{durationHours > 1 ? 's' : ''} ({durationMinutes} mins)
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <span className="text-[#6B756B] uppercase font-bold text-[10px]">Court Fee (₱350/hr)</span>
                <span className="font-mono font-bold text-[#222222]">₱{courtTotal.toLocaleString()}</span>
              </div>

              {addPaddle && selectedPaddle && (
                <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                  <span className="text-[#6B756B] uppercase font-bold text-[10px]">
                    Paddle Rental ({selectedPaddle.name})
                  </span>
                  <span className="font-mono font-bold text-[#222222]">₱{paddleCost.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <span className="text-[#6B756B] uppercase font-bold text-[10px]">Guest Name</span>
                <span className="font-bold text-[#222222]">{name}</span>
              </div>

              {/* Total Price Highlight */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-[#222222] uppercase tracking-wider">
                  Total Payable:
                </span>
                <span className="font-mono text-2xl font-black text-[#1E5336]">
                  ₱{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-6 space-y-3">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B756B]">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayment('Online Payment')}
                  className={`rounded-lg border p-3.5 text-left transition ${
                    payment === 'Online Payment'
                      ? 'border-[#1E5336] bg-[#1E5336]/10 ring-1 ring-[#1E5336]'
                      : 'border-[#222222]/15 bg-white hover:border-[#1E5336]'
                  }`}
                >
                  <p className="font-bold text-xs text-[#1E5336]">Online Payment</p>
                  <p className="text-[10px] text-[#6B756B] mt-0.5">GCash, Maya, Debit/Credit Card</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment('Pay at Counter')}
                  className={`rounded-lg border p-3.5 text-left transition ${
                    payment === 'Pay at Counter'
                      ? 'border-[#1E5336] bg-[#1E5336]/10 ring-1 ring-[#1E5336]'
                      : 'border-[#222222]/15 bg-white hover:border-[#1E5336]'
                  }`}
                >
                  <p className="font-bold text-xs text-[#1E5336]">Pay at Counter</p>
                  <p className="text-[10px] text-[#6B756B] mt-0.5">Pay in cash upon arrival</p>
                </button>
              </div>
            </div>

            {/* Legal Consent */}
            <div className="mt-6">
              <ConsentCheckbox id="booking-consent" agreed={consent} onChange={setConsent} />
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-between border-t border-[#222222]/10 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-md border border-[#222222]/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6B756B] hover:text-black bg-white"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                disabled={!consent || paying}
                onClick={confirm}
                className="flex items-center gap-2 rounded-md bg-[#1E5336] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-40 transition shadow-md"
              >
                {paying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking (₱{total.toLocaleString()})</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: CONFIRMATION RECEIPT
            ========================================================================= */}
        {step === 'confirm' && (
          <div className="rounded-xl border border-[#222222]/15 bg-white p-8 max-w-lg mx-auto text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={28} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#E1A728]">
                Reservation Confirmed
              </p>
              <h2 className="font-serif text-3xl text-[#1E5336] mt-1">We Look Forward to Seeing You!</h2>
              <p className="text-xs text-[#6B756B] mt-2">
                Your pickleball court reservation has been booked. A confirmation email has been dispatched.
              </p>
            </div>

            <div className="rounded-lg border border-[#222222]/10 bg-[#FDFBF7] p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-[#222222]/10 pb-1.5">
                <span className="text-[#6B756B]">Booking Reference:</span>
                <span className="font-mono font-bold text-[#1E5336]">{confirmedRef}</span>
              </div>
              <div className="flex justify-between border-b border-[#222222]/10 pb-1.5">
                <span className="text-[#6B756B]">Court:</span>
                <span className="font-bold text-[#222222]">{selectedCourt?.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#222222]/10 pb-1.5">
                <span className="text-[#6B756B]">Schedule:</span>
                <span className="font-bold text-[#222222]">{date} ({startTime}–{endTime})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B756B]">Total Amount:</span>
                <span className="font-mono font-bold text-[#1E5336]">₱{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/pickleball/booking/receipt?ref=${encodeURIComponent(confirmedRef)}`}
                className="w-full rounded-md bg-[#1E5336] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#153d27] transition shadow-xs"
              >
                View Printable Receipt
              </Link>
              <button
                type="button"
                onClick={reset}
                className="w-full rounded-md border border-[#222222]/20 py-2.5 text-xs font-semibold text-[#6B756B] hover:text-[#222222] transition"
              >
                Book Another Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Management Modal */}
      <ManageBookingModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F0EC] pt-[64px] pb-16 flex items-center justify-center text-xs text-[#6B756B]">
          Loading court bookings...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}