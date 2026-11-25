import { prisma } from '@/lib/prisma'
import { sendReceiptEmail } from '@/lib/email'
import { normalizePaidMethod } from '@/lib/paymongo'

export type PaymentDetails = {
  reference: string
  /** Amount in centavos, as returned by PayMongo. */
  amountCents?: number
  paidMethod?: string
  /** PayMongo payment id, stored so refunds/support can locate the transaction. */
  paymentReference?: string
  billingName?: string
  billingEmail?: string
  description?: string
  date?: string
  time?: string
  guests?: string
}

const centsToPeso = (cents: number) =>
  `₱${(cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

const methodLabel = (method?: string) => {
  switch (normalizePaidMethod(method)) {
    case 'gcash':
      return 'GCash'
    case 'maya':
      return 'Maya'
    case 'card':
      return 'Card'
    case 'bank':
      return 'Bank transfer'
    case 'cash':
      return 'Cash'
    default:
      return 'GCash'
  }
}

/**
 * Mark a booking paid and email the receipt.
 *
 * Only the request that actually flips the booking from unpaid to paid sends
 * the receipt, so the redirect handler and the webhook cannot both email the
 * guest for the same payment. If the webhook wins the race, the success page
 * simply sees the booking already paid and skips the email.
 */
export async function fulfillBookingPayment(details: PaymentDetails) {
  const reference = details.reference?.trim()
  if (!reference) return { confirmed: false, emailed: false, reference: undefined }

  const booking = await prisma.booking.findUnique({ where: { reference } })
  if (!booking) {
    console.warn('Payment received for unknown booking reference:', reference)
    return { confirmed: false, emailed: false, reference }
  }

  const result = await prisma.booking.updateMany({
    where: { reference, paymentStatus: { not: 'paid' } },
    data: {
      status: 'confirmed',
      paymentStatus: 'paid',
      paidMethod: normalizePaidMethod(details.paidMethod),
      ...(details.paymentReference ? { paymentReference: details.paymentReference } : {}),
      paidAt: new Date(),
    },
  })

  if (result.count === 0) {
    return { confirmed: false, emailed: false, reference }
  }

  const updated = await prisma.booking.findUnique({ where: { reference } })
  const email = details.billingEmail || updated?.email || booking.email || undefined
  if (!email) {
    return { confirmed: true, emailed: false, reference }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const facility = updated?.facility || booking.facility
  const isPickleball = facility.startsWith('pickleball:')
  const receiptPath = isPickleball ? '/pickleball/booking/receipt' : '/booking/receipt'
  const receiptUrl = `${siteUrl}${receiptPath}?ref=${encodeURIComponent(reference)}`
  const receiptPdfUrl = `${siteUrl}/api/receipt/pdf?ref=${encodeURIComponent(reference)}`

  const amount = details.amountCents
    ? centsToPeso(details.amountCents)
    : `₱${Number(updated?.amount ?? booking.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  try {
    await sendReceiptEmail(email, {
      reference,
      description: details.description || updated?.itemName || booking.itemName,
      amount,
      name: details.billingName || updated?.name || booking.name || 'Guest',
      date: details.date || updated?.date || booking.date,
      time: details.time || updated?.time || booking.time,
      guests: details.guests || String(updated?.guests ?? booking.guests),
      receiptUrl,
      receiptPdfUrl,
      paymentLabel: `Paid · ${methodLabel(details.paidMethod)}`,
    })
  } catch (err) {
    // The payment is still recorded even if SMTP is temporarily unavailable.
    console.error('Failed to send receipt email for', reference, err)
    return { confirmed: true, emailed: false, reference }
  }

  return { confirmed: true, emailed: true, reference }
}
