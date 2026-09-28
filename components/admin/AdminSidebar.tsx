'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Volleyball,
  CalendarCheck,
  Users,
  Disc,
  Trophy,
  Dices,
  Home,
  Feather,
  LayoutGrid,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  comingSoon?: boolean
}

interface NavGroup {
  key: string
  label: string
  icon: typeof Home
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    key: 'cottage',
    label: 'Cottage & Event',
    icon: Home,
    items: [{ href: '/admin/catalog', label: 'Booking Catalog' }],
  },
  {
    key: 'pickleball',
    label: 'Pickleball',
    icon: Volleyball,
    items: [
      { href: '/admin/courts', label: 'Court Schedule' },
      { href: '/admin/reservations', label: 'Reservations' },
      { href: '/admin/open-play', label: 'Open Play' },
      { href: '/admin/roulette', label: 'Roulette Pairing' },
      { href: '/admin/paddles', label: 'Paddle Rental' },
      { href: '/admin/tournaments', label: 'Tournaments' },
    ],
  },
  {
    key: 'badminton',
    label: 'Badminton',
    icon: Feather,
    items: [
      { href: '/admin/badminton/catalog', label: 'Court & Game Catalog' },
      { href: '/admin/badminton/reservations', label: 'Reservations' },
    ],
  },
  {
    key: 'other',
    label: 'Other',
    icon: LayoutGrid,
    items: [{ href: '/admin/site', label: 'Site Content' }],
  },
]

function isItemActive(pathname: string, href: string) {
  if (href === '/admin/dashboard' || href === '/') return pathname === href
  if (href.includes('?')) return false
  return pathname.startsWith(href)
}

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const activeGroupKey = navGroups.find((g) =>
    g.items.some((item) => !item.comingSoon && isItemActive(pathname, item.href))
  )?.key

  useEffect(() => {
    if (!activeGroupKey) return
    setOpenGroups((prev) => ({ ...prev, [activeGroupKey]: true }))
  }, [activeGroupKey])

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleGroupClick = (key: string) => {
    if (collapsed) {
      onToggle()
      setOpenGroups((prev) => ({ ...prev, [key]: true }))
      return
    }
    toggleGroup(key)
  }

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

  const dashboardActive = pathname === '/admin/dashboard'

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

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/admin/dashboard"
          onClick={() => setMobileOpen(false)}
          title={collapsed ? 'Dashboard' : undefined}
          className={`mb-1 flex items-center gap-3 border-l-2 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition ${
            collapsed ? 'justify-center px-0' : ''
          } ${
            dashboardActive
              ? 'border-[#1E5336] bg-[#1E5336]/10 font-bold text-[#1E5336]'
              : 'border-transparent text-[#6B756B] hover:border-[#1E5336]/40 hover:text-[#1E5336]'
          }`}
        >
          <LayoutDashboard size={15} />
          {!collapsed && 'Dashboard'}
        </Link>

        <div className="mt-2 space-y-0.5">
          {navGroups.map((group) => {
            const groupActive = group.items.some(
              (item) => !item.comingSoon && isItemActive(pathname, item.href)
            )
            const open = !collapsed && !!openGroups[group.key]
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => handleGroupClick(group.key)}
                  title={collapsed ? group.label : undefined}
                  aria-expanded={open}
                  className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition ${
                    collapsed ? 'justify-center px-0' : ''
                  } ${
                    groupActive
                      ? 'border-[#1E5336] bg-[#1E5336]/5 font-bold text-[#1E5336]'
                      : 'border-transparent text-[#6B756B] hover:border-[#1E5336]/40 hover:text-[#1E5336]'
                  }`}
                >
                  <group.icon size={15} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>

                {open && (
                  <div className="ml-4 space-y-0.5 border-l border-[#222222]/10 pl-2 py-1">
                    {group.items.map((item) =>
                      item.comingSoon ? (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#6B756B]/50"
                        >
                          {item.label}
                          <span className="ml-auto border border-[#E1A728]/50 px-1 py-0.5 text-[8px] leading-none text-[#E1A728]">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition ${
                            isItemActive(pathname, item.href)
                              ? 'font-bold text-[#1E5336]'
                              : 'text-[#6B756B] hover:text-[#1E5336]'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
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
