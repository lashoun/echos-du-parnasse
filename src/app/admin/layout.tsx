import { requireAdmin } from '@/lib/admin'
import AdminSidebar from './admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect all admin routes — redirects to /login or / if not admin
  await requireAdmin()

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
