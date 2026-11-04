'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import DashboardCharts from '@/components/admin/DashboardCharts'

type CottageBooking = {
  reference: string
  facility: string
  itemName: string
  date: string
  time: string
  guests: number
  name?: string | null
  contact?: string | null
  email?: string | null
  amount: number
  payment: string
  status: string
  paymentStatus?: string | null
  paidMethod?: string | null
  createdAt: string
}

const paidMethodLabel = (id?: string | null) => {
  if (!id) return ''
  if (id === 'gcash') return 'GCash'
  if (id === 'maya') return 'Maya'
  if (id === 'card') return 'Card'
  if (id === 'bank') return 'Bank transfer'
  if (id === 'cash') return 'Cash'
  return id
}

const peso = (value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

export default function AdminDashboardPage() {
  const { reservations, paddles, paddleRentals } = usePickleball()
  const [cottageBookings, setCottageBookings] = useState<CottageBooking[]>([])
  const [cottageLoading, setCottageLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/bookings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setCottageBookings(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setCottageBookings([])
      })
      .finally(() => {
        if (!cancelled) setCottageLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cottageActive = useMemo(
    () => cottageBookings.filter((b) => b.status !== 'cancelled'),
    [cottageBookings],
  )
  const recentCottage = useMemo(
    () =>
      [...cottageActive]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 8),
    [cottageActive],
  )
  const unpaidCottage = cottageActive.filter((b) => b.paymentStatus !== 'paid').length

  const pendingPayments = reservations.filter((r) => r.paymentStatus === 'pending').length
  const totalRevenue = reservations.filter((r) => r.paymentStatus === 'paid').reduce((sum, r) => sum + r.total, 0)
  const activeRentalsCount = paddleRentals.filter((r) => r.status === 'Active' || r.status === 'Reserved').length

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">ROL-EMS Management</p>
            <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-[#1E5336] px-3 py-1 text-[10px] uppercase tracking-[0.14em] font-bold text-[#1E5336]">
              System Online
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stat Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Confirmed Revenue</p>
            <p className="mt-2 font-serif text-3xl text-[#1E5336]">₱{totalRevenue.toLocaleString()}</p>
            <p className="mt-1 text-xs text-[#6B756B]">From paid reservations</p>
          </div>

          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Pending Payments</p>
            <p className="mt-2 font-serif text-3xl text-[#E1A728]">{pendingPayments}</p>
            <p className="mt-1 text-xs text-[#6B756B]">Requires verification action</p>
          </div>

          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Active Paddle Rentals</p>
            <p className="mt-2 font-serif text-3xl text-emerald-700">{activeRentalsCount}</p>
            <p className="mt-1 text-xs text-[#6B756B]">Currently rented or reserved</p>
          </div>

          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Courts Operational</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#1E5336]">
              <span>1 Available</span> · <span>1 Reserved</span> · <span>1 Open Play</span>
            </div>
          </div>
        </div>

        {/* Cottage & Event bookings */}
        <div className="mb-8 border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#222222]/10 pb-3">
            <div>
              <h2 className="font-serif text-2xl text-[#1E5336]">Cottage &amp; Event Bookings</h2>
              <p className="mt-1 text-xs text-[#6B756B]">
                {cottageLoading
                  ? 'Loading guests…'
                  : `${cottageActive.length} booking${cottageActive.length === 1 ? '' : 's'} · ${unpaidCottage} unpaid`}
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-bold uppercase tracking-[0.12em] text-[#1E5336] hover:underline"
            >
              View all guests →
            </Link>
          </div>

          {cottageLoading ? (
            <p className="py-6 text-center text-xs text-[#6B756B]">Loading cottage &amp; event guests…</p>
          ) : recentCottage.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-[#6B756B]">
                No cottage or event bookings yet. Guests who reserve from the website or the venue QR
                will appear here.
              </p>
              <Link
                href="/admin/bookings"
                className="mt-2 inline-block text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] underline"
              >
                Open bookings &amp; walk-ins
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] font-bold uppercase tracking-wider text-[#6B756B]">
                  <tr>
                    <th className="p-3">Guest</th>
                    <th className="p-3">Cottage / Venue</th>
                    <th className="p-3">Date &amp; Time</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {recentCottage.map((b) => (
                    <tr key={b.reference} className="hover:bg-amber-50/30">
                      <td className="p-3">
                        <p className="font-bold text-[#222222]">{b.name || 'Guest'}</p>
                        {b.contact && (
                          <p className="mt-0.5 text-[10px] text-[#6B756B]">{b.contact}</p>
                        )}
                        {b.email && (
                          <p className="mt-0.5 break-all text-[10px] text-[#6B756B]">{b.email}</p>
                        )}
                      </td>
                      <td className="p-3 text-[#1E5336]">
                        {b.itemName}
                        <span className="mt-0.5 block font-mono text-[10px] text-[#6B756B]">
                          {b.reference}
                        </span>
                      </td>
                      <td className="p-3 text-[#6B756B]">
                        {b.date} · {b.time}
                      </td>
                      <td className="p-3 font-bold text-[#1E5336]">{peso(b.amount)}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase ${
                            b.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#E1A728]/20 text-[#1E5336]'
                          }`}
                        >
                          {b.paymentStatus === 'paid'
                            ? `Paid · ${paidMethodLabel(b.paidMethod)}`
                            : b.payment === 'cash'
                              ? 'Unpaid at venue'
                              : 'Unpaid online'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/admin/bookings?ref=${encodeURIComponent(b.reference)}`}
                          className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1E5336] underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="mb-8">
          <DashboardCharts reservations={reservations} paddles={paddles} />
        </div>

        {/* Reservations Table */}
        <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[#222222]/10 pb-3">
            <h2 className="font-serif text-2xl text-[#1E5336]">Recent Reservations</h2>
            <Link href="/admin/reservations" className="text-xs text-[#1E5336] uppercase tracking-[0.12em] font-bold hover:underline">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Booking Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Court</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/10">
                {reservations.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/30">
                    <td className="p-3 font-mono font-bold text-[#1E5336]">{r.bookingId}</td>
                    <td className="p-3 font-bold text-[#222222]">
                      {r.customerName}
                      {r.paddleRentalName && (
                        <span className="block text-[10px] font-normal text-emerald-800 font-sans">
                          + {r.paddleRentalName} Rental
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#1E5336]">{r.court}</td>
                    <td className="p-3 text-[#6B756B]">{r.date} · {r.time}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                        r.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E1A728]/20 text-[#1E5336]'
                      }`}>
                        {r.paymentMethod} ({r.paymentStatus})
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                        r.bookingStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.bookingStatus}
                      </span>
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
