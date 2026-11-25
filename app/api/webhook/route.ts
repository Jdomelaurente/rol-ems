import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { fulfillBookingPayment } from '@/lib/payment-fulfillment'
import { normalizePaidMethod, retrievePaymentIntent } from '@/lib/paymongo'

export const runtime = 'nodejs'

function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b) return false
  try {
    const left = Buffer.from(a, 'hex')
    const right = Buffer.from(b, 'hex')
    return left.length === right.length && timingSafeEqual(left, right)
  } catch {
    return false
  }
}

/**
 * PayMongo signs webhook deliveries in one of two shapes:
 *   - t=<timestamp>,te=<test sig>,li=<live sig>  (HMAC of `${t}.${rawBody}`)
 *   - a bare hex HMAC of the raw body
 * Accept either so test and live deliveries both verify.
 */
function verifySignature(raw: string, header: string, secret: string): boolean {
  const value = header.trim()
  if (!value) return false

  const parts: Record<string, string> = {}
  for (const part of value.split(',')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    parts[part.slice(0, index).trim()] = part.slice(index + 1).trim()
  }

  if (parts.t) {
    const expected = createHmac('sha256', secret).update(`${parts.t}.${raw}`).digest('hex')
    for (const key of ['te', 'li', 'sig']) {
      if (parts[key] && safeEqualHex(expected, parts[key])) return true
    }
  }

  const plain = createHmac('sha256', secret).update(raw).digest('hex')
  return safeEqualHex(plain, value)
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET

  if (secret) {
    const signature = req.headers.get('paymongo-signature') || ''
    if (!verifySignature(raw, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const eventData = event?.data?.attributes || {}
  const eventType: string | undefined = eventData?.type || event?.data?.type
  console.log('Webhook received, type:', eventType)

  // New flow: GCash Payment Intent / QR Ph payments emit payment.paid.
  if (eventType === 'payment.paid') {
    const payment = eventData?.data || event?.data?.data
    const paymentAttrs = payment?.attributes || {}
    const intentId: string | undefined =
      paymentAttrs?.payment_intent_id || paymentAttrs?.payment_intent

    let intentAttrs: Record<string, any> = {}
    if (intentId) {
      try {
        const intent = await retrievePaymentIntent(intentId)
        intentAttrs = intent?.attributes || {}
      } catch (err) {
        console.error('Webhook: could not retrieve payment intent', intentId, err)
      }
    }

    const metadata = intentAttrs?.metadata || paymentAttrs?.metadata || {}
    const reference: string | undefined = metadata?.reference
    if (!reference) {
      console.warn('Webhook: payment.paid without a booking reference. Intent:', intentId)
      return NextResponse.json({ received: true })
    }

    const billing = paymentAttrs?.billing || {}
    const { confirmed } = await fulfillBookingPayment({
      reference,
      amountCents: paymentAttrs?.amount || intentAttrs?.amount,
      paidMethod: paymentAttrs?.payment_method || paymentAttrs?.source?.type || 'gcash',
      paymentReference: payment?.id,
      billingName: billing?.name,
      billingEmail: billing?.email || metadata?.email,
      description: metadata?.description || intentAttrs?.description,
      date: metadata?.date,
      time: metadata?.time,
      guests: metadata?.guests,
    })

    console.log('Webhook: payment.paid', { reference, confirmed })
    return NextResponse.json({ received: true })
  }

  // Legacy flow: any Checkout Sessions created before the switch (e.g. an
  // older admin payment link) still confirm through this event.
  if (eventType === 'checkout_session.payment.paid') {
    const session = eventData?.data || event?.data?.data
    const attrs = session?.attributes || {}
    const sessionId = session?.id

    const payments = Array.isArray(attrs?.payments) ? attrs.payments : []
    const firstPaid =
      payments.find((p: any) => p?.attributes?.status === 'paid') || payments[0]

    const billing = firstPaid?.attributes?.billing || attrs?.billing || {}
    const metadata = attrs?.metadata || {}
    const lineItems = attrs?.line_items || []
    const description =
      metadata?.description ||
      (Array.isArray(lineItems) && lineItems[0]?.description) ||
      (Array.isArray(lineItems) && lineItems[0]?.name) ||
      'ROL-EMS booking'

    const reference: string = metadata?.reference || sessionId || event?.data?.id || ''

    if (!reference) {
      console.warn('Webhook: checkout session paid without a reference:', sessionId)
      return NextResponse.json({ received: true })
    }

    const { confirmed } = await fulfillBookingPayment({
      reference,
      amountCents: firstPaid?.attributes?.amount || attrs?.amount,
      paidMethod: firstPaid?.attributes?.payment_method || 'gcash',
      paymentReference: firstPaid?.id,
      billingName: billing?.name || 'Guest',
      billingEmail: billing?.email || metadata?.email,
      description,
      date: metadata?.date,
      time: metadata?.time,
      guests: metadata?.guests,
    })

    console.log('Webhook: checkout session paid', { reference, confirmed })
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
