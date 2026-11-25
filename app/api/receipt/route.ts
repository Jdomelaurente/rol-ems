import { NextRequest, NextResponse } from 'next/server'
import { fulfillBookingPayment } from '@/lib/payment-fulfillment'
import {
  paymongoConfigured,
  retrieveCheckoutSession,
  retrievePaymentIntent,
} from '@/lib/paymongo'

export const runtime = 'nodejs'

/**
 * Verifies a payment and makes sure the booking is confirmed.
 *
 * The success page calls this immediately after the redirect from GCash,
 * because the webhook can arrive a moment later. Whichever lands first marks
 * the booking paid; the other one sees it is already paid and stays quiet.
 */
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams
  const id =
    search.get('payment_intent_id') ||
    search.get('session_id') ||
    search.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }

  if (!paymongoConfigured()) {
    // Simulated/demo checkout — there is nothing to verify against PayMongo.
    return NextResponse.json({
      ok: true,
      paid: true,
      reference: search.get('ref') || undefined,
    })
  }

  try {
    if (id.startsWith('cs_')) {
      const session = await retrieveCheckoutSession(id)
      const attrs = session?.attributes || {}
      const payments = Array.isArray(attrs?.payments) ? attrs.payments : []
      const paidPayment = payments.find((p: any) => p?.attributes?.status === 'paid')
      const metadata = attrs?.metadata || {}
      const reference: string | undefined = metadata?.reference
      const paid = attrs?.payment_status === 'paid' || !!paidPayment

      if (!paid || !reference) {
        return NextResponse.json({ ok: true, paid: false, reference })
      }

      const billing = paidPayment?.attributes?.billing || attrs?.billing || {}
      await fulfillBookingPayment({
        reference,
        amountCents: paidPayment?.attributes?.amount || attrs?.amount,
        paidMethod: paidPayment?.attributes?.payment_method || 'gcash',
        paymentReference: paidPayment?.id,
        billingName: billing?.name,
        billingEmail: billing?.email || metadata?.email,
        description: metadata?.description,
        date: metadata?.date,
        time: metadata?.time,
        guests: metadata?.guests,
      })

      return NextResponse.json({ ok: true, paid: true, reference })
    }

    const intent = await retrievePaymentIntent(id)
    const attrs = intent?.attributes || {}
    const metadata = attrs?.metadata || {}
    const reference: string | undefined = metadata?.reference
    const paid = attrs?.status === 'succeeded'

    if (!paid || !reference) {
      return NextResponse.json({ ok: true, paid: false, reference })
    }

    const payments = Array.isArray(attrs?.payments) ? attrs.payments : []
    const paidPayment = payments.find((p: any) => p?.attributes?.status === 'paid') || payments[0]
    const billing = paidPayment?.attributes?.billing || {}

    await fulfillBookingPayment({
      reference,
      amountCents: attrs?.amount,
      paidMethod: paidPayment?.attributes?.payment_method || 'gcash',
      paymentReference: paidPayment?.id,
      billingName: billing?.name,
      billingEmail: billing?.email || metadata?.email,
      description: attrs?.description || metadata?.description,
      date: metadata?.date,
      time: metadata?.time,
      guests: metadata?.guests,
    })

    return NextResponse.json({ ok: true, paid: true, reference })
  } catch (err) {
    console.error('Receipt route error:', err)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 })
  }
}
