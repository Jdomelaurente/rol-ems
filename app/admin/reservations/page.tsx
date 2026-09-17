'use client'

import { useState } from 'react'
import Link from 'next/link'
import { reservations as initialReservations } from '@/lib/data'
import type { Reservation } from '@/lib/data'
import { ArrowLeft, Check, X, CreditCard, Search, Filter } from 'lucide-react'

export default function AdminReservationsPage() {
  const [resList, setResList] = useState<Reservation[]>(initialReservations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const filtered = resList.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      r.court.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      r.bookingStatus === statusFilter.toLowerCase() ||
      r.paymentStatus === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const updateStatus = (id: string, field: 'paymentStatus' | 'bookingStatus', value: string) => {
    setResList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
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
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-[#FDFBF7] p-4 border border-[#222222]/15 shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B756B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, booking ID, court..."
              className="w-full border border-[#222222]/20 bg-[#F3F0EC] pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#1E5336]"
            />
          </div>

          <div className="flex items-center gap-2">
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
        <div className="border border-[#222222]/15 bg-[#FDFBF7] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Court</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Booking Status</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/10">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F3F0EC]/40">
                    <td className="p-4 font-mono font-bold text-[#222222]">{r.bookingId}</td>
                    <td className="p-4 font-semibold text-[#222222]">{r.customerName}</td>
                    <td className="p-4 font-bold text-[#1E5336]">{r.court}</td>
                    <td className="p-4 text-[#6B756B]">{r.date} at {r.time} ({r.duration}h)</td>
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
                            onClick={() => updateStatus(r.id, 'bookingStatus', 'confirmed')}
                            className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                            title="Approve Booking"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {r.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => updateStatus(r.id, 'paymentStatus', 'paid')}
                            className="rounded bg-amber-500 p-1.5 text-white hover:bg-amber-600"
                            title="Mark as Paid"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        {r.bookingStatus !== 'cancelled' && (
                          <button
                            onClick={() => {
                              updateStatus(r.id, 'bookingStatus', 'cancelled')
                              updateStatus(r.id, 'paymentStatus', 'cancelled')
                            }}
                            className="rounded bg-red-600 p-1.5 text-white hover:bg-red-700"
                            title="Cancel Booking"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
