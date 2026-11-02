'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  Menu, X, Trophy, CalendarCheck, Users, ShoppingBag,
  GraduationCap, Dices, ChevronDown, ListOrdered, Users2, Swords, ChevronRight
} from 'lucide-react'

export const tournamentSubLinks = [
  {
    href: '/pickleball/tournament/queue',
    label: 'Pickle Queue',
    description: 'Live rotational player queue & playing order',
    icon: ListOrdered,
  },
  {
    href: '/pickleball/tournament/pairs',
    label: 'Pairs Management',
    description: 'Dynamic team pairings & partners',
    icon: Users2,
  },
  {
    href: '/pickleball/tournament/mini-matches',
    label: 'Mini Matches',
    description: 'Quick matches, court assignments & scoring',
    icon: Swords,
  },
  {
    href: '/pickleball/tournaments',
    label: 'Tournament Management',
    description: 'Brackets, registered clubs & events',
    icon: Trophy,
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tournamentOpen, setTournamentOpen] = useState(false)
  const [mobileTournamentOpen, setMobileTournamentOpen] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isTournamentActive =
    pathname.startsWith('/pickleball/tournament') ||
    pathname.startsWith('/pickleball/tournaments')

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : href === '/pickleball' ? pathname === '/pickleball' : pathname.startsWith(href)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTournamentOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#222222]/10 bg-[#FDFBF7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Original Brand Logo */}
        <Link href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
          ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          <span className="ml-2 block font-sans text-[9px] uppercase tracking-[0.2em] text-[#E1A728]">Pickleball Sports Center</span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden items-center gap-1.5 lg:gap-2 md:flex">
          {/* Courts */}
          <Link
            href="/pickleball/booking"
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              isActive('/pickleball/booking')
                ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                : 'text-[#6B756B] hover:text-[#1E5336]'
            }`}
          >
            <CalendarCheck size={14} />
            Courts
          </Link>

          {/* Dedicated Tournament Category with Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setTournamentOpen(true)}
            onMouseLeave={() => setTournamentOpen(false)}
          >
            <button
              type="button"
              onClick={() => setTournamentOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                isTournamentActive
                  ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                  : 'text-[#6B756B] hover:text-[#1E5336]'
              }`}
              aria-haspopup="true"
              aria-expanded={tournamentOpen}
            >
              <Trophy size={14} className={isTournamentActive ? 'text-[#E1A728]' : ''} />
              <span>Tournament</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${tournamentOpen ? 'rotate-180 text-[#1E5336]' : 'text-[#6B756B]'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {tournamentOpen && (
              <div className="absolute left-0 top-full pt-1 z-50 w-72 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="rounded-lg border border-[#222222]/15 bg-[#FDFBF7] p-2 shadow-xl ring-1 ring-black/5">
                  <div className="px-3 py-1.5 border-b border-[#222222]/10 mb-1">
                    <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#E1A728]">
                      Tournament & Match Central
                    </span>
                  </div>

                  <div className="space-y-1">
                    {tournamentSubLinks.map((sub) => {
                      const Icon = sub.icon
                      const active = pathname === sub.href || (sub.href === '/pickleball/tournaments' && (pathname === '/pickleball/tournaments' || pathname.startsWith('/pickleball/tournaments/')))
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setTournamentOpen(false)}
                          className={`flex items-start gap-3 rounded-md px-3 py-2.5 transition ${
                            active
                              ? 'bg-[#1E5336] text-[#FDFBF7]'
                              : 'text-[#222222] hover:bg-[#1E5336]/10'
                          }`}
                        >
                          <div className={`mt-0.5 rounded p-1.5 ${active ? 'bg-white/20 text-[#E1A728]' : 'bg-[#1E5336]/10 text-[#1E5336]'}`}>
                            <Icon size={15} />
                          </div>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-[0.08em] ${active ? 'text-[#FDFBF7]' : 'text-[#1E5336]'}`}>
                              {sub.label}
                            </p>
                            <p className={`text-[10px] leading-tight ${active ? 'text-white/80' : 'text-[#6B756B]'}`}>
                              {sub.description}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Open Play */}
          <Link
            href="/pickleball/open-play"
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              isActive('/pickleball/open-play')
                ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                : 'text-[#6B756B] hover:text-[#1E5336]'
            }`}
          >
            <Users size={14} />
            Open Play
          </Link>

          {/* Roulette */}
          <Link
            href="/pickleball/roulette"
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              isActive('/pickleball/roulette')
                ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                : 'text-[#6B756B] hover:text-[#1E5336]'
            }`}
          >
            <Dices size={14} />
            Roulette
          </Link>

          {/* Coaching */}
          <Link
            href="/pickleball/coaching"
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              isActive('/pickleball/coaching')
                ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                : 'text-[#6B756B] hover:text-[#1E5336]'
            }`}
          >
            <GraduationCap size={14} />
            Coaching
          </Link>

          {/* Shop */}
          <Link
            href="/pickleball/shop"
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              isActive('/pickleball/shop')
                ? 'border-b-2 border-[#1E5336] text-[#1E5336]'
                : 'text-[#6B756B] hover:text-[#1E5336]'
            }`}
          >
            <ShoppingBag size={14} />
            Shop
          </Link>

          <span className="mx-2 h-6 w-px bg-[#222222]/15" aria-hidden="true" />

          <Link
            href="/"
            className={`border-b border-[#1E5336] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              isActive('/') ? 'text-[#1E5336]' : 'text-[#222222] hover:text-[#1E5336]'
            }`}
          >
            Back to home
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            className="p-1 text-[#222222]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="max-h-[85vh] overflow-y-auto border-t border-[#222222]/10 bg-[#FDFBF7] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {/* Courts */}
            <Link
              href="/pickleball/booking"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                isActive('/pickleball/booking') ? 'text-[#1E5336]' : 'text-[#6B756B]'
              }`}
            >
              <CalendarCheck size={16} />
              Courts
            </Link>

            {/* Tournament Expandable Category */}
            <div className="border-y border-[#222222]/10 py-2">
              <button
                type="button"
                onClick={() => setMobileTournamentOpen((v) => !v)}
                className={`flex w-full items-center justify-between text-xs font-bold uppercase tracking-[0.14em] ${
                  isTournamentActive ? 'text-[#1E5336]' : 'text-[#222222]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Trophy size={16} className={isTournamentActive ? 'text-[#E1A728]' : ''} />
                  Tournament Section
                </span>
                <ChevronDown size={14} className={`transition-transform ${mobileTournamentOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileTournamentOpen && (
                <div className="mt-2 space-y-1.5 pl-6">
                  {tournamentSubLinks.map((sub) => {
                    const Icon = sub.icon
                    const active = pathname === sub.href
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between py-1.5 text-xs font-medium ${
                          active ? 'text-[#1E5336] font-bold' : 'text-[#6B756B]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} className={active ? 'text-[#1E5336]' : 'text-[#6B756B]'} />
                          {sub.label}
                        </span>
                        <ChevronRight size={12} className="text-[#6B756B]/50" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Open Play */}
            <Link
              href="/pickleball/open-play"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                isActive('/pickleball/open-play') ? 'text-[#1E5336]' : 'text-[#6B756B]'
              }`}
            >
              <Users size={16} />
              Open Play
            </Link>

            {/* Roulette */}
            <Link
              href="/pickleball/roulette"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                isActive('/pickleball/roulette') ? 'text-[#1E5336]' : 'text-[#6B756B]'
              }`}
            >
              <Dices size={16} />
              Roulette
            </Link>

            {/* Coaching */}
            <Link
              href="/pickleball/coaching"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                isActive('/pickleball/coaching') ? 'text-[#1E5336]' : 'text-[#6B756B]'
              }`}
            >
              <GraduationCap size={16} />
              Coaching
            </Link>

            {/* Shop */}
            <Link
              href="/pickleball/shop"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                isActive('/pickleball/shop') ? 'text-[#1E5336]' : 'text-[#6B756B]'
              }`}
            >
              <ShoppingBag size={16} />
              Shop
            </Link>

            <span className="my-2 h-px bg-[#222222]/10" aria-hidden="true" />

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`border-b border-[#1E5336] py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                isActive('/') ? 'text-[#1E5336]' : 'text-[#222222]'
              }`}
            >
              Back to home
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
