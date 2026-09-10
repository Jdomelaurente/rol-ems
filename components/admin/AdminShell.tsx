'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

const STORAGE_KEY = 'rolems-admin-sidebar-collapsed'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === '1') setCollapsed(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#F3F0EC]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC]">
      <AdminSidebar collapsed={collapsed} onToggle={toggle} />
      <div
        className={`min-h-screen pt-14 transition-[padding] duration-300 md:pt-0 ${
          collapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {children}
      </div>
    </div>
  )
}