'use client'

import { ArrowLeft, Check, Download, ExternalLink, Loader2, XCircle } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type PaymentState = 'checking' | 'paid' | 'unpaid' | 'skipped'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<PaymentState>('checking')
  const [reference, setReference] = useState<string | null>(null)
  const attempt = useRef(0)

  useEffect(() => {
    const demo = searchParams.get('demo') === 'true'
    const id =
      searchParams.get('payment_intent_id') ||
      searchParams.get('session_id') ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('paymongo_payment_intent_id') ||
          localStorage.getItem('paymongo_session_id')
        : null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('paymongo_payment_intent_id')
      localStorage.removeItem('paymongo_session_id')
    }

    if (!id) {
      setState(demo ? 'paid' : 'skipped')
      return
    }

    let cancelled = false

    const check = () => {
      attempt.current += 1
      const param = id.startsWith('cs_') ? 'session_id' : 'payment_intent_id'
      const ref = searchParams.get('ref')
      const query = new URLSearchParams({ [param]: id })
      if (ref) query.set('ref', ref)

      fetch(`/api/receipt?${query.toString()}`)
        .then(async (res) => {
          if (cancelled) return
          const data = await res.json().catch(() => null)
          if (res.ok && data?.paid) {
            if (data?.reference) setReference(data.reference)
            setState('paid')
            return
          }
          if (res.ok && data && data.paid === false) {
            // Give PayMongo a few seconds to flip the intent after the app
            // returns; a cancelled payment will settle to "unpaid" here too.
            if (attempt.current < 5) {
              setTimeout(check, 2000)
              return
            }
            if (data?.reference) setReference(data.reference)
            setState('unpaid')
            return
          }
          if (attempt.current < 5) {
            setTimeout(check, 2000)
            return
          }
          setState('unpaid')
        })
        .catch(() => {
          if (cancelled) return
          if (attempt.current < 5) setTimeout(check, 2000)
          else setState('unpaid')
        })
    }

    check()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  if (state === 'checking') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center bg-[#FDFBF7] px-6 py-20 text-center text-[#222222] shadow-2xl">
        <Loader2 size={28} className="animate-spin text-[#1E5336]" />
        <h2 className="mt-5 font-serif text-2xl tracking-[-0.04em] text-[#1E5336]">Confirming your payment…</h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
          Please keep this page open while we check with GCash.
        </p>
      </div>
    )
  }

  if (state === 'unpaid') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center bg-[#FDFBF7] px-6 py-16 text-center text-[#222222] shadow-2xl">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <XCircle size={26} />
        </span>
        <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Payment not completed</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#6B756B]">
          We could not confirm a GCash payment for this booking. If you cancelled the GCash
          confirmation, no money was taken and you can try again. If you were charged, contact us
          with the reference below.
        </p>
        {reference && (
          <p className="mt-4 border border-[#222222]/15 px-4 py-2 text-xs tracking-[0.08em] text-[#6B756B]">
            Reference: <span className="font-bold text-[#1E5336]">{reference}</span>
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/#facilities"
            className="bg-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] hover:bg-[#153d27]"
          >
            Try another booking
          </a>
          <a
            href="/"
            className="border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
          >
            Back to home
          </a>
        </div>
      </div>
    )
  }

  if (state === 'skipped') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center bg-[#FDFBF7] px-6 py-16 text-center text-[#222222] shadow-2xl">
        <h2 className="font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Nothing to confirm</h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
          This page is used after a GCash payment. If you were sent here by mistake, head back to
          the booking page.
        </p>
        <a
          href="/#facilities"
          className="mt-8 inline-flex items-center gap-2 border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
        >
          <ArrowLeft size={14} /> Back to stay & play
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center bg-[#FDFBF7] px-6 py-16 text-center text-[#222222] shadow-2xl">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E5336] text-[#FDFBF7]">
        <Check size={26} />
      </span>
      <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">Payment received</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#6B756B]">
        Thanks — your booking is confirmed and your receipt is on its way to your email. We&apos;ll be in touch with any
        updates ahead of your visit.
      </p>

      {reference && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/api/receipt/pdf?ref=${encodeURIComponent(reference)}&download=1`}
            download={`ROL-EMS-${reference}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1E5336] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] transition hover:bg-[#153d27]"
          >
            <Download size={13} /> Download receipt (PDF)
          </a>
          <a
            href={`/booking/receipt?ref=${encodeURIComponent(reference)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#1E5336] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] transition hover:bg-[#1E5336] hover:text-[#FDFBF7]"
          >
            <ExternalLink size={13} /> View receipt online
          </a>
        </div>
      )}

      <a
        href="/#facilities"
        className="mt-8 inline-flex items-center gap-2 border border-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] hover:bg-[#1E5336] hover:text-[#FDFBF7]"
      >
        <ArrowLeft size={14} /> Back to stay & play
      </a>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F3F0EC] px-6 py-16 text-[#222222]">
      <Suspense fallback={<div className="mx-auto max-w-2xl bg-[#FDFBF7] px-6 py-16 text-center text-sm text-[#6B756B] shadow-2xl">Confirming payment…</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
