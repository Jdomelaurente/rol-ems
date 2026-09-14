'use client'

import React, { useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import { Coach } from '@/lib/data'
import {
  GraduationCap,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

export default function CoachingPage() {
  const { coaches, coachingBookings, playerProgress, bookCoachingSession } = usePickleball()

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(coaches[0] || null)

  // Form State
  const [playerName, setPlayerName] = useState('')
  const [playerContact, setPlayerContact] = useState('')
  const [selectedDate, setSelectedDate] = useState('2026-09-12')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedPackageName, setSelectedPackageName] = useState('')

  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('')

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCoach || !playerName || !playerContact || !selectedTimeSlot || !selectedPackageName) {
      alert('Please fill out all booking fields.')
      return
    }

    const pkg = selectedCoach.packages.find((p) => p.name === selectedPackageName)
    const price = pkg ? pkg.price : selectedCoach.hourlyRate

    bookCoachingSession({
      coachId: selectedCoach.id,
      coachName: selectedCoach.name,
      playerName,
      playerContact,
      sport: 'Pickleball',
      date: selectedDate,
      time: selectedTimeSlot,
      packageName: selectedPackageName,
      totalPrice: price,
    })

    setBookingSuccessMsg(`🎉 Coaching session booked successfully with ${selectedCoach.name} for ${selectedDate} at ${selectedTimeSlot}!`)
    setPlayerName('')
    setPlayerContact('')
    setSelectedTimeSlot('')
    setSelectedPackageName('')
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Banner */}
        <div className="mb-8 rounded-2xl bg-[#1E5336] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#E1A728]/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E1A728]/40 bg-[#153d27] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E1A728]">
              <GraduationCap size={14} /> Pickleball Training & Coaching Academy
            </span>
            <h1 className="mt-3 font-serif text-4xl font-extrabold sm:text-5xl">
              Elevate Your Pickleball Game.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-200">
              Book certified Pickleball coaches (IPTPA & PPR certified). Master kitchen line dinking, 3rd shot drops, speed-up reset counters, and track your DUPR skill rating growth.
            </p>
          </div>
        </div>

        {/* Main Grid: Coach List & Booking Drawer */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Coaches List & Packages */}
          <div className="space-y-6 lg:col-span-2">
            <h2 className="font-serif text-2xl font-bold text-[#1E5336]">Certified Pickleball Master Coaches</h2>

            {coaches.map((coach) => {
              const isSelected = selectedCoach?.id === coach.id
              return (
                <div
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach)}
                  className={`cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                    isSelected ? 'border-2 border-[#1E5336] ring-2 ring-[#1E5336]/20' : 'border-[#111827]/10'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDF6E7] text-3xl border border-[#E1A728]/30">
                        {coach.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#1E5336]/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#1E5336]">
                            Pickleball
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-[#C48E1A]">
                            <Star size={12} fill="#E1A728" className="text-[#E1A728]" /> {coach.rating}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#111827]">{coach.name}</h3>
                        <p className="text-xs text-[#6B756B]">{coach.title}</p>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-gray-100 sm:pl-6">
                      <span className="font-serif text-2xl font-bold text-[#1E5336]">₱{coach.hourlyRate}</span>
                      <span className="text-[10px] text-[#6B756B]"> / hour</span>
                      <p className="text-[11px] font-semibold text-emerald-700">{coach.experienceYears} Years Exp.</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-[#6B756B]">{coach.bio}</p>

                  {/* Available Packages */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B756B]">
                      Training Packages Offered:
                    </span>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {coach.packages.map((pkg) => (
                        <div key={pkg.id} className="rounded-lg border border-[#111827]/10 bg-[#F3F0EC] p-3 text-xs">
                          <div className="flex items-center justify-between font-bold text-[#111827]">
                            <span>{pkg.name}</span>
                            <span className="text-[#1E5336]">₱{pkg.price}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-[#6B756B]">{pkg.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Session History & Player Progress Section */}
            <div className="mt-10 rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <TrendingUp size={20} className="text-[#1E5336]" />
                <h3 className="font-serif text-xl font-bold text-[#1E5336]">Pickleball Player Skill Radar & Progress</h3>
              </div>

              {playerProgress.map((prog, idx) => (
                <div key={idx} className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#111827]">{prog.playerName}</h4>
                      <span className="text-[10px] font-semibold uppercase text-[#6B756B]">Pickleball Rating</span>
                    </div>
                    <span className="rounded bg-[#FDF6E7] px-2.5 py-1 text-xs font-bold text-[#C48E1A] border border-[#E1A728]/30">
                      Mastery Status: Advanced
                    </span>
                  </div>

                  {/* Skill Bars */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Serve Mechanics</span>
                        <span>{prog.skillScores.serve} / 5.0</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-[#1E5336]" style={{ width: `${(prog.skillScores.serve / 5) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Dinking & Reset Control</span>
                        <span>{prog.skillScores.dinkVolley} / 5.0</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-[#E1A728]" style={{ width: `${(prog.skillScores.dinkVolley / 5) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Third Shot Drop & Drives</span>
                        <span>{prog.skillScores.smashPower} / 5.0</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-[#1E5336]" style={{ width: `${(prog.skillScores.smashPower / 5) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Kitchen Line Agility</span>
                        <span>{prog.skillScores.footworkAgility} / 5.0</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(prog.skillScores.footworkAgility / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Feedback Notes */}
                  <div className="rounded-xl bg-[#F3F0EC] p-4 text-xs">
                    <p className="font-bold text-[#1E5336]">Latest Coach Feedback Notes:</p>
                    {prog.feedbackHistory.map((fb, fbIdx) => (
                      <div key={fbIdx} className="mt-2 border-t border-gray-200/60 pt-2">
                        <span className="text-[10px] text-gray-500">{fb.date} • {fb.coachName}</span>
                        <p className="mt-0.5 text-gray-700 font-medium">{fb.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Booking Form Drawer */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-md sticky top-24">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <BookOpen size={20} className="text-[#1E5336]" />
                <h3 className="font-serif text-xl font-bold text-[#111827]">Book Pickleball Session</h3>
              </div>

              {bookingSuccessMsg && (
                <div className="my-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 font-medium">
                  {bookingSuccessMsg}
                </div>
              )}

              {selectedCoach ? (
                <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                  <div className="rounded-lg bg-[#FDF6E7] p-3 text-xs border border-[#E1A728]/30">
                    <p className="font-bold text-[#111827]">Selected Coach: {selectedCoach.name}</p>
                    <p className="text-[10px] text-[#6B756B]">{selectedCoach.sport} • ₱{selectedCoach.hourlyRate}/hr</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827]">Player Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827]">Contact Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0917-111-2233"
                      value={playerContact}
                      onChange={(e) => setPlayerContact(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827]">Session Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-[#1E5336] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827]">Select Available Time Slot</label>
                    <select
                      required
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-[#1E5336] focus:outline-none font-medium"
                    >
                      <option value="">Select Time Slot...</option>
                      {selectedCoach.timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827]">Select Package / Session</label>
                    <select
                      required
                      value={selectedPackageName}
                      onChange={(e) => setSelectedPackageName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-[#1E5336] focus:outline-none font-medium"
                    >
                      <option value="">Select Package...</option>
                      <option value={`Standard 1-Hour Session (₱${selectedCoach.hourlyRate})`}>
                        Standard 1-Hour Session (₱{selectedCoach.hourlyRate})
                      </option>
                      {selectedCoach.packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.name}>
                          {pkg.name} (₱{pkg.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#1E5336] py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#153d27]"
                  >
                    Confirm Coaching Booking
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-xs text-gray-500">Please select a coach from the left panel to begin booking.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
