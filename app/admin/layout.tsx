import AdminShell from '@/components/admin/AdminShell'
import { BadmintonProvider } from '@/context/BadmintonContext'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <BadmintonProvider>
      <AdminShell>{children}</AdminShell>
    </BadmintonProvider>
  )
}