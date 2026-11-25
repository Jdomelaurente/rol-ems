import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { fulfillBookingPayment } from '@/lib/payment-fulfillment'
import {
  attachPaymentMethod,
  createPaymentIntent,
  createPaymentMethod,
  paymongoConfigured,
  retrievePaymentIntent,
} from '@/lib/paymongo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QR_OPTIONS = {
  width: 360,
  margin: 1,
  color: { dark: '#1E5336', light: '#FFFFFF' },
}

/** PayMongo returns the QR image as raw base64; make it usable in an <img>. */
function toImageSrc(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  if (value.startsWith('data:') || value.startsWith('http')) return value
  return `data:image/png;base64,${value}`
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
) {
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
  if (booking.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'This booking is already paid' }, { status: 400 })
  }
  if (!booking.amount || booking.amount <= 0) {
    return NextResponse.json(
      { error: 'This booking has no amount to collect. Record the payment manually instead.' },
      { status: 400 },
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const description = `ROL-EMS · ${booking.itemName} · ${booking.date} at ${booking.time}`

  // Local/demo mode: still return a scannable QR so the flow can be tested.
  if (!paymongoConfigured()) {
    const demoUrl = `${siteUrl}/payment/success?ref=${encodeURIComponent(booking.reference)}&demo=true`
    const qrDataUrl = await QRCode.toDataURL(demoUrl, QR_OPTIONS)
    return NextResponse.json({ qrDataUrl, checkoutUrl: demoUrl, demo: true })
  }

  try {
    const intent = await createPaymentIntent({
      amount: Math.round(booking.amount * 100),
      method: 'qrph',
      description,
      statementDescriptor: 'ROL-EMS',
      metadata: {
        reference: booking.reference,
        booking: booking.itemName,
        facility: booking.facility,
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
        description,
        ...(booking.email ? { email: booking.email } : {}),
      },
    })

    // QR Ph codes expire after 15 minutes, which is plenty for a guest at the
    // counter and avoids leaving stale codes on the admin's screen.
    const method = await createPaymentMethod({ type: 'qrph', expirySeconds: 900 })
    const attached = await attachPaymentMethod({
      intentId: intent.id,
      paymentMethodId: method.id,
    })

    const qrDataUrl = toImageSrc(attached.attributes?.next_action?.code?.image_url)
    if (!qrDataUrl) {
      console.error('QR Ph attach did not return an image:', JSON.stringify(attached))
      return NextResponse.json({ error: 'Could not create the QR Ph code' }, { status: 502 })
    }

    return NextResponse.json({
      qrDataUrl,
      checkoutUrl: '',
      demo: false,
      id: intent.id,
      paymentIntentId: intent.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment service unavailable'
    console.error('Admin QR Ph error:', err)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * Status check for the QR that is currently on the admin's screen.
 *
 * The webhook normally confirms the payment, but this gives the counter a fast
 * fallback: it asks PayMongo directly and marks the booking paid if the QR was
 * already settled. Safe to call repeatedly — fulfilment is idempotent.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reference } = await ctx.params
  const intentId = req.nextUrl.searchParams.get('intent')
  if (!reference || !intentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }
  if (!paymongoConfigured()) {
    return NextResponse.json({ paid: false, demo: true })
  }

  try {
    const intent = await retrievePaymentIntent(intentId)
    const attrs = intent?.attributes || {}
    const metadata = attrs?.metadata || {}

    // Ignore a stale intent that belongs to a different booking.
    if (metadata?.reference && metadata.reference !== reference) {
      return NextResponse.json({ paid: false })
    }

    if (attrs?.status !== 'succeeded') {
      return NextResponse.json({ paid: false })
    }

    const payments = Array.isArray(attrs?.payments) ? attrs.payments : []
    const paidPayment = payments.find((p: any) => p?.attributes?.status === 'paid') || payments[0]
    const billing = paidPayment?.attributes?.billing || {}

    await fulfillBookingPayment({
      reference,
      amountCents: attrs?.amount,
      paidMethod: paidPayment?.attributes?.payment_method || 'qrph',
      paymentReference: paidPayment?.id,
      billingName: billing?.name,
      billingEmail: billing?.email || metadata?.email,
      description: attrs?.description || metadata?.description,
      date: metadata?.date,
      time: metadata?.time,
      guests: metadata?.guests,
    })

    return NextResponse.json({ paid: true })
  } catch (err) {
    console.error('Admin QR Ph status check error:', err)
    return NextResponse.json({ paid: false }, { status: 502 })
  }
}
