'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useCottageCatalog } from '@/context/CottageContext'
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Banknote,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Pencil,
  Printer,
  QrCode,
  Receipt,
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

type BookingStats = {
  active: number
  archived: number
  today: number
  pending: number
  unpaidVenue: number
}

type BookingDraft = {
  status: string
  name: string
  contact: string
  email: string
  facility: string
  itemName: string
  date: string
  time: string
  guests: string
  nights: string
  hours: string
  amount: string
}

type BookingPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type PagedBookingsResponse = {
  bookings: Booking[]
  pagination: BookingPagination
  stats: BookingStats
}

const PAGE_SIZE = 5

const emptyPagination: BookingPagination = {
  page: 1,
  pageSize: PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const emptyStats: BookingStats = {
  active: 0,
  archived: 0,
  today: 0,
  pending: 0,
  unpaidVenue: 0,
}

function SkeletonBlock({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}

// Wireframe placeholder that mirrors the real table rows while the paged
// response is in flight, so the layout never collapses to a bare spinner.
function BookingRowSkeleton({ index }: { index: number }) {
  const delay = index * 90
  return (
    <tr className="align-top" aria-hidden="true">
      <td className="px-4 py-3">
        <SkeletonBlock className="h-4 w-4 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <SkeletonBlock className="h-3 w-20 bg-[#222222]/10" delay={delay} />
        <SkeletonBlock className="mt-1.5 h-2 w-14 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <SkeletonBlock className="h-3 w-24 bg-[#222222]/10" delay={delay} />
        <SkeletonBlock className="mt-1.5 h-2 w-20 bg-[#222222]/10" delay={delay} />
        <SkeletonBlock className="mt-1.5 h-2 w-28 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="max-w-[220px] px-4 py-3">
        <SkeletonBlock className="h-3 w-32 bg-[#222222]/10" delay={delay} />
        <SkeletonBlock className="mt-1.5 h-2 w-16 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <SkeletonBlock className="h-3 w-20 bg-[#222222]/10" delay={delay} />
        <SkeletonBlock className="mt-1.5 h-2 w-14 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <SkeletonBlock className="h-3 w-16 bg-[#1E5336]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <SkeletonBlock className="h-4 w-24 bg-[#222222]/10" delay={delay} />
        <SkeletonBlock className="mt-2 h-5 w-28 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <SkeletonBlock className="h-4 w-16 bg-[#222222]/10" delay={delay} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <SkeletonBlock className="h-7 w-7 bg-[#222222]/10" delay={delay} />
          <SkeletonBlock className="h-7 w-7 bg-[#222222]/10" delay={delay} />
          <SkeletonBlock className="h-7 w-7 bg-[#222222]/10" delay={delay} />
        </div>
      </td>
    </tr>
  )
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

const facilityTypes = [
  { id: 'cottage', label: 'Cottage' },
  { id: 'event', label: 'Event venue' },
  { id: 'badminton', label: 'Badminton court' },
  { id: 'pickleball', label: 'Pickleball court' },
  { id: 'taekwondo', label: 'Taekwondo floor' },
] as const

const splitFacility = (facility: string) => {
  const index = facility.indexOf(':')
  if (index === -1) return { type: 'other', name: facility }
  return { type: facility.slice(0, index), name: facility.slice(index + 1) }
}

const facilityTypeLabel = (type: string) =>
  facilityTypes.find((item) => item.id === type)?.label || type

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
  const { catalog } = useCottageCatalog()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'unpaid' | 'pending' | 'confirmed' | 'completed' | 'archived'>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<BookingPagination>(emptyPagination)
  const [stats, setStats] = useState<BookingStats>(emptyStats)
  const [updating, setUpdating] = useState('')
  const [paymentModal, setPaymentModal] = useState<Booking | null>(null)
  const [payChoice, setPayChoice] = useState<'cash' | 'cashless' | 'manual'>('cash')
  const [manualMethod, setManualMethod] = useState('gcash')
  const [payRef, setPayRef] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentQr, setPaymentQr] = useState('')
  const [paymentLink, setPaymentLink] = useState('')
  const [paymentDemo, setPaymentDemo] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [generatingQr, setGeneratingQr] = useState(false)
  const [qrError, setQrError] = useState('')
  const [selectedRefs, setSelectedRefs] = useState<string[]>([])
  const [bulkWorking, setBulkWorking] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'archive' | 'delete'
    bookings: Booking[]
  } | null>(null)
  const [statusModal, setStatusModal] = useState<Booking | null>(null)
  const [editDraft, setEditDraft] = useState<BookingDraft | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({
          paginate: '1',
          page: String(page),
          pageSize: String(PAGE_SIZE),
          view: filter,
          today: todayIso(),
        })
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())

        const res = await fetch(`/api/bookings?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Could not load bookings')
        const data: PagedBookingsResponse = await res.json()

        if (Array.isArray(data)) throw new Error('Unexpected bookings response')
        const nextBookings = Array.isArray(data.bookings) ? data.bookings : []
        setBookings(nextBookings)
        setSelectedRefs((prev) =>
          prev.filter((ref) => nextBookings.some((booking) => booking.reference === ref)),
        )
        setPagination(data.pagination ?? emptyPagination)
        setStats(data.stats ?? emptyStats)
        if (data.pagination && data.pagination.page !== page) {
          // The server clamps the page when the last row on a page is removed.
          setPage(data.pagination.page)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load bookings')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [page, filter, debouncedSearch],
  )

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setSelectedRefs([])
  }, [page, filter, debouncedSearch])

  const openEditModal = (booking: Booking) => {
    setStatusModal(booking)
    setEditDraft({
      status: booking.status,
      name: booking.name || '',
      contact: booking.contact || '',
      email: booking.email || '',
      facility: booking.facility,
      itemName: booking.itemName,
      date: booking.date,
      time: booking.time,
      guests: String(booking.guests ?? 1),
      nights: booking.nights != null ? String(Math.max(1, booking.nights)) : '',
      hours: booking.hours != null ? String(Math.max(1, booking.hours)) : '',
      amount: String(booking.amount ?? 0),
    })
    setError('')
  }

  const updateDraft = (patch: Partial<BookingDraft>) => {
    setEditDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const changeFacility = (nextType: string, nextName: string) => {
    setEditDraft((prev) => {
      if (!prev) return prev
      const current = splitFacility(prev.facility)
      const facility = nextType === 'other' ? nextName : `${nextType}:${nextName}`
      const typeLabels: Record<string, string> = {
        cottage: 'Cottage',
        event: 'Event',
        badminton: 'Badminton',
        pickleball: 'Court',
        taekwondo: 'Taekwondo',
      }
      let itemName = prev.itemName
      if (current.name && current.name !== nextName && itemName.includes(current.name)) {
        itemName = itemName.replace(current.name, nextName)
      }
      const typeLabel = typeLabels[nextType]
      if (typeLabel && current.type !== nextType) {
        itemName = itemName.replace(
          /^(Cottage|Event|Badminton|Pickleball|Court|Taekwondo) · /,
          `${typeLabel} · `,
        )
      }
      return { ...prev, facility, itemName }
    })
  }

  const changeFacilityType = (nextType: string) => {
    if (!editDraft) return
    const currentName = splitFacility(editDraft.facility).name
    if (nextType === 'cottage') {
      const name = catalog.cottages[0]?.name || currentName
      changeFacility(nextType, name)
    } else if (nextType === 'event') {
      const name = catalog.venues[0]?.name || currentName
      changeFacility(nextType, name)
    } else {
      changeFacility(nextType, currentName)
    }
  }

  const saveBookingEdits = async () => {
    if (!statusModal || !editDraft) return
    const reference = statusModal.reference
    setUpdating(reference)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editDraft.status,
          name: editDraft.name.trim(),
          contact: editDraft.contact.trim(),
          email: editDraft.email.trim(),
          facility: editDraft.facility.trim(),
          itemName: editDraft.itemName.trim(),
          date: editDraft.date,
          time: editDraft.time.trim(),
          guests: Math.max(1, Number.parseInt(editDraft.guests, 10) || 1),
          nights: editDraft.nights.trim() ? Number.parseInt(editDraft.nights, 10) : null,
          hours: editDraft.hours.trim() ? Number.parseInt(editDraft.hours, 10) : null,
          amount: Number.parseFloat(editDraft.amount) || 0,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not update booking')
      setBookings((prev) => prev.map((b) => (b.reference === reference ? { ...b, ...data } : b)))
      setPaymentModal((prev) =>
        prev && prev.reference === reference ? { ...prev, ...data } : prev,
      )
      setStatusModal(null)
      setEditDraft(null)
      await load(true)
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
      setSelectedRefs((prev) => prev.filter((ref) => ref !== booking.reference))
      await load(true)
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
      setSelectedRefs((prev) => prev.filter((ref) => ref !== booking.reference))
      await load(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete booking')
      return false
    } finally {
      setUpdating('')
    }
  }

  const runBulkAction = async (
    type: 'archive' | 'restore' | 'delete',
    targets: Booking[],
  ): Promise<boolean> => {
    if (targets.length === 0) return false
    setBulkWorking(true)
    setError('')
    try {
      const results = await Promise.allSettled(
        targets.map(async (booking) => {
          const res = await fetch(`/api/bookings/${encodeURIComponent(booking.reference)}`, {
            method: type === 'delete' ? 'DELETE' : 'PATCH',
            headers: type === 'delete' ? undefined : { 'Content-Type': 'application/json' },
            body: type === 'delete' ? undefined : JSON.stringify({ archive: type === 'archive' }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error || 'Could not update booking')
          return data
        }),
      )

      const rejected = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      )
      setSelectedRefs([])
      await load(true)

      if (rejected.length > 0) {
        const reason =
          rejected[0].reason instanceof Error
            ? rejected[0].reason.message
            : 'Could not update bookings'
        setError(
          rejected.length === 1
            ? reason
            : `${rejected.length} of ${targets.length} bookings could not be updated. ${reason}`,
        )
        return false
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update bookings')
      return false
    } finally {
      setBulkWorking(false)
    }
  }

  const runConfirmedAction = async () => {
    if (!confirmAction) return
    const { type, bookings } = confirmAction
    const ok =
      bookings.length === 1
        ? type === 'archive'
          ? await setArchived(bookings[0], true)
          : await deletePermanently(bookings[0])
        : await runBulkAction(type, bookings)
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
    setPaymentIntentId('')
    setGeneratingQr(false)
    setQrError('')
  }

  // Deep link from the dashboard: /admin/bookings?ref=ROL-XXXX opens that guest.
  // Fetch the single record so pagination does not hide it.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (!ref) return
    let cancelled = false
    fetch(`/api/bookings?reference=${encodeURIComponent(ref)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return
        const found = Array.isArray(data) ? data[0] : null
        if (found) openPaymentModal(found)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

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
      await load(true)
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
      if (!res.ok) throw new Error(data.error || 'Could not create the QR Ph code')
      setPaymentQr(data.qrDataUrl || '')
      setPaymentLink(data.checkoutUrl || '')
      setPaymentDemo(!!data.demo)
      setPaymentIntentId(data.paymentIntentId || '')
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Could not create the QR Ph code')
    } finally {
      setGeneratingQr(false)
    }
  }

  const checkPaymentNow = async () => {
    if (!paymentModal) return
    try {
      // Ask PayMongo directly first; the webhook may still be in flight.
      if (paymentIntentId) {
        await fetch(
          `/api/admin/bookings/${encodeURIComponent(paymentModal.reference)}/payment-link?intent=${encodeURIComponent(paymentIntentId)}`,
          { cache: 'no-store' },
        ).catch(() => null)
      }
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
        await load(true)
      }
    } catch {
      // Ignore transient polling errors.
    }
  }

  // While a QR Ph code is on screen, poll until the payment is confirmed. The
  // first call asks PayMongo directly, so the counter still updates if the
  // webhook is slow; the booking read afterwards reflects the result.
  useEffect(() => {
    if (!paymentModal?.reference || !paymentQr) return
    const reference = paymentModal.reference
    const timer = setInterval(() => {
      const verify = paymentIntentId
        ? fetch(
            `/api/admin/bookings/${encodeURIComponent(reference)}/payment-link?intent=${encodeURIComponent(paymentIntentId)}`,
            { cache: 'no-store' },
          ).catch(() => null)
        : Promise.resolve(null)

      verify
        .then(() =>
          fetch(`/api/bookings?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' }),
        )
        .then((res) => (res && res.ok ? res.json() : null))
        .then((data) => {
          const found = Array.isArray(data) && data.length > 0 ? data[0] : null
          if (!found || found.paymentStatus !== 'paid') return
          setBookings((prev) =>
            prev.map((b) => (b.reference === found.reference ? { ...b, ...found } : b)),
          )
          setPaymentModal(found)
          setPaymentQr('')
          setPaymentLink('')
          void load(true)
        })
        .catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [paymentModal?.reference, paymentQr, paymentIntentId, load])

  const { active: activeTotal, archived: archivedCount, today: todayCount, pending: pendingCount, unpaidVenue: unpaidVenueCount } = stats
  // Only replace the stat numbers with placeholders on the very first load;
  // later refreshes keep the last known counts visible.
  const statsLoading = loading && bookings.length === 0
  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const pageEnd = Math.min(pagination.page * pagination.pageSize, pagination.total)
  const pageRefs = bookings.map((booking) => booking.reference)
  const selectedBookings = bookings.filter((booking) => selectedRefs.includes(booking.reference))
  const allOnPageSelected = pageRefs.length > 0 && selectedBookings.length === pageRefs.length
  const someOnPageSelected = selectedBookings.length > 0 && !allOnPageSelected
  const confirmBookings = confirmAction?.bookings ?? []
  const confirmFirst = confirmBookings[0]
  const confirmBusy =
    bulkWorking || (confirmFirst ? updating === confirmFirst.reference : false)

  const editFacility = editDraft ? splitFacility(editDraft.facility) : { type: 'other', name: '' }
  const editFacilityOptions =
    editFacility.type === 'cottage'
      ? catalog.cottages
      : editFacility.type === 'event'
        ? catalog.venues
        : []
  const editFacilityKnown = facilityTypes.some((item) => item.id === editFacility.type)
  const editFacilityLabel =
    editFacility.type === 'cottage'
      ? 'Cottage'
      : editFacility.type === 'event'
        ? 'Event venue'
        : 'Court / area'
  const canSaveEdit =
    !!editDraft &&
    !!editDraft.facility.trim() &&
    !!editDraft.itemName.trim() &&
    !!editDraft.date &&
    !!editDraft.time.trim()

  const toggleSelected = (reference: string) => {
    setSelectedRefs((prev) =>
      prev.includes(reference) ? prev.filter((ref) => ref !== reference) : [...prev, reference],
    )
  }

  const toggleSelectAllOnPage = () => {
    setSelectedRefs(allOnPageSelected ? [] : pageRefs)
  }

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
              Manage reservations, payments, and guest details.
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
              onClick={() => load()}
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
            {statsLoading ? (
              <SkeletonBlock className="mt-2 h-8 w-12 bg-[#1E5336]/10" />
            ) : (
              <p className="mt-1 font-serif text-3xl text-[#1E5336]">{todayCount}</p>
            )}
          </div>
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Awaiting online payment</p>
            {statsLoading ? (
              <SkeletonBlock className="mt-2 h-8 w-12 bg-[#E1A728]/15" />
            ) : (
              <p className="mt-1 font-serif text-3xl text-[#E1A728]">{pendingCount}</p>
            )}
          </div>
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Unpaid at venue</p>
            {statsLoading ? (
              <SkeletonBlock className="mt-2 h-8 w-12 bg-rose-700/10" />
            ) : (
              <p className="mt-1 font-serif text-3xl text-rose-700">{unpaidVenueCount}</p>
            )}
          </div>
          <div className="border border-[#222222]/15 bg-[#FDFBF7] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Total bookings</p>
            {statsLoading ? (
              <>
                <SkeletonBlock className="mt-2 h-8 w-12 bg-[#222222]/10" />
                <SkeletonBlock className="mt-3 h-2 w-16 bg-[#222222]/10" />
              </>
            ) : (
              <>
                <p className="mt-1 font-serif text-3xl text-[#222222]">{activeTotal}</p>
                <p className="mt-1 text-[10px] text-[#6B756B]">{archivedCount} archived</p>
              </>
            )}
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
                onClick={() => {
                  setFilter(key)
                  setPage(1)
                }}
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

        {selectedBookings.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 border border-[#1E5336]/20 bg-[#1E5336]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336]">
              {selectedBookings.length} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedRefs([])}
                disabled={bulkWorking}
                className="border border-[#222222]/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B756B] transition hover:border-[#222222]/50 disabled:opacity-50"
              >
                Clear
              </button>
              {filter === 'archived' ? (
                <>
                  <button
                    onClick={() => {
                      void runBulkAction('restore', selectedBookings)
                    }}
                    disabled={bulkWorking}
                    className="flex items-center gap-1.5 border border-[#1E5336] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7] disabled:opacity-50"
                  >
                    {bulkWorking ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    Restore selected
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({ type: 'delete', bookings: selectedBookings })
                    }
                    disabled={bulkWorking}
                    className="flex items-center gap-1.5 border border-rose-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-700 hover:text-white disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete permanently
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    setConfirmAction({ type: 'archive', bookings: selectedBookings })
                  }
                  disabled={bulkWorking}
                  className="flex items-center gap-1.5 border border-[#1E5336] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7] disabled:opacity-50"
                >
                  <Archive size={13} /> Archive selected
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto border border-[#222222]/15 bg-[#FDFBF7]">
          <table
            className="w-full min-w-[920px] text-left text-xs"
            aria-busy={loading}
          >
            <thead className="border-b border-[#222222]/10 bg-[#F3F0EC]/60 text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageSelected
                    }}
                    aria-label="Select all bookings on this page"
                    title="Select all on this page"
                    className="h-4 w-4 cursor-pointer accent-[#1E5336]"
                  />
                </th>
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
                <>
                  <tr className="sr-only">
                    <td colSpan={9}>Loading bookings…</td>
                  </tr>
                  {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <BookingRowSkeleton key={`skeleton-${index}`} index={index} />
                  ))}
                </>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#6B756B]">
                    <CalendarCheck size={22} className="mx-auto mb-2 text-[#E1A728]" />
                    No bookings match this view yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const isSelected = selectedRefs.includes(booking.reference)
                  return (
                  <tr
                    key={booking.reference}
                    className={`align-top transition hover:bg-[#F3F0EC]/50 ${
                      isSelected ? 'bg-[#1E5336]/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(booking.reference)}
                        aria-label={`Select booking ${booking.reference}`}
                        className="h-4 w-4 cursor-pointer accent-[#1E5336]"
                      />
                    </td>
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
                    </td>
                    <td className="px-4 py-3 text-right">
                      {booking.archivedAt ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[9px] uppercase tracking-[0.1em] text-[#6B756B]">
                            Archived {new Date(booking.archivedAt).toLocaleDateString('en-PH')}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setArchived(booking, false)}
                              disabled={updating === booking.reference}
                              title="Restore booking"
                              aria-label={`Restore booking ${booking.reference}`}
                              className="inline-flex h-7 w-7 items-center justify-center border border-[#1E5336]/30 text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7] disabled:opacity-50"
                            >
                              {updating === booking.reference ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <RotateCcw size={13} />
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'delete', bookings: [booking] })}
                              disabled={updating === booking.reference}
                              title="Delete permanently"
                              aria-label={`Delete booking ${booking.reference} permanently`}
                              className="inline-flex h-7 w-7 items-center justify-center border border-rose-500/40 text-rose-700 transition hover:bg-rose-700 hover:text-white disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/booking/receipt?ref=${encodeURIComponent(booking.reference)}`}
                            target="_blank"
                            title="View receipt"
                            aria-label={`View receipt for ${booking.reference}`}
                            className="inline-flex h-7 w-7 items-center justify-center border border-[#1E5336]/30 text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7]"
                          >
                            <Receipt size={13} />
                          </Link>
                          <button
                            onClick={() => openEditModal(booking)}
                            disabled={updating === booking.reference}
                            title="Edit status"
                            aria-label={`Edit status for ${booking.reference}`}
                            className="inline-flex h-7 w-7 items-center justify-center border border-[#1E5336]/30 text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7] disabled:opacity-50"
                          >
                            {updating === booking.reference ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Pencil size={13} />
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'archive', bookings: [booking] })}
                            disabled={updating === booking.reference}
                            title="Archive booking"
                            aria-label={`Archive booking ${booking.reference}`}
                            className="inline-flex h-7 w-7 items-center justify-center border border-[#222222]/20 text-[#6B756B] transition hover:border-[#1E5336] hover:text-[#1E5336] disabled:opacity-50"
                          >
                            {updating === booking.reference ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Archive size={13} />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border border-t-0 border-[#222222]/15 bg-[#FDFBF7] px-4 py-3 sm:flex-row">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B756B]">
            Showing {pageStart}–{pageEnd} of {pagination.total} · {PAGE_SIZE} per page
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!pagination.hasPreviousPage || loading}
              title="Previous page"
              aria-label="Previous page"
              className="inline-flex h-7 w-7 items-center justify-center border border-[#222222]/20 text-[#6B756B] transition hover:border-[#1E5336] hover:text-[#1E5336] disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((current) => Math.min(pagination.totalPages, current + 1))
              }
              disabled={!pagination.hasNextPage || loading}
              title="Next page"
              aria-label="Next page"
              className="inline-flex h-7 w-7 items-center justify-center border border-[#222222]/20 text-[#6B756B] transition hover:border-[#1E5336] hover:text-[#1E5336] disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
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
                  {confirmAction.type === 'delete'
                    ? 'Permanent deletion'
                    : confirmBookings.length > 1
                      ? 'Archive bookings'
                      : 'Archive booking'}
                </p>
                <h2 id="confirm-action-title" className="mt-1 font-serif text-xl">
                  {confirmAction.type === 'delete'
                    ? confirmBookings.length > 1
                      ? `Delete ${confirmBookings.length} bookings permanently?`
                      : 'Delete permanently?'
                    : confirmBookings.length > 1
                      ? `Archive ${confirmBookings.length} bookings?`
                      : 'Move to archive?'}
                </h2>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs leading-5 text-[#6B756B]">
                {confirmAction.type === 'delete' ? (
                  confirmBookings.length > 1 ? (
                    <>
                      Delete{' '}
                      <span className="font-bold text-[#222222]">
                        {confirmBookings.length} selected bookings
                      </span>{' '}
                      permanently? This cannot be undone — their guest, payment, and booking
                      records will be removed.
                    </>
                  ) : (
                    <>
                      Delete{' '}
                      <span className="font-mono font-bold text-[#222222]">
                        {confirmFirst?.reference}
                      </span>{' '}
                      permanently? This cannot be undone — the guest, payment, and booking record
                      will be removed.
                    </>
                  )
                ) : confirmBookings.length > 1 ? (
                  <>
                    Archive{' '}
                    <span className="font-bold text-[#222222]">
                      {confirmBookings.length} selected bookings
                    </span>
                    ? They will move out of the active list. You can restore them anytime from the
                    Archived tab.
                  </>
                ) : (
                  <>
                    Archive{' '}
                    <span className="font-mono font-bold text-[#222222]">
                      {confirmFirst?.reference}
                    </span>
                    ? It will move out of the active list. You can restore it anytime from the
                    Archived tab.
                  </>
                )}
              </p>

              <div className="mt-4 border border-[#222222]/15 bg-[#F3F0EC]/60 px-3 py-2.5">
                {confirmBookings.length === 1 && confirmFirst ? (
                  <>
                    <p className="text-xs font-bold text-[#222222]">
                      {confirmFirst.name || 'Guest'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#6B756B]">
                      {confirmFirst.itemName}
                    </p>
                    <p className="mt-1 text-[10px] text-[#6B756B]">
                      {confirmFirst.date} · {confirmFirst.time} · {peso(confirmFirst.amount)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-[#222222]">
                      {confirmBookings.length} bookings selected
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#6B756B]">
                      {confirmAction.type === 'delete'
                        ? 'Their guest, payment, and booking records will be removed.'
                        : 'They will move out of the active list and can be restored later.'}
                    </p>
                  </>
                )}
              </div>

              {error && (
                <p className="mt-3 border border-rose-500/30 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={confirmBusy}
                  className="border border-[#222222]/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#222222]/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={runConfirmedAction}
                  disabled={confirmBusy}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60 ${
                    confirmAction.type === 'delete'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : 'bg-[#1E5336] hover:bg-[#153d27]'
                  }`}
                >
                  {confirmBusy ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : confirmAction.type === 'delete' ? (
                    <Trash2 size={13} />
                  ) : (
                    <Archive size={13} />
                  )}
                  {confirmBusy
                    ? 'Working…'
                    : confirmAction.type === 'delete'
                      ? confirmBookings.length > 1
                        ? `Delete ${confirmBookings.length} permanently`
                        : 'Delete permanently'
                      : confirmBookings.length > 1
                        ? `Archive ${confirmBookings.length}`
                        : 'Archive booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusModal && editDraft && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-booking-title"
        >
          <div className="my-8 w-full max-w-2xl border border-[#222222]/15 bg-[#FDFBF7] shadow-2xl">
            <div className="flex items-start gap-3 bg-[#1E5336] px-6 py-5 text-[#FDFBF7]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-white/10">
                <Pencil size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#E1A728]">
                  Edit booking
                </p>
                <h2 id="edit-booking-title" className="mt-1 font-serif text-xl">
                  Booking details
                </h2>
                <p className="mt-1 truncate font-mono text-[11px] text-[#FDFBF7]/70">
                  {statusModal.reference} · {facilityType(statusModal.facility)}
                </p>
              </div>
              <button
                onClick={() => setStatusModal(null)}
                aria-label="Close"
                className="ml-auto p-1 text-[#FDFBF7]/70 hover:text-[#FDFBF7]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-5">
                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Guest</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Name
                      </span>
                      <input
                        value={editDraft.name}
                        onChange={(e) => updateDraft({ name: e.target.value })}
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Contact
                      </span>
                      <input
                        value={editDraft.contact}
                        onChange={(e) => updateDraft({ contact: e.target.value })}
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      />
                    </label>
                  </div>
                  <label className="mt-3 block">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                      Email
                    </span>
                    <input
                      type="email"
                      value={editDraft.email}
                      onChange={(e) => updateDraft({ email: e.target.value })}
                      className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                    />
                  </label>
                </section>

                <div className="border-t border-[#222222]/10" />

                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                    Booking
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Facility type
                      </span>
                      <select
                        value={editFacility.type}
                        onChange={(e) => changeFacilityType(e.target.value)}
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      >
                        {facilityTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                        {!editFacilityKnown && (
                          <option value={editFacility.type}>
                            {facilityTypeLabel(editFacility.type)}
                          </option>
                        )}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        {editFacilityLabel}
                      </span>
                      {editFacilityOptions.length > 0 ? (
                        <select
                          value={editFacility.name}
                          onChange={(e) => changeFacility(editFacility.type, e.target.value)}
                          className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                        >
                          {!editFacilityOptions.some((item) => item.name === editFacility.name) && (
                            <option value={editFacility.name}>
                              {editFacility.name} (not in catalog)
                            </option>
                          )}
                          {editFacilityOptions.map((item) => (
                            <option key={item.id} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={editFacility.name}
                          onChange={(e) => changeFacility(editFacility.type, e.target.value)}
                          className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                        />
                      )}
                    </label>
                  </div>

                  <label className="mt-3 block">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                      Booking description
                    </span>
                    <input
                      value={editDraft.itemName}
                      onChange={(e) => updateDraft({ itemName: e.target.value })}
                      className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                    />
                  </label>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Date
                      </span>
                      <input
                        type="date"
                        value={editDraft.date}
                        onChange={(e) => updateDraft({ date: e.target.value })}
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Time
                      </span>
                      <input
                        value={editDraft.time}
                        onChange={(e) => updateDraft({ time: e.target.value })}
                        placeholder="e.g. 10:00 AM"
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      />
                    </label>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Guests
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={editDraft.guests}
                        onChange={(e) => updateDraft({ guests: e.target.value })}
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      />
                    </label>
                    {statusModal.nights != null && (
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                          Nights
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={editDraft.nights}
                          onChange={(e) => updateDraft({ nights: e.target.value })}
                          className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                        />
                      </label>
                    )}
                    {statusModal.hours != null && (
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                          Hours
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={editDraft.hours}
                          onChange={(e) => updateDraft({ hours: e.target.value })}
                          className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                        />
                      </label>
                    )}
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">
                        Amount (₱)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editDraft.amount}
                        onChange={(e) => updateDraft({ amount: e.target.value })}
                        className="mt-1.5 w-full border border-[#222222]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                      />
                    </label>
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-[#6B756B]">
                    Changing the cottage, venue, court, date, or duration checks the schedule for
                    conflicts before saving.
                  </p>
                </section>

                <div className="border-t border-[#222222]/10" />

                <section>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Status</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateDraft({ status })}
                        className={`border px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] transition ${
                          editDraft.status === status
                            ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                            : 'border-[#222222]/20 text-[#6B756B] hover:border-[#1E5336]/50 hover:text-[#1E5336]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </section>

                {error && (
                  <p className="border border-rose-500/30 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#222222]/10 pt-4">
                  <button
                    onClick={() => setStatusModal(null)}
                    disabled={updating === statusModal.reference}
                    className="border border-[#222222]/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#222222]/50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBookingEdits}
                    disabled={updating === statusModal.reference || !canSaveEdit}
                    className="flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FDFBF7] hover:bg-[#153d27] disabled:opacity-60"
                  >
                    {updating === statusModal.reference ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    Save changes
                  </button>
                </div>
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
                            Generate a QR Ph code. The guest scans it with GCash, Maya, or any bank app
                            and pays the exact amount. The booking is marked paid automatically.
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
                            Generate QR Ph code
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <img
                            src={paymentQr}
                            alt="QR Ph payment code"
                            className="mx-auto h-56 w-56"
                          />
                          <p className="mt-2 text-[11px] leading-5 text-[#6B756B]">
                            Ask the guest to scan this with GCash, Maya, or any bank app.
                          </p>
                          {paymentDemo && (
                            <p className="mt-1 text-[10px] text-[#8a6412]">
                              Demo mode — PayMongo keys are not configured.
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                            {paymentLink && (
                              <a
                                href={paymentLink}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-[#1E5336] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
                              >
                                Open payment link
                              </a>
                            )}
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setArchived(paymentModal, false)}
                      disabled={updating === paymentModal.reference}
                      title="Restore booking"
                      aria-label={`Restore booking ${paymentModal.reference}`}
                      className="inline-flex h-8 w-8 items-center justify-center border border-[#1E5336]/30 text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7] disabled:opacity-50"
                    >
                      {updating === paymentModal.reference ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: 'delete', bookings: [paymentModal] })}
                      disabled={updating === paymentModal.reference}
                      title="Delete permanently"
                      aria-label={`Delete booking ${paymentModal.reference} permanently`}
                      className="inline-flex h-8 w-8 items-center justify-center border border-rose-500/40 text-rose-700 transition hover:bg-rose-700 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmAction({ type: 'archive', bookings: [paymentModal] })}
                    disabled={updating === paymentModal.reference}
                    title="Archive booking"
                    aria-label={`Archive booking ${paymentModal.reference}`}
                    className="inline-flex h-8 w-8 items-center justify-center border border-[#222222]/20 text-[#6B756B] transition hover:border-[#1E5336] hover:text-[#1E5336] disabled:opacity-50"
                  >
                    {updating === paymentModal.reference ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Archive size={14} />
                    )}
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
