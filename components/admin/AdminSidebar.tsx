'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Volleyball,
  CalendarCheck,
  Users,
  Disc,
  Trophy,
  Dices,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courts', label: 'Court Schedule', icon: Volleyball },
  { href: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { href: '/admin/open-play', label: 'Open Play', icon: Users },
  { href: '/admin/roulette', label: 'Roulette Pairing', icon: Dices },
  { href: '/admin/paddles', label: 'Paddle Rental', icon: Disc },
  { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
]

function BrandMark({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  if (compact) {
    return (
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        title="ROL-EMS × REBAR"
        className="font-serif text-lg leading-none tracking-[-0.05em] text-[#1E5336]"
      >
        R
      </Link>
    )
  }
  return (
    <Link
      href="/admin/dashboard"
      onClick={onNavigate}
      className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]"
    >
      ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
    </Link>
  )
}

export default function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const isActive = (href: string) =>
    href === '/admin/dashboard' ? pathname === '/admin/dashboard' : pathname.startsWith(href)

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.replace('/admin/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  const navBody = (
    <>
      <div
        className={`flex items-center border-b border-[#222222]/10 ${
          collapsed ? 'justify-center px-0 py-5' : 'justify-between px-6 py-5'
        }`}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="text-[#1E5336] hover:text-[#153d27]"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <>
            <div>
              <BrandMark />
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#E1A728]">Admin Panel</p>
            </div>
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="text-[#6B756B] transition hover:text-[#1E5336]"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                active
                  ? 'border-[#1E5336] bg-[#1E5336]/10 font-bold text-[#1E5336]'
                  : 'border-transparent text-[#6B756B] hover:border-[#1E5336]/40 hover:text-[#1E5336]'
              }`}
            >
              <Icon size={15} />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#222222]/10 p-3">
        <button
          onClick={handleLogout}
          disabled={signingOut}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] transition hover:text-red-700 disabled:opacity-60 ${
            collapsed ? 'w-full justify-center px-0' : 'w-full'
          }`}
        >
          <LogOut size={15} />
          {!collapsed && (signingOut ? 'Signing out…' : 'Sign out')}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[#222222]/10 bg-[#FDFBF7] px-4 py-3 md:hidden">
        <BrandMark />
        <button
          aria-label="Toggle admin menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="text-[#1E5336]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-[#222222]/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[#FDFBF7]">
            {navBody}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#222222]/10 bg-[#FDFBF7] transition-[width] duration-300 md:flex ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {navBody}
      </aside>
    </>
  )
}