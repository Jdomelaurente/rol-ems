import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QR_OPTIONS = {
  width: 360,
  margin: 1,
  color: { dark: '#1E5336', light: '#FFFFFF' },
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

  const secret = process.env.PAYMONGO_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const successPath = '/payment/success'
  const cancelPath = '/admin/bookings'
  const description = `ROL-EMS · ${booking.itemName} · ${booking.date} at ${booking.time}`

  // Local/demo mode: still return a scannable QR so the flow can be tested.
  if (!secret || secret.includes('your_paymongo_secret_key')) {
    const demoUrl = `${siteUrl}${successPath}?ref=${encodeURIComponent(booking.reference)}&demo=true`
    const qrDataUrl = await QRCode.toDataURL(demoUrl, QR_OPTIONS)
    return NextResponse.json({ checkoutUrl: demoUrl, qrDataUrl, demo: true })
  }

  const payload = {
    data: {
      attributes: {
        billing: {
          name: booking.name || 'Guest',
          email: booking.email || undefined,
          phone: booking.contact || undefined,
        },
        line_items: [
          {
            currency: 'PHP',
            amount: Math.round(booking.amount * 100),
            description,
            name: description,
            quantity: 1,
          },
        ],
        payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay', 'qrph'],
        success_url: `${siteUrl}${successPath}`,
        cancel_url: `${siteUrl}${cancelPath}`,
        metadata: {
          reference: booking.reference,
          booking: booking.itemName,
          date: booking.date,
          time: booking.time,
          guests: String(booking.guests),
          description,
          ...(booking.email ? { email: booking.email } : {}),
        },
      },
    },
  }

  try {
    const res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Admin payment link PayMongo error:', JSON.stringify(data))
      return NextResponse.json(
        { error: data?.errors?.[0]?.detail || 'Could not create the payment link' },
        { status: res.status },
      )
    }

    const checkoutUrl = data?.data?.attributes?.checkout_url
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Payment session was not created' }, { status: 500 })
    }

    const qrDataUrl = await QRCode.toDataURL(checkoutUrl, QR_OPTIONS)
    return NextResponse.json({
      checkoutUrl,
      qrDataUrl,
      demo: false,
      id: data?.data?.id,
    })
  } catch (err) {
    console.error('Admin payment link error:', err)
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 500 })
  }
}
