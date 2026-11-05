import nodemailer, { type Transporter } from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { buildReceiptPdf } from '@/lib/receipt-pdf'

type TemplateData = {
  reference: string
  description: string
  amount: string
  name: string
  date?: string
  time?: string
  guests?: string
  /** If set, shows a 'Download Receipt' button in the email */
  receiptUrl?: string
  /** Direct PDF download (works on mobile); used for the primary button when set */
  receiptPdfUrl?: string
  /** If true, wording is for cash / pay-at-venue bookings */
  isCash?: boolean
  /** Overrides the payment row, e.g. "Paid · GCash (Ref 1234)" */
  paymentLabel?: string
  /** Overrides the payment note shown in the box below the total */
  paymentNote?: string
  /** Optional PDF binary data to attach directly to the email */
  pdfAttachment?: Uint8Array | Buffer
}

let cached: Transporter | null = null

function transporter(): Transporter {
  if (cached) return cached
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return cached
}

function html({ reference, description, amount, name, date, time, guests, receiptUrl, receiptPdfUrl, isCash, paymentLabel, paymentNote }: TemplateData): string {
  const rows = [
    ['Reference', reference],
    ['Booking', description],
    ...(date ? [['Date', `${date}${time ? ` · ${time}` : ''}`]] : []),
    ...(guests ? [['Guests', guests]] : []),
    ['Payment', paymentLabel || (isCash ? 'Pay at the venue' : 'Online (GCash)')],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#6B756B;font-size:13px;border-bottom:1px solid #eee;width:40%">${k}</td><td style="padding:8px 0;color:#1E5336;font-weight:600;text-align:right;border-bottom:1px solid #eee">${v}</td></tr>`,
    )
    .join('')

  const headline = isCash ? 'Reservation confirmed!' : 'Payment received!'
  const subline = isCash
    ? 'Your booking is confirmed. Please bring payment when you arrive. Details below.'
    : 'Your payment has been received. Details below.'
  const totalLabel = isCash ? 'Amount due at venue' : 'Total paid'

  const paymentNoteText = paymentNote || (isCash
    ? 'Pay at the venue: please settle this booking at the front desk when you arrive. We accept cash, GCash, and Maya — no online payment is required.'
    : 'Online payment: your payment was processed online via GCash. No payment is due at the venue.')

  const noteBox = `
    <div style="margin-top:20px;border:1px solid #e5e0d6;background:#F3F0EC;padding:14px 16px">
      <div style="color:#1E5336;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px">Payment method</div>
      <p style="margin:0;color:#6B756B;font-size:12px;line-height:1.5">${paymentNoteText}</p>
    </div>`

  const downloadHref = receiptPdfUrl || receiptUrl
  const downloadLabel = receiptPdfUrl ? 'Download / View receipt (PDF)' : 'View receipt'
  const viewReceiptLink =
    receiptPdfUrl && receiptUrl
      ? `<div style="margin-top:10px"><a href="${receiptUrl}" style="color:#6B756B;font-size:11px;text-decoration:underline;font-family:Arial,sans-serif">View receipt online in browser</a></div>`
      : ''
  const mobileTip = `
    <div style="margin-top:14px;padding:10px 12px;background:#F9F8F6;border:1px dashed #d6d0c4;text-align:center">
      <span style="color:#1E5336;font-size:11px;font-weight:700">📱 Mobile Tip:</span>
      <span style="color:#6B756B;font-size:11px"> An official PDF receipt is also attached to this email so you can open, save, or share it on your phone without opening a browser.</span>
    </div>`

  const downloadBtn = downloadHref
    ? `<div style="margin-top:20px;text-align:center">
        <a href="${downloadHref}" style="display:inline-block;background:#1E5336;color:#FDFBF7;padding:12px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">${downloadLabel}</a>
        ${viewReceiptLink}
        ${mobileTip}
      </div>`
    : ''

  return `
  <div style="background:#F3F0EC;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#FDFBF7;border:1px solid #e5e0d6;overflow:hidden">
      <div style="background:#1E5336;padding:24px;text-align:center">
        <div style="color:#FDFBF7;font-family:Georgia,serif;font-size:20px;letter-spacing:-0.5px">ROL-EMS <span style="color:#E1A728">&times;</span> REBAR</div>
        <div style="color:#E1A728;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Booking Receipt</div>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 4px;color:#222;font-size:15px;font-weight:600">Thank you, ${name}!</p>
        <p style="margin:0 0 4px;color:#222;font-size:14px;font-weight:700">${headline}</p>
        <p style="margin:0 0 20px;color:#6B756B;font-size:13px">${subline}</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <div style="display:flex;justify-content:space-between;margin-top:16px;border-top:2px solid #1E5336;padding-top:12px">
          <span style="color:#222;font-weight:700">${totalLabel}</span>
          <span style="color:#1E5336;font-weight:700">${amount}</span>
        </div>
        ${noteBox}
        ${downloadBtn}
        <p style="margin:24px 0 0;color:#6B756B;font-size:12px;line-height:1.5">We look forward to hosting you. If you have any questions, reply to this email or reach us at the resort.</p>
      </div>
    </div>
  </div>`
}

export async function sendReceiptEmail(to: string, data: TemplateData): Promise<void> {
  const fromEnv = process.env.SMTP_FROM || ''
  const from = fromEnv.includes('<') ? fromEnv : fromEnv ? `ROL-EMS <${fromEnv}>` : `ROL-EMS <${process.env.SMTP_USER}>`

  let attachments: Array<{ filename: string; content: Buffer; contentType: string }> | undefined
  let pdfBuffer: Buffer | Uint8Array | undefined = data.pdfAttachment

  // Auto-generate PDF receipt attachment from DB if reference is available and attachment not explicitly provided
  if (!pdfBuffer && data.reference) {
    try {
      const booking = await prisma.booking.findUnique({ where: { reference: data.reference } })
      if (booking) {
        pdfBuffer = await buildReceiptPdf(booking)
      }
    } catch (err) {
      console.warn('Could not auto-generate PDF receipt attachment for email:', err)
    }
  }

  if (pdfBuffer) {
    attachments = [
      {
        filename: `ROL-EMS-${data.reference}.pdf`,
        content: Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer),
        contentType: 'application/pdf',
      },
    ]
  }

  await transporter().sendMail({
    from,
    to,
    subject: `Your ROL-EMS receipt · ${data.reference}`,
    html: html(data),
    attachments,
  })
}
