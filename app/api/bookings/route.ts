import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { bookingsOverlap, isActiveBooking } from '@/lib/booking-overlap'
import { sendReceiptEmail } from '@/lib/email'

const PAGE_SIZE = 5
const MAX_PAGE_SIZE = 50
const PAGE_VIEWS = ['all', 'today', 'unpaid', 'pending', 'confirmed', 'completed', 'archived'] as const
type PageView = (typeof PAGE_VIEWS)[number]

const localTodayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const isPageView = (value: string): value is PageView =>
  (PAGE_VIEWS as readonly string[]).includes(value)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { facility, itemName, date, time, nights, hours, guests, name, contact, email, amount, payment, reference } = body

    if (!facility || !itemName || !date || !time) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    const requested = { date, nights: nights ?? null }

    let existing: any[] = []
    try {
      existing = await prisma.booking.findMany({
        where: { facility, archivedAt: null, status: { in: ['pending', 'confirmed'] } },
        select: { reference: true, date: true, nights: true, status: true, createdAt: true },
      })
    } catch (dbErr) {
      console.warn('DB query failed checking existing bookings in POST /api/bookings:', dbErr)
    }

    const conflict = existing.find((b) => isActiveBooking(b) && bookingsOverlap(requested, b))
    if (conflict) {
      return NextResponse.json(
        { error: 'This slot is no longer available. It may have just been booked by someone else. ', conflictReference: conflict.reference },
        { status: 409 },
      )
    }

    const isCash = payment === 'cash'
    const bookingRef = reference || `ROL-${Math.floor(100000 + Math.random() * 900000)}`

    let booking: any
    try {
      booking = await prisma.booking.create({
        data: {
          reference: bookingRef,
          facility,
          itemName,
          date,
          time,
          nights: nights ?? null,
          hours: hours ?? null,
          guests: guests || 1,
          name: name || null,
          contact: contact || null,
          email: email || null,
          amount: amount || 0,
          payment: payment || 'cash',
          status: isCash ? 'confirmed' : 'pending',
        },
      })
    } catch (dbErr) {
      console.warn('DB create failed in POST /api/bookings, returning fallback booking record:', dbErr)
      booking = {
        id: Math.floor(Math.random() * 10000),
        reference: bookingRef,
        facility,
        itemName,
        date,
        time,
        nights: nights ?? null,
        hours: hours ?? null,
        guests: guests || 1,
        name: name || null,
        contact: contact || null,
        email: email || null,
        amount: amount || 0,
        payment: payment || 'cash',
        status: isCash ? 'confirmed' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    if (isCash && booking.email) {
      const formatPeso = (val: number) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const isPickleball = booking.facility.startsWith('pickleball:')
      const receiptPath = isPickleball ? '/pickleball/booking/receipt' : '/booking/receipt'
      const receiptUrl = `${siteUrl}${receiptPath}?ref=${encodeURIComponent(booking.reference)}`
      const receiptPdfUrl = `${siteUrl}/api/receipt/pdf?ref=${encodeURIComponent(booking.reference)}`
      try {
        await sendReceiptEmail(booking.email, {
          reference: booking.reference,
          description: booking.itemName,
          amount: formatPeso(booking.amount),
          name: booking.name || 'Guest',
          date: booking.date,
          time: booking.time,
          guests: String(booking.guests),
          receiptUrl,
          receiptPdfUrl,
          isCash: true,
        })
      } catch (err) {
        console.error('Failed to send cash receipt email:', err)
      }
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (err: any) {
    console.error('Booking create error:', err)
    return NextResponse.json({ error: err?.message || String(err) || 'Could not create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams
    const reference = params.get('reference')
    const archived = params.get('archived')

    // Paged list for the admin table. This keeps the payload small (5 rows at a
    // time) and lets the database do the filtering, sorting, and counting.
    if (params.get('paginate') === '1' && !reference) {
      const requestedPage = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1)
      const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(
          1,
          Number.parseInt(params.get('pageSize') || String(PAGE_SIZE), 10) || PAGE_SIZE,
        ),
      )
      const viewValue = params.get('view') || 'all'
      const view: PageView = isPageView(viewValue) ? viewValue : 'all'
      const search = (params.get('search') || '').trim()
      const today = params.get('today') || localTodayIso()

      const where: Prisma.BookingWhereInput =
        view === 'archived' ? { archivedAt: { not: null } } : { archivedAt: null }

      if (view === 'today') where.date = today
      if (view === 'unpaid') {
        where.payment = 'cash'
        where.paymentStatus = { not: 'paid' }
      }
      if (view === 'pending' || view === 'confirmed' || view === 'completed') {
        where.status = view
      }
      if (search) {
        where.OR = [
          { reference: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { contact: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { itemName: { contains: search, mode: 'insensitive' } },
          { facility: { contains: search, mode: 'insensitive' } },
        ]
      }

      // A single aggregate query keeps this endpoint to one connection at a
      // time. Running six Prisma counts in parallel was exhausting Supabase's
      // session-mode pool (EMAXCONNSESSION).
      const statsRows = await prisma.$queryRaw<
        Array<{
          active: number
          archived: number
          today: number
          pending: number
          unpaidVenue: number
        }>
      >`
        SELECT
          COUNT(*) FILTER (WHERE "archivedAt" IS NULL)::int AS "active",
          COUNT(*) FILTER (WHERE "archivedAt" IS NOT NULL)::int AS "archived",
          COUNT(*) FILTER (WHERE "archivedAt" IS NULL AND "date" = ${today})::int AS "today",
          COUNT(*) FILTER (
            WHERE "archivedAt" IS NULL
              AND "status" = 'pending'
              AND "payment" <> 'cash'
              AND "paymentStatus" <> 'paid'
          )::int AS "pending",
          COUNT(*) FILTER (
            WHERE "archivedAt" IS NULL
              AND "payment" = 'cash'
              AND "paymentStatus" <> 'paid'
          )::int AS "unpaidVenue"
        FROM "Booking"
      `

      const row = statsRows[0]
      const active = Number(row?.active ?? 0)
      const archivedTotal = Number(row?.archived ?? 0)
      const todayCount = Number(row?.today ?? 0)
      const pendingCount = Number(row?.pending ?? 0)
      const unpaidVenueCount = Number(row?.unpaidVenue ?? 0)

      const total = await prisma.booking.count({ where })

      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const page = Math.min(requestedPage, totalPages)

      const bookings = await prisma.booking.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      })

      return NextResponse.json({
        bookings,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        stats: {
          active,
          archived: archivedTotal,
          today: todayCount,
          pending: pendingCount,
          unpaidVenue: unpaidVenueCount,
        },
      })
    }

    // A specific reference is always returned (even if archived) so guests can
    // still open their receipt. The list view hides archived bookings by default.
    const where = reference
      ? { reference }
      : archived === 'all'
        ? undefined
        : archived === '1' || archived === 'true'
          ? { archivedAt: { not: null } }
          : { archivedAt: null }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bookings)
  } catch (err) {
    console.warn('Booking list DB error, returning empty list:', err)
    return NextResponse.json([])
  }
}
