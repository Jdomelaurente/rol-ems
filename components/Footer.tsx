'use client'

import { MapPin } from 'lucide-react'
import { useSiteContent } from '@/context/SiteContentContext'
import { lines } from '@/lib/site-content'

export default function Footer() {
  const { content } = useSiteContent()
  const { footer } = content

  return (
    <footer id="footer" className="border-t border-[#222222]/10 px-6 py-12 sm:py-16 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl text-[#1E5336] sm:text-3xl">{footer.brand}</p>
          <p className="mt-4 max-w-xs font-serif text-lg leading-7 text-[#1E5336] sm:mt-5 sm:text-xl">{footer.tagline}</p>
        </div>
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">Find us</p>
          <p className="text-sm leading-6 text-[#6B756B]">
            {lines(footer.address).map((line, i) => (
              <span key={i}>
                {line}
                {i < lines(footer.address).length - 1 && <br />}
              </span>
            ))}
          </p>
          <a href={footer.directionsHref} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 text-xs text-[#1E5336]">
            <MapPin size={14} /> {footer.directionsLabel}
          </a>
        </div>
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">Hours</p>
          <p className="text-sm leading-6 text-[#6B756B]">
            {lines(footer.hours).map((line, i) => (
              <span key={i}>
                {line}
                {i < lines(footer.hours).length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-[#E1A728]">Stay in touch</p>
          <p className="text-sm leading-6 text-[#6B756B]">
            {footer.email}
            <br />
            {footer.social}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-[#222222]/10 pt-5 text-[10px] uppercase tracking-[0.12em] text-[#6B756B] sm:mt-16 sm:flex-row">
        <span>{footer.copyright}</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/privacy-policy" className="hover:text-[#1E5336]">Privacy</a>
          <a href="/terms-conditions" className="hover:text-[#1E5336]">Terms</a>
          <a href="/refund-policy" className="hover:text-[#1E5336]">Refunds</a>
          <a href="/cookies-policy" className="hover:text-[#1E5336]">Cookies</a>
          <span className="hidden h-3 w-px bg-[#222222]/15 sm:block" />
          <a href="/pickleball/booking/lookup" className="hover:text-[#1E5336]">Check a booking</a>
          <a href="/admin/login" className="hover:text-[#1E5336]">Staff Login</a>
        </span>
      </div>
    </footer>
  )
}
