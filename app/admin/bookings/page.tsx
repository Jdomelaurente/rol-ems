'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react'

type Booking = {
  reference: string
  facility: string
  itemName: string
  date: string
  time: string
  nights?: number | null
  hours?: number | null
  guests: number
  name?: string | null
  contact?: string | null
  email?: string | null
  amount: number
  payment: string
  status: string
  paymentStatus?: string
  paidMethod?: string | null
  paymentReference?: string | null
  paidAt?: string | null
  archivedAt?: string | null
  createdAt: string
}

const statuses = ['pending', 'confirmed', 'completed', 'expired', 'cancelled'] as const

const paidMethods = [
  { id: 'cash', label: 'Cash' },
  { id: 'gcash', label: 'GCash' },
  { id: 'maya', label: 'Maya' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank transfer' },
] as const

const paidMethodLabel = (id?: string | null) =>
  paidMethods.find((m) => m.id === id)?.label || id || ''

const statusStyles: Record<string, string> = {
  pending: 'border-[#E1A728]/50 bg-[#E1A728]/10 text-[#8a6412]',
  confirmed: 'border-[#1E5336]/30 bg-[#1E5336]/10 text-[#1E5336]',
  completed: 'border-[#222222]/20 bg-[#222222]/5 text-[#6B756B]',
  expired: 'border-[#222222]/20 bg-[#222222]/5 text-[#6B756B]',
  cancelled: 'border-rose-500/30 bg-rose-50 text-rose-700',
}

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const peso = (value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const facilityType = (facility: string) => {
  if (facility.startsWith('event:')) return 'Event venue'
  if (facility.startsWith('cottage:')) return 'Cottage'
  return facility
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'unpaid' | 'pending' | 'confirmed' | 'completed' | 'archived'>('all')
  const [updating, setUpdating] = useState('')
  const [today, setToday] = useState('')
  const [origin, setOrigin] = useState('')
  const [paymentModal, setPaymentModal] = useState<Booking | null>(null)
  const [payChoice, setPayChoice] = useState<'cash' | 'cashless' | 'manual'>('cash')
  const [manualMethod, setManualMethod] = useState('gcash')
  const [payRef, setPayRef] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentQr, setPaymentQr] = useState('')
  const [paymentLink, setPaymentLink] = useState('')
  const [paymentDemo, setPaymentDemo] = useState(false)
  const [generatingQr, setGeneratingQr] = useState(false)
  const [qrError, setQrError] = useState('')
  const [pendingRef, setPendingRef] = useState('')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'archive' | 'delete'
    booking: Booking
  } | null>(null)

  useEffect(() => {
    setToday(todayIso())
    setOrigin(window.location.origin)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings?archived=all', { cache: 'no-store' })
      if (!res.ok) throw new Error('Could not load bookings')
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (reference: string, status: string) => {
    setUpdating(reference)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Could not update booking')
      setBookings((prev) =>
        prev.map((b) => (b.reference === reference ? { ...b, status } : b)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update booking')
    } finally {
      setUpdating('')
    }
  }

  const setArchived = async (booking: Booking, archive: boolean): Promise<boolean> => {
    setUpdating(booking.reference)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not archive booking')
      setBookings((prev) =>
        prev.map((b) => (b.reference === booking.reference ? { ...b, ...data } : b)),
      )
      setPaymentModal((prev) =>
        prev && prev.reference === booking.reference ? { ...prev, ...data } : prev,
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not archive booking')
      return false
    } finally {
      setUpdating('')
    }
  }

  const deletePermanently = async (booking: Booking): Promise<boolean> => {
    setUpdating(booking.reference)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.reference)}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not delete booking')
      setBookings((prev) => prev.filter((b) => b.reference !== booking.reference))
      setPaymentModal((prev) => (prev?.reference === booking.reference ? null : prev))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete booking')
      return false
    } finally {
      setUpdating('')
    }
  }

  const runConfirmedAction = async () => {
    if (!confirmAction) return
    const { type, booking } = confirmAction
    const ok =
      type === 'archive'
        ? await setArchived(booking, true)
        : await deletePermanently(booking)
    if (ok) setConfirmAction(null)
  }

  const openPaymentModal = (booking: Booking) => {
    setPaymentModal(booking)
    setPayChoice('cash')
    setManualMethod(booking.paidMethod && booking.paidMethod !== 'cash' ? booking.paidMethod : 'gcash')
    setPayRef(booking.paymentReference || '')
    setPaymentError('')
    setPaymentQr('')
    setPaymentLink('')
    setPaymentDemo(false)
    setGeneratingQr(false)
    setQrError('')
  }

  // Deep link from the dashboard: /admin/bookings?ref=ROL-XXXX opens that guest.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) setPendingRef(ref)
  }, [])

  useEffect(() => {
    if (!pendingRef || bookings.length === 0) return
    const found = bookings.find((b) => b.reference === pendingRef)
    if (found) openPaymentModal(found)
    setPendingRef('')
  }, [pendingRef, bookings])

  const recordPayment = async (markUnpaid = false, method?: string, reference?: string) => {
    if (!paymentModal) return
    setSavingPayment(true)
    setPaymentError('')
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(paymentModal.reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          markUnpaid
            ? { paymentStatus: 'unpaid' }
            : {
                paymentStatus: 'paid',
                paidMethod: method ?? manualMethod,
                paymentReference: (reference ?? payRef).trim(),
              },
        ),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not record payment')
      setBookings((prev) =>
        prev.map((b) => (b.reference === data.reference ? { ...b, ...data } : b)),
      )
      setPaymentModal(data)
      setPaymentQr('')
      setPaymentLink('')
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Could not record payment')
    } finally {
      setSavingPayment(false)
    }
  }

  const generatePaymentLink = async () => {
    if (!paymentModal) return
    setGeneratingQr(true)
    setQrError('')
    try {
      const res = await fetch(
        `/api/admin/bookings/${encodeURIComponent(paymentModal.reference)}/payment-link`,
        { method: 'POST' },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not create the GCash QR')
      setPaymentQr(data.qrDataUrl || '')
      setPaymentLink(data.checkoutUrl || '')
      setPaymentDemo(!!data.demo)
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Could not create the GCash QR')
    } finally {
      setGeneratingQr(false)
    }
  }

  const checkPaymentNow = async () => {
    if (!paymentModal) return
    try {
      const res = await fetch(
        `/api/bookings?reference=${encodeURIComponent(paymentModal.reference)}`,
        { cache: 'no-store' },
      )
      if (!res.ok) return
      const data = await res.json()
      const found = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!found) return
      setBookings((prev) =>
        prev.map((b) => (b.reference === found.reference ? { ...b, ...found } : b)),
      )
      setPaymentModal(found)
      if (found.paymentStatus === 'paid') {
        setPaymentQr('')
        setPaymentLink('')
      }
    } catch {
      // Ignore transient polling errors.
    }
  }

  // While a GCash QR is on screen, poll until PayMongo's webhook marks it paid.
  useEffect(() => {
    if (!paymentModal?.reference || !paymentLink) return
    const reference = paymentModal.reference
    const timer = setInterval(() => {
      fetch(`/api/bookings?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const found = Array.isArray(data) && data.length > 0 ? data[0] : null
          if (!found || found.paymentStatus !== 'paid') return
          setBookings((prev) =>
            prev.map((b) => (b.reference === found.reference ? { ...b, ...found } : b)),
          )
          setPaymentModal(found)
          setPaymentQr('')
          setPaymentLink('')
        })
        .catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [paymentModal?.reference, paymentLink])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return bookings
      .filter((b) => {
        if (filter === 'archived') {
          if (!b.archivedAt) return false
        } else if (b.archivedAt) {
          return false
        }
        if (filter === 'today' && b.date !== today) return false
        if (filter === 'unpaid' && !(b.payment === 'cash' && b.paymentStatus !== 'paid')) return false
        if (filter !== 'all' && filter !== 'today' && filter !== 'unpaid' && filter !== 'archived' && b.status !== filter) return false
        if (!needle) return true
        return [b.reference, b.name, b.contact, b.email, b.itemName, b.facility]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle))
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        return a.createdAt < b.createdAt ? 1 : -1
      })
  }, [bookings, filter, search, today])

  const activeBookings = bookings.filter((b) => !b.archivedAt)
  const archivedCount = bookings.filter((b) => b.archivedAt).length
  const todayCount = activeBookings.filter((b) => b.date === today).length
  const pendingCount = activeBookings.filter(
    (b) => b.status === 'pending' && b.payment !== 'cash' && b.paymentStatus !== 'paid',
  ).length
  const unpaidVenueCount = activeBookings.filter(
    (b) => b.payment === 'cash' && b.paymentStatus !== 'paid',
  ).length
  const walkInQrUrl = `${origin}/cottage?src=qr`

  const printStandee = () => {
    const origin = window.location.origin
    const qr = `${origin}/scan-to-book-qr.svg`
    const page = window.open('', '_blank', 'width=640,height=900')
    if (!page) return
    page.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ROL-EMS · Scan to book</title>
    <style>
      @page { size: A5 portrait; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
        font-family: ui-serif, Georgia, "Times New Roman", serif; background: #FDFBF7; color: #1E5336;
      }
      .card { width: 100%; max-width: 420px; padding: 40px 32px; text-align: center; border: 2px solid #1E5336; }
      .eyebrow { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #E1A728; }
      h1 { font-size: 40px; line-height: .95; margin: 10px 0 0; letter-spacing: -.04em; }
      .sub { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 12px; color: #6B756B; margin-top: 10px; line-height: 1.6; }
      img { width: 280px; height: 280px; margin: 26px auto 10px; display: block; }
      .url { font-family: ui-monospace, monospace; font-size: 10px; color: #6B756B; word-break: break-all; }
      .brand { margin-top: 22px; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; font-family: ui-sans-serif, system-ui, sans-serif; }
      .brand span { color: #E1A728; }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="eyebrow">Cottage &amp; Event</p>
      <h1>Scan to book</h1>
      <p class="sub">Point your phone camera at the code.<br />Choose a cottage or event venue and reserve it in minutes.</p>
      <img src="${qr}" alt="QR code to the booking page" />
      <p class="url">${origin}/cottage</p>
      <p class="brand">ROL-EMS <span>×</span> REBAR</p>
    </div>
  </body>
</html>`)
    page.document.close()
    page.focus()
    setTimeout(() => page.print(), 500)
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] pb-16 text-[#222222]">
      <section className="border-b border-[#222222]/10 bg-[#FDFBF7] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Cottage &amp; Event</p>
            <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Bookings &amp; walk-ins</h1>
            <p className="mt-2 max-w-xl text-xs leading-5 text-[#6B756B]">
              Every real reservation from the website and the venue QR lands here. Click a guest&apos;s
              name to open their details, then record cash or generate a GCash QR for cashless
              payment.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/catalog"
              className="flex items-center gap-2 border border-[#222222]/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B756B] transition hover:border-[#1E5336] hover:text-[#1E5336]"
            >
              <ArrowLeft size={14} /> Catalog
            </Link>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 border border-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7] disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Arrivals today</p>
            <p className="mt-1 font-serif text-3xl text-[#1E5336]">{todayCount}</p>
          </div>
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Awaiting online payment</p>
            <p className="mt-1 font-serif text-3xl text-[#E1A728]">{pendingCount}</p>
          </div>
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Unpaid at venue</p>
            <p className="mt-1 font-serif text-3xl text-rose-700">{unpaidVenueCount}</p>
          </div>
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Total bookings</p>
            <p className="mt-1 font-serif text-3xl text-[#222222]">{activeBookings.length}</p>
            <p className="mt-1 text-[10px] text-[#6B756B]">{archivedCount} archived</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-rose-500/30 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {([
              ['all', 'All'],
              ['today', 'Today'],
              ['unpaid', 'Unpaid at venue'],
              ['pending', 'Pending'],
              ['confirmed', 'Confirmed'],
              ['completed', 'Completed'],
              ['archived', `Archived${archivedCount ? ` (${archivedCount})` : ''}`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                  filter === key
                    ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                    : 'border-[#222222]/15 bg-[#FDFBF7] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex w-full items-center gap-2 border border-[#222222]/20 bg-[#FDFBF7] px-3 py-2 lg:w-72">
            <Search size={14} className="text-[#6B756B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, name, contact"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[#6B756B]/60"
            />
          </label>
        </div>

        <div className="overflow-x-auto border border-[#222222]/15 bg-[#FDFBF7]">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="border-b border-[#222222]/10 bg-[#F3F0EC]/60 text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#6B756B]">
                    <Loader2 size={18} className="mx-auto mb-2 animate-spin" />
                    Loading bookings…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#6B756B]">
                    <CalendarCheck size={22} className="mx-auto mb-2 text-[#E1A728]" />
                    No bookings match this view yet.
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr key={booking.reference} className="align-top transition hover:bg-[#F3F0EC]/50">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-[#1E5336]">{booking.reference}</p>
                      <p className="mt-0.5 text-[10px] text-[#6B756B]">{facilityType(booking.facility)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openPaymentModal(booking)}
                        title="Open guest details"
                        className="text-left font-bold text-[#222222] hover:text-[#1E5336] hover:underline"
                      >
                        {booking.name || 'Guest'}
                      </button>
                      <p className="mt-0.5 text-[10px] text-[#6B756B]">{booking.contact || 'No contact'}</p>
                      {booking.email && (
                        <p className="mt-0.5 break-all text-[10px] text-[#6B756B]">{booking.email}</p>
                      )}
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="text-[#222222]">{booking.itemName}</p>
                      <p className="mt-0.5 text-[10px] text-[#6B756B]">{booking.guests} guest{booking.guests === 1 ? '' : 's'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#222222]">{booking.date}</p>
                      <p className="mt-0.5 text-[10px] text-[#6B756B]">{booking.time}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1E5336]">{peso(booking.amount)}</td>
                    <td className="px-4 py-3">
                      {booking.paymentStatus === 'paid' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 border border-[#1E5336]/30 bg-[#1E5336]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1E5336]">
                            <CheckCircle2 size={11} /> Paid
                          </span>
                          <p className="mt-1 text-[10px] text-[#6B756B]">
                            {paidMethodLabel(booking.paidMethod)}
                            {booking.paymentReference ? ` · ${booking.paymentReference}` : ''}
                          </p>
                          <button
                            onClick={() => openPaymentModal(booking)}
                            className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#6B756B] underline hover:text-[#1E5336]"
                          >
                            Manage
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span
                            className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${
                              booking.payment === 'cash'
                                ? 'border-[#E1A728]/50 bg-[#E1A728]/10 text-[#8a6412]'
                                : 'border-[#222222]/15 text-[#6B756B]'
                            }`}
                          >
                            {booking.payment === 'cash' ? 'Unpaid · at venue' : 'Online · unpaid'}
                          </span>
                          <button
                            onClick={() => openPaymentModal(booking)}
                            className="mt-2 flex items-center gap-1 border border-[#1E5336] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7]"
                          >
                            <Banknote size={11} /> Record payment
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${statusStyles[booking.status] || statusStyles.pending}`}>
                        {booking.status}
                      </span>
                      <select
                        value={booking.status}
                        disabled={updating === booking.reference}
                        onChange={(e) => updateStatus(booking.reference, e.target.value)}
                        className="mt-2 block w-full border border-[#222222]/20 bg-white px-2 py-1 text-[10px] focus:border-[#1E5336] focus:outline-none disabled:opacity-50"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {booking.archivedAt ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[9px] uppercase tracking-[0.1em] text-[#6B756B]">
                            Archived {new Date(booking.archivedAt).toLocaleDateString('en-PH')}
                          </span>
                          <button
                            onClick={() => setArchived(booking, false)}
                            disabled={updating === booking.reference}
                            className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] underline disabled:opacity-50"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'delete', booking })}
                            disabled={updating === booking.reference}
                            className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 underline disabled:opacity-50"
                          >
                            Delete permanently
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <Link
                            href={`/booking/receipt?ref=${encodeURIComponent(booking.reference)}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] hover:underline"
                          >
                            Receipt <ExternalLink size={11} />
                          </Link>
                          <button
                            onClick={() => setConfirmAction({ type: 'archive', booking })}
                            disabled={updating === booking.reference}
                            className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B756B] underline hover:text-[#1E5336] disabled:opacity-50"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 border border-[#222222]/15 bg-[#FDFBF7] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#1E5336]/20 bg-[#1E5336]/5 text-[#1E5336]">
              <QrCode size={20} />
            </div>
            <div>
              <p className="font-serif text-xl text-[#1E5336]">Venue QR standee</p>
              <p className="mt-1 max-w-xl text-xs leading-5 text-[#6B756B]">
                Print this code and place it at the counter and cottage row. Guests scan it, pick a
                cottage or venue, and the booking appears in this list.
              </p>
              <p className="mt-2 break-all font-mono text-[10px] text-[#6B756B]">{walkInQrUrl}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <img
              src="/scan-to-book-qr.svg"
              alt="Scan to book QR code"
              className="h-24 w-24 border border-[#222222]/10 bg-white p-1"
            />
            <div className="flex flex-col gap-2">
              <Link
                href="/cottage?src=qr"
                target="_blank"
                className="flex items-center gap-2 border border-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7]"
              >
                <ExternalLink size={13} /> Preview guest view
              </Link>
              <button
                onClick={printStandee}
                className="flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDFBF7] transition hover:bg-[#153d27]"
              >
                <Printer size={13} /> Print standee
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmAction && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-action-title"
        >
          <div className="w-full max-w-md border border-[#222222]/15 bg-[#FDFBF7] shadow-2xl">
            <div
              className={`flex items-start gap-3 px-6 py-5 ${
                confirmAction.type === 'delete'
                  ? 'bg-rose-700 text-white'
                  : 'bg-[#1E5336] text-[#FDFBF7]'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-white/10">
                {confirmAction.type === 'delete' ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Archive size={18} />
                )}
              </div>
              <div>
                <p
                  className={`text-[10px] uppercase tracking-[0.18em] ${
                    confirmAction.type === 'delete' ? 'text-white/70' : 'text-[#E1A728]'
                  }`}
                >
                  {confirmAction.type === 'delete' ? 'Permanent deletion' : 'Archive booking'}
                </p>
                <h2 id="confirm-action-title" className="mt-1 font-serif text-xl">
                  {confirmAction.type === 'delete' ? 'Delete permanently?' : 'Move to archive?'}
                </h2>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs leading-5 text-[#6B756B]">
                {confirmAction.type === 'delete' ? (
                  <>
                    Delete{' '}
                    <span className="font-mono font-bold text-[#222222]">
                      {confirmAction.booking.reference}
                    </span>{' '}
                    permanently? This cannot be undone — the guest, payment, and booking record
                    will be removed.
                  </>
                ) : (
                  <>
                    Archive{' '}
                    <span className="font-mono font-bold text-[#222222]">
                      {confirmAction.booking.reference}
                    </span>
                    ? It will move out of the active list. You can restore it anytime from the
                    Archived tab.
                  </>
                )}
              </p>

              <div className="mt-4 border border-[#222222]/15 bg-[#F3F0EC]/60 px-3 py-2.5">
                <p className="text-xs font-bold text-[#222222]">
                  {confirmAction.booking.name || 'Guest'}
                </p>
                <p className="mt-0.5 text-[10px] text-[#6B756B]">
                  {confirmAction.booking.itemName}
                </p>
                <p className="mt-1 text-[10px] text-[#6B756B]">
                  {confirmAction.booking.date} · {confirmAction.booking.time} ·{' '}
                  {peso(confirmAction.booking.amount)}
                </p>
              </div>

              {error && (
                <p className="mt-3 border border-rose-500/30 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={updating === confirmAction.booking.reference}
                  className="border border-[#222222]/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#222222]/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={runConfirmedAction}
                  disabled={updating === confirmAction.booking.reference}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60 ${
                    confirmAction.type === 'delete'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : 'bg-[#1E5336] hover:bg-[#153d27]'
                  }`}
                >
                  {updating === confirmAction.booking.reference ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : confirmAction.type === 'delete' ? (
                    <Trash2 size={13} />
                  ) : (
                    <Archive size={13} />
                  )}
                  {updating === confirmAction.booking.reference
                    ? 'Working…'
                    : confirmAction.type === 'delete'
                      ? 'Delete permanently'
                      : 'Archive booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
          <div className="my-8 w-full max-w-lg border border-[#222222]/15 bg-[#FDFBF7] shadow-2xl">
            <div className="flex items-start justify-between gap-4 bg-[#1E5336] px-6 py-5 text-[#FDFBF7]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">Guest booking</p>
                <h2 className="mt-1 font-serif text-2xl">{paymentModal.name || 'Guest'}</h2>
                <p className="mt-1 text-[11px] text-[#FDFBF7]/70">
                  {paymentModal.contact || 'No contact'}
                  {paymentModal.email ? ` · ${paymentModal.email}` : ''}
                </p>
              </div>
              <button
                onClick={() => setPaymentModal(null)}
                aria-label="Close"
                className="p-1 text-[#FDFBF7]/70 hover:text-[#FDFBF7]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Reference</p>
                  <p className="mt-0.5 font-mono font-bold text-[#1E5336]">{paymentModal.reference}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Status</p>
                  <p className="mt-0.5 capitalize">{paymentModal.status}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Booking</p>
                  <p className="mt-0.5">{paymentModal.itemName}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Date &amp; time</p>
                  <p className="mt-0.5">{paymentModal.date} · {paymentModal.time}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Guests</p>
                  <p className="mt-0.5">{paymentModal.guests}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Amount</p>
                  <p className="mt-0.5 font-bold text-[#1E5336]">{peso(paymentModal.amount)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">Payment</p>
                  <p className="mt-0.5">
                    {paymentModal.paymentStatus === 'paid'
                      ? `Paid · ${paidMethodLabel(paymentModal.paidMethod)}`
                      : paymentModal.payment === 'cash'
                      ? 'Unpaid at venue'
                      : 'Online unpaid'}
                  </p>
                </div>
              </div>

              <div className="my-5 border-t border-[#222222]/10" />

              {paymentModal.paymentStatus === 'paid' ? (
                <div className="border border-[#1E5336]/30 bg-[#1E5336]/5 p-4">
                  <div className="flex items-center gap-2 text-[#1E5336]">
                    <CheckCircle2 size={16} />
                    <p className="text-sm font-bold">
                      Paid · {paidMethodLabel(paymentModal.paidMethod)}
                    </p>
                  </div>
                  {paymentModal.paymentReference && (
                    <p className="mt-1 text-[11px] text-[#6B756B]">
                      Reference: {paymentModal.paymentReference}
                    </p>
                  )}
                  {paymentModal.paidAt && (
                    <p className="mt-0.5 text-[11px] text-[#6B756B]">
                      Recorded {new Date(paymentModal.paidAt).toLocaleString('en-PH')}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/booking/receipt?ref=${encodeURIComponent(paymentModal.reference)}`}
                      target="_blank"
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] underline"
                    >
                      View receipt
                    </Link>
                    <button
                      onClick={() => recordPayment(true)}
                      disabled={savingPayment}
                      className="text-[10px] uppercase tracking-[0.12em] text-rose-700 underline disabled:opacity-50"
                    >
                      Mark as unpaid
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                    How did the guest pay?
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPayChoice('cash')
                        setPaymentQr('')
                        setPaymentLink('')
                        setQrError('')
                      }}
                      className={`flex items-center gap-2 border px-3 py-3 text-left text-xs transition ${
                        payChoice === 'cash'
                          ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                          : 'border-[#222222]/20 text-[#6B756B] hover:border-[#1E5336]/50 hover:text-[#1E5336]'
                      }`}
                    >
                      <Banknote size={16} /> Cash
                    </button>
                    <button
                      onClick={() => {
                        setPayChoice('cashless')
                        setQrError('')
                      }}
                      className={`flex items-center gap-2 border px-3 py-3 text-left text-xs transition ${
                        payChoice === 'cashless'
                          ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                          : 'border-[#222222]/20 text-[#6B756B] hover:border-[#1E5336]/50 hover:text-[#1E5336]'
                      }`}
                    >
                      <QrCode size={16} /> Cashless
                    </button>
                  </div>

                  {payChoice === 'cash' && (
                    <div className="mt-3 border border-[#E1A728]/40 bg-[#E1A728]/10 p-3">
                      <p className="text-[11px] leading-5 text-[#8a6412]">
                        Collect {peso(paymentModal.amount)} in cash at the counter, then confirm below.
                      </p>
                      <button
                        onClick={() => recordPayment(false, 'cash', '')}
                        disabled={savingPayment}
                        className="mt-2 flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-60"
                      >
                        {savingPayment ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Mark cash as received
                      </button>
                    </div>
                  )}

                  {payChoice === 'cashless' && (
                    <div className="mt-3 border border-[#222222]/15 p-3">
                      {!paymentQr ? (
                        <>
                          <p className="text-[11px] leading-5 text-[#6B756B]">
                            Generate a PayMongo GCash QR. The guest scans it with their phone and pays
                            the exact amount. The booking is marked paid automatically.
                          </p>
                          <button
                            onClick={generatePaymentLink}
                            disabled={generatingQr}
                            className="mt-2 flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-60"
                          >
                            {generatingQr ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <QrCode size={13} />
                            )}
                            Generate GCash QR
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <img
                            src={paymentQr}
                            alt="PayMongo GCash QR code"
                            className="mx-auto h-56 w-56"
                          />
                          <p className="mt-2 text-[11px] leading-5 text-[#6B756B]">
                            Ask the guest to scan this with their phone camera or GCash app.
                          </p>
                          {paymentDemo && (
                            <p className="mt-1 text-[10px] text-[#8a6412]">
                              Demo mode — PayMongo keys are not configured.
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                            <a
                              href={paymentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="border border-[#1E5336] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
                            >
                              Open payment link
                            </a>
                            <button
                              onClick={checkPaymentNow}
                              className="border border-[#222222]/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B756B] hover:border-[#222222]/50"
                            >
                              Check status
                            </button>
                          </div>
                          <p className="mt-2 text-[10px] text-[#6B756B]">
                            This screen refreshes automatically once PayMongo confirms the payment.
                          </p>
                        </div>
                      )}
                      {qrError && (
                        <p className="mt-2 border border-rose-500/30 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">
                          {qrError}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setPayChoice(payChoice === 'manual' ? 'cash' : 'manual')}
                    className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#6B756B] underline"
                  >
                    Record a different cashless method manually
                  </button>

                  {payChoice === 'manual' && (
                    <div className="mt-3 border border-[#222222]/15 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {paidMethods
                          .filter((m) => m.id !== 'cash')
                          .map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setManualMethod(m.id)}
                              className={`border px-3 py-2 text-left text-xs transition ${
                                manualMethod === m.id
                                  ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                                  : 'border-[#222222]/20 text-[#6B756B] hover:border-[#1E5336]/50 hover:text-[#1E5336]'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                      </div>
                      <label className="mt-2 block">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                          {manualMethod === 'card'
                            ? 'Approval / OR number'
                            : `${paidMethodLabel(manualMethod)} reference no.`}{' '}
                          <span className="normal-case text-[#6B756B]/60">(optional)</span>
                        </span>
                        <input
                          value={payRef}
                          onChange={(e) => setPayRef(e.target.value)}
                          placeholder="e.g. 1234 567 890123"
                          className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                        />
                      </label>
                      <button
                        onClick={() => recordPayment(false, manualMethod, payRef)}
                        disabled={savingPayment}
                        className="mt-2 flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-60"
                      >
                        {savingPayment ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Mark as paid
                      </button>
                    </div>
                  )}

                  {paymentError && (
                    <p className="mt-3 border border-rose-500/30 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                      {paymentError}
                    </p>
                  )}
                </>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#222222]/10 pt-4">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">
                  {paymentModal.archivedAt ? 'Archived booking' : 'Booking record'}
                </span>
                {paymentModal.archivedAt ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setArchived(paymentModal, false)}
                      disabled={updating === paymentModal.reference}
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] underline disabled:opacity-50"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: 'delete', booking: paymentModal })}
                      disabled={updating === paymentModal.reference}
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 underline disabled:opacity-50"
                    >
                      Delete permanently
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmAction({ type: 'archive', booking: paymentModal })}
                    disabled={updating === paymentModal.reference}
                    className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B756B] underline hover:text-[#1E5336] disabled:opacity-50"
                  >
                    Archive booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
