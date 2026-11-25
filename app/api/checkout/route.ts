import { NextRequest, NextResponse } from 'next/server'
import {
  attachPaymentMethod,
  createPaymentIntent,
  createPaymentMethod,
  paymongoConfigured,
} from '@/lib/paymongo'

export const runtime = 'nodejs'

/**
 * Start a GCash payment.
 *
 * This uses PayMongo's Payment Intent + e-wallet flow rather than Hosted
 * Checkout. The guest is redirected straight to the GCash app (on mobile) or
 * to a scannable QR (on desktop) and confirms the payment inside GCash.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, contact, email, amount, description, metadata, successUrl } = body

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // GCash allows PHP 1.00 – PHP 100,000.00 per transaction.
  if (amount > 100000) {
    return NextResponse.json(
      { error: 'Online GCash payments are limited to ₱100,000 per transaction.' },
      { status: 400 },
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const reference = metadata?.reference || `RC-${Math.floor(100000 + Math.random() * 900000)}`
  const successPath =
    typeof successUrl === 'string' && successUrl.startsWith('/') ? successUrl : '/payment/success'
  const returnUrl = `${siteUrl}${successPath}`

  // Local/demo mode: skip PayMongo and land on the simulated success page.
  if (!paymongoConfigured()) {
    console.warn('PAYMONGO_SECRET_KEY is missing or placeholder. Redirecting to simulated payment success page.')
    return NextResponse.json({
      checkout_url: `${siteUrl}${successPath}?ref=${encodeURIComponent(reference)}&demo=true`,
      id: `pi_simulated_${Date.now()}`,
    })
  }

  try {
    const intent = await createPaymentIntent({
      amount: Math.round(amount * 100),
      method: 'gcash',
      description: description || 'ROL-EMS booking',
      statementDescriptor: 'ROL-EMS',
      metadata: {
        ...(metadata || {}),
        reference,
        description: description || 'ROL-EMS booking',
        email,
      },
    })

    const method = await createPaymentMethod({
      type: 'gcash',
      billing: { name, email, phone: contact },
    })

    // Send the intent id back with the redirect so the success page can verify
    // the payment even if localStorage was cleared while the GCash app was open.
    const returnUrlWithIntent = new URL(returnUrl)
    returnUrlWithIntent.searchParams.set('payment_intent_id', intent.id)
    returnUrlWithIntent.searchParams.set('ref', reference)

    const attached = await attachPaymentMethod({
      intentId: intent.id,
      paymentMethodId: method.id,
      returnUrl: returnUrlWithIntent.toString(),
    })

    const redirectUrl = attached.attributes?.next_action?.redirect?.url
    if (!redirectUrl) {
      return NextResponse.json({ error: 'Payment session was not created' }, { status: 500 })
    }

    return NextResponse.json({ checkout_url: redirectUrl, id: intent.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment service unavailable'
    const status = (err as Error & { status?: number }).status || 502
    console.error('Checkout route error:', err)

    // In development, fall back to the simulated flow so the UI stays testable.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        checkout_url: `${siteUrl}${successPath}?ref=${encodeURIComponent(reference)}&demo=true`,
        id: `pi_simulated_${Date.now()}`,
      })
    }

    return NextResponse.json({ error: message }, { status })
  }
}
