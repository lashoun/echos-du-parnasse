import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseConfig } from '@/lib/supabase/env'

interface StatCardProps {
  label: string
  count: number
  href: string
  icon: string
}

function StatCard({ label, count, href, icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          {count}
        </span>
      </div>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{label}</p>
    </Link>
  )
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient()

  // Use service role client to get accurate admin count (bypasses RLS)
  const adminSupabase = createClient(
    requireSupabaseConfig().url,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const [
    { count: poems },
    { count: authors },
    { count: collections },
    { count: tags },
    { count: admins },
  ] = await Promise.all([
    supabase.from('poems').select('*', { count: 'exact', head: true }),
    supabase.from('authors').select('*', { count: 'exact', head: true }),
    supabase.from('collections').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
    adminSupabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Poèmes"
          count={poems ?? 0}
          href="/admin/poems"
          icon="📝"
        />
        <StatCard
          label="Auteurs"
          count={authors ?? 0}
          href="/admin/authors"
          icon="✍️"
        />
        <StatCard
          label="Collections"
          count={collections ?? 0}
          href="/admin/collections"
          icon="📚"
        />
        <StatCard label="Tags" count={tags ?? 0} href="/admin/tags" icon="🏷️" />
        <StatCard
          label="Administrateurs"
          count={admins ?? 0}
          href="/admin/admins"
          icon="🔐"
        />
      </div>
    </div>
  )
}
