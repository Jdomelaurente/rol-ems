import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildReceiptPdf } from '@/lib/receipt-pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('ref')
  if (!reference) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 })
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { reference } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const pdf = await buildReceiptPdf(booking)
    const filename = `ROL-EMS-${booking.reference}.pdf`
    const pdfBuffer = Buffer.from(pdf)

    // Mobile webviews and in-app browsers often fail on 'attachment' dispositions.
    // Defaulting to 'inline' allows mobile browsers (iOS Safari, Android Chrome)
    // to render the PDF directly in the viewer with native save/share buttons.
    // Clients can pass ?download=1 to force an attachment download prompt.
    const isDownload = req.nextUrl.searchParams.get('download') === '1'
    const disposition = isDownload ? 'attachment' : 'inline'

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('Receipt PDF error:', err)
    return NextResponse.json({ error: 'Could not generate receipt' }, { status: 500 })
  }
}
