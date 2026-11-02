'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Reservation } from '@/lib/data'
import { courts as defaultCourts } from '@/lib/data'
import { usePickleball } from '@/context/PickleballContext'
import { calculateEndTime, isCourtSlotOverlapping, parseTimeToMinutes } from '@/lib/booking-overlap'
import { ArrowLeft, Check, X, CreditCard, Search, Filter, Edit2, AlertCircle } from 'lucide-react'

const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']

export default function AdminReservationsPage() {
  const { reservations, openPlaySessions, updateReservation, cancelReservation } = usePickleball()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [editingRes, setEditingRes] = useState<Reservation | null>(null)
  const [editError, setEditError] = useState('')

  // Form states for modal
  const [editCourt, setEditCourt] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editDuration, setEditDuration] = useState(1)
  const [editCustomerName, setEditCustomerName] = useState('')
  const [editPaymentStatus, setEditPaymentStatus] = useState<'paid' | 'pending' | 'cancelled'>('pending')
  const [editBookingStatus, setEditBookingStatus] = useState<Reservation['bookingStatus']>('pending')

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      r.court.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      r.bookingStatus === statusFilter.toLowerCase() ||
      r.paymentStatus === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const openEditModal = (r: Reservation) => {
    setEditingRes(r)
    setEditCourt(r.court)
    setEditDate(r.date)
    setEditTime(r.time)
    setEditDuration(r.duration || 1)
    setEditCustomerName(r.customerName)
    setEditPaymentStatus(r.paymentStatus)
    setEditBookingStatus(r.bookingStatus)
    setEditError('')
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRes) return
    setEditError('')

    const newEndT = calculateEndTime(editTime, editDuration)
    const targetCourtClean = editCourt.toLowerCase().trim()

    // 1. Check double booking against other reservations
    const conflictingRes = reservations.find((r) => {
      if (r.id === editingRes.id || r.bookingStatus === 'cancelled') return false
      const rCourtClean = r.court.toLowerCase().trim()
      const sameCourt = rCourtClean === targetCourtClean || rCourtClean.includes(targetCourtClean) || targetCourtClean.includes(rCourtClean)
      if (!sameCourt) return false

      const existingEndT = calculateEndTime(r.time, r.duration || 1)
      return isCourtSlotOverlapping(editDate, editTime, newEndT, r.date, r.time, existingEndT)
    })

    if (conflictingRes && editBookingStatus !== 'cancelled') {
      setEditError(`Double booking conflict: ${editCourt} is already reserved by ${conflictingRes.customerName} on ${editDate} from ${conflictingRes.time} to ${calculateEndTime(conflictingRes.time, conflictingRes.duration)}.`)
      return
    }

    // 2. Check double booking against active Open Play sessions
    const conflictingOpenPlay = openPlaySessions.find((s) => {
      if (s.status === 'cancelled') return false
      const sCourtClean = s.court.toLowerCase().trim()
      const sameCourt = sCourtClean === targetCourtClean || sCourtClean.includes(targetCourtClean) || targetCourtClean.includes(sCourtClean)
      if (!sameCourt) return false

      return isCourtSlotOverlapping(editDate, editTime, newEndT, s.date, s.startTime, s.endTime)
    })

    if (conflictingOpenPlay && editBookingStatus !== 'cancelled') {
      setEditError(`Conflict with Open Play session on ${editCourt} (${editDate}, ${conflictingOpenPlay.startTime} – ${conflictingOpenPlay.endTime}).`)
      return
    }

    updateReservation(editingRes.id, {
      court: editCourt,
      date: editDate,
      time: editTime,
      duration: editDuration,
      customerName: editCustomerName,
      paymentStatus: editPaymentStatus,
      bookingStatus: editBookingStatus,
    })

    setEditingRes(null)
  }

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
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Reservations</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Reservation Management</h1>
              <p className="mt-1 text-xs text-[#6B756B]">
                Approve bookings, confirm payments, reassign courts/schedules, and manage reservation history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-[#FDFBF7] p-4 border border-[#222222]/15 shadow-sm rounded-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, booking ID, court..."
              className="w-full border border-[#222222]/20 bg-[#F3F0EC] pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#1E5336] rounded"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-[#6B756B]" />
            <span className="text-xs text-[#6B756B] font-semibold">Filter:</span>
            {['All', 'Confirmed', 'Pending', 'Paid', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === st ? 'bg-[#1E5336] text-white' : 'bg-[#F3F0EC] text-[#6B756B] hover:bg-[#E8E4DC]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#222222]/15 bg-[#FDFBF7] shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Court</th>
                  <th className="p-4">Date & Time Range</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Booking Status</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/10">
                {filtered.map((r) => {
                  const endT = calculateEndTime(r.time, r.duration || 1)
                  return (
                    <tr key={r.id} className="hover:bg-[#F3F0EC]/40">
                      <td className="p-4 font-mono font-bold text-[#222222]">{r.bookingId}</td>
                      <td className="p-4 font-semibold text-[#222222]">{r.customerName}</td>
                      <td className="p-4 font-bold text-[#1E5336]">{r.court}</td>
                      <td className="p-4 text-[#222222]">
                        <span className="font-semibold">{r.date}</span>
                        <div className="text-[11px] text-[#6B756B]">{r.time} – {endT} ({r.duration || 1}h)</div>
                      </td>
                      <td className="p-4 text-[#6B756B]">{r.paymentMethod}</td>
                      <td className="p-4">
                        <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                          r.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          r.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                          r.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                          r.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.bookingStatus}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#1E5336]">₱{r.total.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {r.bookingStatus !== 'confirmed' && (
                            <button
                              onClick={() => updateReservation(r.id, { bookingStatus: 'confirmed' })}
                              className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 transition"
                              title="Confirm Booking"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {r.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => updateReservation(r.id, { paymentStatus: 'paid' })}
                              className="rounded bg-amber-500 p-1.5 text-white hover:bg-amber-600 transition"
                              title="Mark as Paid"
                            >
                              <CreditCard size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(r)}
                            className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-700 transition"
                            title="Edit Reservation (Court, Date, Time)"
                          >
                            <Edit2 size={14} />
                          </button>
                          {r.bookingStatus !== 'cancelled' && (
                            <button
                              onClick={() => cancelReservation(r.id)}
                              className="rounded bg-red-600 p-1.5 text-white hover:bg-red-700 transition"
                              title="Cancel Reservation"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Edit Reservation Modal */}
      {editingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-[#FDFBF7] p-6 shadow-2xl rounded-lg border border-[#222222]/15">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#E1A728]">Admin Controls</p>
                <h3 className="font-serif text-2xl font-bold text-[#1E5336]">Edit Reservation {editingRes.bookingId}</h3>
              </div>
              <button onClick={() => setEditingRes(null)} className="text-[#6B756B] hover:text-[#222222]">
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="mb-4 flex items-center gap-2 rounded bg-rose-50 border border-rose-300 p-3 text-xs text-rose-800">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  required
                  className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Assigned Court</label>
                  <select
                    value={editCourt}
                    onChange={(e) => setEditCourt(e.target.value)}
                    className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                  >
                    {defaultCourts.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Start Time</label>
                  <select
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editDuration}
                    onChange={(e) => setEditDuration(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#F3F0EC] border border-[#222222]/10 flex items-center justify-between text-[#1E5336] font-bold">
                <span>Calculated End Time:</span>
                <span>{calculateEndTime(editTime, editDuration)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                    className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6B756B] uppercase text-[10px] mb-1">Booking Status</label>
                  <select
                    value={editBookingStatus}
                    onChange={(e) => setEditBookingStatus(e.target.value as any)}
                    className="w-full border border-[#222222]/20 bg-white px-3 py-2 text-xs font-semibold rounded outline-none focus:border-[#1E5336]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#222222]/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingRes(null)}
                  className="rounded border border-[#222222]/20 px-4 py-2 font-semibold text-[#6B756B] hover:bg-[#F3F0EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1E5336] px-5 py-2 font-bold text-white hover:bg-[#153d27]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
