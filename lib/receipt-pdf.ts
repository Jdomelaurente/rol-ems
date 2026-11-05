import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'

export type ReceiptBooking = {
  reference: string
  itemName: string
  date: string
  time: string
  nights?: number | null
  hours?: number | null
  guests: number
  name?: string | null
  amount: number
  payment: string
  status: string
  paymentStatus?: string | null
  paidMethod?: string | null
  paymentReference?: string | null
  paidAt?: Date | string | null
}

const GREEN = rgb(30 / 255, 83 / 255, 54 / 255)
const GOLD = rgb(225 / 255, 167 / 255, 40 / 255)
const DARK = rgb(34 / 255, 34 / 255, 34 / 255)
const GRAY = rgb(107 / 255, 117 / 255, 107 / 255)
const CREAM = rgb(253 / 255, 251 / 255, 247 / 255)
const LINE = rgb(229 / 255, 224 / 255, 214 / 255)

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

// WinAnsi (the encoding used by the standard PDF fonts) has no peso glyph.
const safe = (value: string): string =>
  String(value ?? '')
    .replace(/₱/g, 'PHP ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\xFF]/g, '?')

const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
  const words = safe(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word
      continue
    }
    let chunk = ''
    for (const char of word) {
      const next = chunk + char
      if (font.widthOfTextAtSize(next, size) > maxWidth && chunk) {
        lines.push(chunk)
        chunk = char
      } else {
        chunk = next
      }
    }
    current = chunk
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

export async function buildReceiptPdf(booking: ReceiptBooking): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  doc.setTitle(`ROL-EMS Receipt ${booking.reference}`)
  doc.setAuthor('ROL-EMS Resort')
  doc.setSubject('Booking receipt')

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: CREAM })

  const headerHeight = 112
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - headerHeight, width: PAGE_WIDTH, height: headerHeight, color: GREEN })

  const title = 'ROL-EMS  x  REBAR'
  const titleSize = 22
  page.drawText(title, {
    x: (PAGE_WIDTH - bold.widthOfTextAtSize(title, titleSize)) / 2,
    y: PAGE_HEIGHT - 50,
    size: titleSize,
    font: bold,
    color: rgb(1, 1, 1),
  })
  const subtitle = 'BOOKING RECEIPT'
  const subtitleSize = 9
  page.drawText(subtitle, {
    x: (PAGE_WIDTH - font.widthOfTextAtSize(subtitle, subtitleSize)) / 2,
    y: PAGE_HEIGHT - 70,
    size: subtitleSize,
    font,
    color: GOLD,
  })

  let y = PAGE_HEIGHT - headerHeight - 46

  page.drawText('Reservation confirmed', { x: MARGIN, y, size: 16, font: bold, color: DARK })
  y -= 20
  const thankYou = `Thank you, ${booking.name || 'Guest'}!`
  page.drawText(safe(thankYou), { x: MARGIN, y, size: 11, font, color: GRAY })
  y -= 28

  const methodLabels: Record<string, string> = {
    cash: 'Cash at venue',
    gcash: 'GCash',
    maya: 'Maya',
    card: 'Card',
    bank: 'Bank transfer',
  }
  const isCash = booking.payment === 'cash'
  const isPaid = booking.paymentStatus === 'paid'
  const methodLabel = methodLabels[booking.paidMethod || ''] || booking.paidMethod || 'At venue'
  const paymentLabel = isPaid
    ? `Paid - ${methodLabel}${booking.paymentReference ? ` (Ref ${booking.paymentReference})` : ''}`
    : isCash
    ? 'Pay at the venue'
    : 'Online (GCash)'
  const statusLabel = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : '-'
  const amount = `PHP ${Number(booking.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const rows: [string, string][] = [
    ['Reference', booking.reference],
    ['Booking', booking.itemName],
    ['Date & Time', `${booking.date} · ${booking.time}`],
    ...(booking.nights ? ([['Nights', String(booking.nights)]] as [string, string][]) : []),
    ...(booking.hours ? ([['Hours', String(booking.hours)]] as [string, string][]) : []),
    ['Guests', String(booking.guests)],
    ['Guest name', booking.name || '-'],
    ['Payment', paymentLabel],
    ['Status', statusLabel],
  ]

  const labelWidth = 118
  const valueWidth = CONTENT_WIDTH - labelWidth
  const labelSize = 9
  const valueSize = 10

  for (const [label, value] of rows) {
    const lines = wrapText(value, font, valueSize, valueWidth)
    const rowHeight = Math.max(20, lines.length * 13 + 8)

    page.drawText(label, { x: MARGIN, y: y + rowHeight - 14, size: labelSize, font, color: GRAY })
    let lineY = y + rowHeight - 14
    for (const line of lines) {
      page.drawText(line, {
        x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(line, valueSize),
        y: lineY,
        size: valueSize,
        font,
        color: DARK,
      })
      lineY -= 13
    }

    y -= rowHeight
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.75,
      color: LINE,
    })
  }

  y -= 18
  const totalLabel = isPaid ? 'Total paid' : isCash ? 'Amount due at venue' : 'Total due'
  page.drawLine({
    start: { x: MARGIN, y: y + 10 },
    end: { x: PAGE_WIDTH - MARGIN, y: y + 10 },
    thickness: 1.5,
    color: GREEN,
  })
  page.drawText(totalLabel, { x: MARGIN, y, size: 12, font: bold, color: DARK })
  page.drawText(safe(amount), {
    x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(safe(amount), 12),
    y,
    size: 12,
    font: bold,
    color: GREEN,
  })

  y -= 34
  const note = isPaid
    ? `Payment received at the venue via ${methodLabel}${booking.paymentReference ? ` (Ref ${booking.paymentReference})` : ''}. No amount is due.`
    : isCash
    ? 'Pay at the venue: please settle this booking at the front desk when you arrive. We accept cash, GCash, and Maya - no online payment is required.'
    : 'Online payment: your payment was processed online via GCash. No payment is due at the venue.'
  const noteLines = wrapText(note, font, 9, CONTENT_WIDTH - 28)
  const boxHeight = noteLines.length * 12 + 40

  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: CONTENT_WIDTH,
    height: boxHeight,
    color: rgb(243 / 255, 240 / 255, 236 / 255),
    borderColor: LINE,
    borderWidth: 0.75,
  })
  page.drawText('PAYMENT METHOD', { x: MARGIN + 14, y: y - 18, size: 7.5, font: bold, color: GREEN })
  let noteY = y - 32
  for (const line of noteLines) {
    page.drawText(line, { x: MARGIN + 14, y: noteY, size: 9, font, color: GRAY })
    noteY -= 12
  }

  const footer = 'ROL-EMS  ·  REBAR Resort & Sports Complex'
  page.drawText(safe(footer), {
    x: (PAGE_WIDTH - font.widthOfTextAtSize(safe(footer), 8)) / 2,
    y: 34,
    size: 8,
    font,
    color: GRAY,
  })

  return doc.save()
}
