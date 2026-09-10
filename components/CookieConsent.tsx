'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'rol_ems_cookie_consent'

export default function CookieConsent() {
  const [choice, setChoice] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY)
      if (saved) {
        setChoice(saved)
      } else {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      /* storage unavailable */
    }
    setChoice(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie and data preferences"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#222222]/10 bg-[#FDFBF7] px-6 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[#1E5336]">Cookies &amp; your data</p>
          <p className="mt-1 text-xs leading-5 text-[#6B756B]">
            We do not use tracking cookies. We use only what&apos;s needed for bookings (browser
            storage) and cookieless analytics to improve the site. See our{' '}
            <Link href="/cookies-policy" className="underline text-[#1E5336] hover:text-[#E1A728]">
              Cookies Policy
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline text-[#1E5336] hover:text-[#E1A728]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => accept('essential')}
            className="border border-[#222222]/20 px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-[#222222] transition hover:border-[#1E5336] hover:text-[#1E5336]"
          >
            Essential only
          </button>
          <button
            onClick={() => accept('all')}
            className="bg-[#1E5336] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-[#FDFBF7] transition hover:bg-[#E1A728] hover:text-[#1E5336]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}