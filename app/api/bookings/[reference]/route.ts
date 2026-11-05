import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { bookingsOverlap, isActiveBooking } from '@/lib/booking-overlap'
import { sendReceiptEmail } from '@/lib/email'

const validStatuses = ['pending', 'confirmed', 'completed', 'expired', 'cancelled']
const validPaymentStatuses = ['unpaid', 'paid']
const validPaidMethods = ['cash', 'gcash', 'maya', 'card', 'bank']

const methodLabels: Record<string, string> = {
  cash: 'Cash at venue',
  gcash: 'GCash',
  maya: 'Maya',
  card: 'Card',
  bank: 'Bank transfer',
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await ctx.params
    const body = await req.json()

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const {
      status,
      paymentStatus,
      paidMethod,
      paymentReference,
      archive,
      name,
      contact,
      email,
      facility,
      itemName,
      date,
      time,
      guests,
      nights,
      hours,
      amount,
    } = body
    const updatesPayment =
      'paymentStatus' in body || 'paidMethod' in body || 'paymentReference' in body
    const updatesArchive = 'archive' in body
    const detailKeys = [
      'name',
      'contact',
      'email',
      'facility',
      'itemName',
      'date',
      'time',
      'guests',
      'nights',
      'hours',
      'amount',
    ] as const
    const updatesDetails = detailKeys.some((key) => key in body)

    // Guests may cancel their own booking, but only staff can edit booking
    // details, record payments, or archive/unarchive bookings.
    if (updatesPayment || updatesArchive || updatesDetails) {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (archive !== undefined && typeof archive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid archive value' }, { status: 400 })
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }
    if (
      paidMethod !== undefined &&
      paidMethod !== null &&
      paidMethod !== '' &&
      !validPaidMethods.includes(paidMethod)
    ) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }
    if (paymentStatus === 'paid' && !validPaidMethods.includes(paidMethod)) {
      return NextResponse.json({ error: 'Choose how the guest paid' }, { status: 400 })
    }

    const isNonEmptyString = (value: unknown): value is string =>
      typeof value === 'string' && value.trim().length > 0
    const isOptionalString = (value: unknown) =>
      value === undefined || value === null || typeof value === 'string'

    if (facility !== undefined && !isNonEmptyString(facility)) {
      return NextResponse.json({ error: 'Invalid facility' }, { status: 400 })
    }
    if (itemName !== undefined && !isNonEmptyString(itemName)) {
      return NextResponse.json({ error: 'Invalid booking description' }, { status: 400 })
    }
    if (date !== undefined && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    if (time !== undefined && !isNonEmptyString(time)) {
      return NextResponse.json({ error: 'Invalid time' }, { status: 400 })
    }
    if (!isOptionalString(name) || !isOptionalString(contact) || !isOptionalString(email)) {
      return NextResponse.json({ error: 'Invalid guest details' }, { status: 400 })
    }
    if (guests !== undefined && (!Number.isInteger(guests) || guests < 1)) {
      return NextResponse.json({ error: 'Invalid guest count' }, { status: 400 })
    }
    if (nights !== undefined && nights !== null && (!Number.isInteger(nights) || nights < 1)) {
      return NextResponse.json({ error: 'Invalid number of nights' }, { status: 400 })
    }
    if (hours !== undefined && hours !== null && (!Number.isInteger(hours) || hours < 1)) {
      return NextResponse.json({ error: 'Invalid number of hours' }, { status: 400 })
    }
    if (amount !== undefined && (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { reference },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const data: {
      status?: string
      paymentStatus?: string
      paidMethod?: string | null
      paymentReference?: string | null
      paidAt?: Date | null
      archivedAt?: Date | null
      name?: string | null
      contact?: string | null
      email?: string | null
      facility?: string
      itemName?: string
      date?: string
      time?: string
      guests?: number
      nights?: number | null
      hours?: number | null
      amount?: number
    } = {}

    if (status !== undefined) data.status = status

    if (archive === true) data.archivedAt = new Date()
    if (archive === false) data.archivedAt = null

    if (name !== undefined) data.name = typeof name === 'string' && name.trim() ? name.trim() : null
    if (contact !== undefined) {
      data.contact = typeof contact === 'string' && contact.trim() ? contact.trim() : null
    }
    if (email !== undefined) {
      data.email = typeof email === 'string' && email.trim() ? email.trim() : null
    }
    if (facility !== undefined) data.facility = facility.trim()
    if (itemName !== undefined) data.itemName = itemName.trim()
    if (date !== undefined) data.date = date
    if (time !== undefined) data.time = time.trim()
    if (guests !== undefined) data.guests = guests
    if (nights !== undefined) data.nights = nights === null ? null : Number(nights)
    if (hours !== undefined) data.hours = hours === null ? null : Number(hours)
    if (amount !== undefined) data.amount = amount

    // Moving a booking to another cottage, court, date, or duration must not
    // collide with an existing active booking on the same facility.
    const nextFacility = data.facility ?? booking.facility
    const nextDate = data.date ?? booking.date
    const nextNights = data.nights !== undefined ? data.nights : booking.nights
    const scheduleChanged =
      nextFacility !== booking.facility ||
      nextDate !== booking.date ||
      nextNights !== booking.nights ||
      (data.time !== undefined && data.time !== booking.time)

    if (scheduleChanged) {
      const candidates = await prisma.booking.findMany({
        where: {
          facility: nextFacility,
          archivedAt: null,
          status: { in: ['pending', 'confirmed'] },
          NOT: { reference },
        },
        select: { reference: true, date: true, nights: true, status: true, createdAt: true },
      })
      const conflict = candidates.find(
        (b) => isActiveBooking(b) && bookingsOverlap({ date: nextDate, nights: nextNights }, b),
      )
      if (conflict) {
        return NextResponse.json(
          {
            error: `That slot is already taken by booking ${conflict.reference}.`,
            conflictReference: conflict.reference,
          },
          { status: 409 },
        )
      }
    }

    if (paymentStatus === 'paid') {
      const method = String(paidMethod)
      const ref = typeof paymentReference === 'string' ? paymentReference.trim() : ''
      data.paymentStatus = 'paid'
      data.paidMethod = method
      data.paymentReference = ref || null
      data.paidAt = booking.paymentStatus === 'paid' ? (booking.paidAt ?? new Date()) : new Date()
      // Collecting payment on a still-pending booking confirms the slot.
      if (!status && booking.status === 'pending') data.status = 'confirmed'
    } else if (paymentStatus === 'unpaid') {
      data.paymentStatus = 'unpaid'
      data.paidMethod = null
      data.paymentReference = null
      data.paidAt = null
    }

    const updated = await prisma.booking.update({
      where: { reference },
      data,
    })

    // Send a fresh receipt when staff record a payment for the first time.
    const justPaid = booking.paymentStatus !== 'paid' && updated.paymentStatus === 'paid'
    if (justPaid && updated.email) {
      try {
        const method = updated.paidMethod || 'cash'
        const label = methodLabels[method] || method
        const ref = updated.paymentReference ? ` (Ref ${updated.paymentReference})` : ''
        const formatPeso = (val: number) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const isPickleball = updated.facility.startsWith('pickleball:')
        const receiptPath = isPickleball ? '/pickleball/booking/receipt' : '/booking/receipt'
        const receiptUrl = `${siteUrl}${receiptPath}?ref=${encodeURIComponent(updated.reference)}`
        const receiptPdfUrl = `${siteUrl}/api/receipt/pdf?ref=${encodeURIComponent(updated.reference)}`

        await sendReceiptEmail(updated.email, {
          reference: updated.reference,
          description: updated.itemName,
          amount: formatPeso(updated.amount),
          name: updated.name || 'Guest',
          date: updated.date,
          time: updated.time,
          guests: String(updated.guests),
          receiptUrl,
          receiptPdfUrl,
          isCash: false,
          paymentLabel: `Paid · ${label}${ref}`,
          paymentNote: `Payment received at the venue via ${label}${ref}. No amount is due.`,
        })
      } catch (err) {
        console.error('Failed to send payment receipt email:', err)
      }
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Booking update error:', err)
    return NextResponse.json({ error: 'Could not update booking' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference } = await ctx.params
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { reference } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (!booking.archivedAt) {
      return NextResponse.json(
        { error: 'Archive this booking before deleting it permanently' },
        { status: 400 },
      )
    }

    await prisma.booking.delete({ where: { reference } })
    return NextResponse.json({ deleted: true, reference })
  } catch (err) {
    console.error('Booking delete error:', err)
    return NextResponse.json({ error: 'Could not delete booking' }, { status: 500 })
  }
}
