'use client'

import { useState } from 'react'
import Link from 'next/link'
import { courts as defaultCourts, type CourtStatus } from '@/lib/data'
import { usePickleball } from '@/context/PickleballContext'
import { calculateEndTime, getReservationCountdown, parseTimeToMinutes, toIso } from '@/lib/booking-overlap'
import { ArrowLeft, Calendar, Clock, User, ShieldAlert, CheckCircle, Wrench, PlayCircle, Lock } from 'lucide-react'

export default function AdminCourtsPage() {
  const { reservations, openPlaySessions, courtOverrides, updateCourtOverrideStatus } = usePickleball()
  const [selectedDate, setSelectedDate] = useState(() => toIso(new Date()))

  const now = new Date()

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Courts</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Court Management</h1>
              <p className="mt-1 text-xs text-[#6B756B]">
                Monitor real-time court availability, active reservations, and automated time schedules.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 border border-[#222222]/15 shadow-sm rounded">
              <Calendar size={16} className="text-[#1E5336]" />
              <label className="text-xs font-bold text-[#6B756B]">View Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#F3F0EC] border border-[#222222]/20 px-2 py-1 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {defaultCourts.map((court) => {
            const courtNameClean = court.name.toLowerCase().trim()

            // Filter reservations for this court & date
            const courtReservations = reservations.filter((r) => {
              const rCourt = r.court.toLowerCase().trim()
              const matchesCourt = rCourt === courtNameClean || rCourt.includes(courtNameClean) || courtNameClean.includes(rCourt)
              return matchesCourt && r.date === selectedDate && r.bookingStatus !== 'cancelled'
            }).sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))

            // Open play session for this court & date
            const openPlaySession = openPlaySessions.find((s) => {
              const sCourt = s.court.toLowerCase().trim()
              return (sCourt === courtNameClean || sCourt.includes(courtNameClean)) && s.date === selectedDate && s.status !== 'cancelled'
            })

            // Determine active/ongoing or next upcoming reservation
            let activeRes = courtReservations.find((r) => {
              const startM = parseTimeToMinutes(r.time)
              const endM = startM + (r.duration || 1) * 60
              const nowM = now.getHours() * 60 + now.getMinutes()
              return selectedDate === toIso(now) && nowM >= startM && nowM < endM
            })

            let upcomingRes = courtReservations.find((r) => {
              const startM = parseTimeToMinutes(r.time)
              const nowM = now.getHours() * 60 + now.getMinutes()
              return selectedDate > toIso(now) || (selectedDate === toIso(now) && startM > nowM)
            })

            const displayRes = activeRes || upcomingRes || courtReservations[0]

            // Manual override for status
            const overrideStatus = courtOverrides[court.id]

            let effectiveStatus: CourtStatus = 'available'
            if (overrideStatus) {
              effectiveStatus = overrideStatus
            } else if (activeRes) {
              effectiveStatus = 'reserved'
            } else if (openPlaySession) {
              effectiveStatus = 'open-play'
            } else if (courtReservations.length > 0) {
              effectiveStatus = 'reserved'
            }

            const endTimeStr = displayRes ? calculateEndTime(displayRes.time, displayRes.duration) : ''
            const countdownInfo = displayRes ? getReservationCountdown(displayRes.date, displayRes.time, endTimeStr, now) : null

            return (
              <div key={court.id} className="flex flex-col justify-between border border-[#222222]/15 bg-white p-6 shadow-sm rounded-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-serif text-2xl font-bold text-[#1E5336]">{court.name}</h2>
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                      effectiveStatus === 'available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      effectiveStatus === 'reserved' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      effectiveStatus === 'occupied' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      effectiveStatus === 'maintenance' ? 'bg-zinc-200 text-zinc-800 border border-zinc-400' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {effectiveStatus}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B756B] mb-2">{court.detail}</p>
                  <p className="text-xs font-bold text-[#1E5336] mb-4">{court.price}</p>

                  {/* Primary Reservation Details Box */}
                  {displayRes ? (
                    <div className="mb-5 rounded border border-[#1E5336]/20 bg-[#FDFBF7] p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2">
                        <span className="font-bold text-[#1E5336] uppercase tracking-wide text-[10px]">
                          {activeRes ? 'Current Reservation' : 'Upcoming Reservation'}
                        </span>
                        {countdownInfo?.statusText && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            countdownInfo.isCurrent ? 'bg-amber-500 text-white animate-pulse' : 'bg-[#1E5336] text-white'
                          }`}>
                            {countdownInfo.statusText}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[#222222] font-semibold">
                        <User size={14} className="text-[#1E5336] shrink-0" />
                        <span>Reserved by: <strong className="text-[#1E5336]">{displayRes.customerName}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-[#6B756B]">
                        <Calendar size={14} className="text-[#E1A728] shrink-0" />
                        <span>Date: <strong className="text-[#222222]">{displayRes.date}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-[#6B756B]">
                        <Clock size={14} className="text-[#1E5336] shrink-0" />
                        <span>Time: <strong className="text-[#222222]">{displayRes.time} – {endTimeStr}</strong> ({displayRes.duration} hr{displayRes.duration > 1 ? 's' : ''})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 rounded border border-dashed border-[#222222]/20 bg-[#F3F0EC]/50 p-4 text-center text-xs text-[#6B756B]">
                      No court reservations recorded for {selectedDate}.
                    </div>
                  )}

                  {/* Quick Admin Overrides */}
                  <div className="space-y-2 border-t border-[#222222]/10 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B756B]">Admin Status Override</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <button
                        onClick={() => updateCourtOverrideStatus(court.id, null)}
                        className={`rounded py-1.5 px-2 border transition ${!overrideStatus ? 'bg-[#1E5336] text-white border-[#1E5336]' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Auto (Default)
                      </button>
                      <button
                        onClick={() => updateCourtOverrideStatus(court.id, 'available')}
                        className={`rounded py-1.5 px-2 border transition ${overrideStatus === 'available' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Set Available
                      </button>
                      <button
                        onClick={() => updateCourtOverrideStatus(court.id, 'occupied')}
                        className={`rounded py-1.5 px-2 border transition ${overrideStatus === 'occupied' ? 'bg-rose-600 text-white border-rose-600' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Mark Occupied
                      </button>
                      <button
                        onClick={() => updateCourtOverrideStatus(court.id, 'maintenance')}
                        className={`rounded py-1.5 px-2 border transition ${overrideStatus === 'maintenance' ? 'bg-zinc-700 text-white border-zinc-700' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Set Maintenance
                      </button>
                    </div>
                  </div>
                </div>

                {/* Complete Reservation Schedule for the Selected Date */}
                <div className="mt-6 border-t border-[#222222]/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase text-[#6B756B]">
                      Complete Schedule ({selectedDate})
                    </p>
                    <span className="text-[10px] font-semibold text-[#1E5336]">
                      {courtReservations.length} slot{courtReservations.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {courtReservations.length > 0 ? (
                      courtReservations.map((res) => {
                        const endT = calculateEndTime(res.time, res.duration)
                        const isPaid = res.paymentStatus === 'paid'
                        return (
                          <div key={res.id} className="flex flex-col gap-0.5 p-2 rounded bg-[#F3F0EC] border border-[#222222]/10">
                            <div className="flex items-center justify-between font-bold text-[#1E5336]">
                              <span>{res.time} – {endT}</span>
                              <span className={`px-1.5 py-0.2 text-[8px] uppercase rounded font-bold ${
                                isPaid ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                              }`}>
                                {res.paymentStatus}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#6B756B]">
                              <span>{res.customerName}</span>
                              <span className="font-mono text-[10px]">{res.bookingId}</span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-[11px] text-[#6B756B] italic py-2">No reservations booked on this date.</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
