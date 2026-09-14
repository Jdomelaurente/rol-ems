'use client'

import React, { useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import { Coach } from '@/lib/data'
import Navbar from '@/components/layout/Navbar'
import { Star, TrendingUp, BookOpen } from 'lucide-react'

export default function CoachingPage() {
  const { coaches, playerProgress, bookCoachingSession } = usePickleball()

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(coaches[0] || null)

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

    setBookingSuccessMsg(`Coaching session booked with ${selectedCoach.name} for ${selectedDate} at ${selectedTimeSlot}.`)
    setPlayerName('')
    setPlayerContact('')
    setSelectedTimeSlot('')
    setSelectedPackageName('')
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Training Academy</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Elevate Your Pickleball Game</h1>
          <p className="mt-2 text-sm text-[#6B756B]">Book certified coaches, track your DUPR skill rating growth, and master every shot.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728] font-bold">Coaches</p>
            <h2 className="font-serif text-2xl text-[#1E5336] -mt-1">Certified Master Coaches</h2>

            {coaches.map((coach) => {
              const isSelected = selectedCoach?.id === coach.id
              return (
                <div
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach)}
                  className={`cursor-pointer border bg-[#FDFBF7] p-6 transition ${
                    isSelected ? 'border-2 border-[#1E5336]' : 'border-[#222222]/10'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center border border-[#222222]/10 bg-[#F3F0EC] text-2xl">
                        {coach.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                            Pickleball
                          </span>
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#E1A728]">
                            <Star size={10} fill="#E1A728" className="text-[#E1A728]" /> {coach.rating}
                          </span>
                        </div>
                        <h3 className="mt-1 font-serif text-xl text-[#1E5336]">{coach.name}</h3>
                        <p className="text-xs text-[#6B756B]">{coach.title}</p>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-[#222222]/10 sm:pl-6">
                      <span className="font-serif text-2xl text-[#1E5336]">₱{coach.hourlyRate}</span>
                      <span className="text-[10px] text-[#6B756B]"> / hour</span>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#1E5336]">{coach.experienceYears} Years Exp.</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-[#6B756B]">{coach.bio}</p>

                  <div className="mt-4 border-t border-[#222222]/10 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#6B756B] font-bold">Training Packages</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {coach.packages.map((pkg) => (
                        <div key={pkg.id} className="border border-[#222222]/10 bg-[#F3F0EC] p-3 text-xs">
                          <div className="flex items-center justify-between font-bold text-[#222222]">
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

            <div className="mt-10 border border-[#222222]/10 bg-[#FDFBF7] p-6">
              <div className="flex items-center gap-2 border-b border-[#222222]/10 pb-4">
                <TrendingUp size={18} className="text-[#1E5336]" />
                <h3 className="font-serif text-xl text-[#1E5336]">Player Skill Progress</h3>
              </div>

              {playerProgress.map((prog, idx) => (
                <div key={idx} className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#222222]">{prog.playerName}</h4>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Pickleball Rating</p>
                    </div>
                    <span className="border border-[#E1A728]/30 bg-[#FDFBF7] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-bold text-[#E1A728]">
                      Advanced
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Serve Mechanics', value: prog.skillScores.serve, color: '#1E5336' },
                      { label: 'Dinking & Reset', value: prog.skillScores.dinkVolley, color: '#E1A728' },
                      { label: 'Third Shot Drop', value: prog.skillScores.smashPower, color: '#1E5336' },
                      { label: 'Kitchen Line Agility', value: prog.skillScores.footworkAgility, color: '#1E5336' },
                    ].map((skill) => (
                      <div key={skill.label}>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#222222]">{skill.label}</span>
                          <span className="text-[#6B756B]">{skill.value} / 5.0</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-[#222222]/10">
                          <div className="h-1.5 bg-[#1E5336]" style={{ width: `${(skill.value / 5) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border border-[#222222]/10 bg-[#F3F0EC] p-4 text-xs">
                    <p className="font-bold text-[#1E5336]">Latest Coach Feedback</p>
                    {prog.feedbackHistory.map((fb, fbIdx) => (
                      <div key={fbIdx} className="mt-2 border-t border-[#222222]/10 pt-2">
                        <span className="text-[10px] text-[#6B756B]">{fb.date} · {fb.coachName}</span>
                        <p className="mt-0.5 text-[#222222]">{fb.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 sticky top-20">
              <div className="flex items-center gap-2 border-b border-[#222222]/10 pb-4">
                <BookOpen size={18} className="text-[#1E5336]" />
                <h3 className="font-serif text-xl text-[#1E5336]">Book Session</h3>
              </div>

              {bookingSuccessMsg && (
                <div className="my-4 border border-[#1E5336]/20 bg-[#F3F0EC] p-3 text-xs text-[#1E5336] font-bold">
                  {bookingSuccessMsg}
                </div>
              )}

              {selectedCoach ? (
                <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                  <div className="border border-[#222222]/10 bg-[#F3F0EC] p-3 text-xs">
                    <p className="font-bold text-[#222222]">Selected Coach: {selectedCoach.name}</p>
                    <p className="text-[10px] text-[#6B756B]">{selectedCoach.sport} · ₱{selectedCoach.hourlyRate}/hr</p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Player Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Contact Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0917-111-2233"
                      value={playerContact}
                      onChange={(e) => setPlayerContact(e.target.value)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Session Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Time Slot</label>
                    <select
                      required
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                    >
                      <option value="">Select Time Slot...</option>
                      {selectedCoach.timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Package</label>
                    <select
                      required
                      value={selectedPackageName}
                      onChange={(e) => setSelectedPackageName(e.target.value)}
                      className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                    >
                      <option value="">Select Package...</option>
                      <option value={`Standard 1-Hour Session (₱${selectedCoach.hourlyRate})`}>
                        Standard 1-Hour (₱{selectedCoach.hourlyRate})
                      </option>
                      {selectedCoach.packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.name}>{pkg.name} (₱{pkg.price})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
                  >
                    Confirm Booking
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-xs text-[#6B756B]">Select a coach from the list to begin booking.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}