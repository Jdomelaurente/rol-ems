import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
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

    const { status, paymentStatus, paidMethod, paymentReference, archive } = body
    const updatesPayment =
      'paymentStatus' in body || 'paidMethod' in body || 'paymentReference' in body
    const updatesArchive = 'archive' in body

    // Guests may cancel their own booking, but only staff can record payments
    // or archive/unarchive bookings.
    if (updatesPayment || updatesArchive) {
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
    } = {}

    if (status !== undefined) data.status = status

    if (archive === true) data.archivedAt = new Date()
    if (archive === false) data.archivedAt = null

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
