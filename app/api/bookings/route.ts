import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingsOverlap, isActiveBooking } from '@/lib/booking-overlap'
import { sendReceiptEmail } from '@/lib/email'

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
    const reference = req.nextUrl.searchParams.get('reference')
    const archived = req.nextUrl.searchParams.get('archived')

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
