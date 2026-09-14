'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Trophy, CalendarCheck, Users, Volleyball, Disc, ShoppingBag, GraduationCap, Dices, Activity } from 'lucide-react'

const navLinks = [
  { href: '/pickleball', label: 'Hub', icon: Volleyball },
  { href: '/pickleball/booking', label: 'Court Booking', icon: CalendarCheck },
  { href: '/pickleball/open-play', label: 'Open Play', icon: Users },
  { href: '/pickleball/paddles', label: 'Paddle Rental', icon: Disc },
  { href: '/pickleball/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/coaching', label: 'Coaching', icon: GraduationCap },
  { href: '/roulette', label: 'Roulette', icon: Dices },
  { href: '/score/live-1', label: 'Live Score', icon: Activity },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/pickleball' ? pathname === '/pickleball' : pathname.startsWith(href)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#222222]/10 bg-[#FDFBF7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Original Brand Logo */}
        <Link href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
          ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          <span className="ml-2 block font-sans text-[9px] uppercase tracking-[0.2em] text-[#E1A728]">Pickleball Sports Center</span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                  active
                    ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                    : 'text-[#6B756B] hover:text-[#1E5336]'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            className="p-1 text-[#222222] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#222222]/10 bg-[#FDFBF7] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  isActive(href) ? 'text-[#1E5336]' : 'text-[#6B756B]'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
