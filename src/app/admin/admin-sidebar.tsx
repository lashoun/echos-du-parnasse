'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊' },
  { href: '/admin/poems', label: 'Poèmes', icon: '📝' },
  { href: '/admin/authors', label: 'Auteurs', icon: '✍️' },
  { href: '/admin/collections', label: 'Collections', icon: '📚' },
  { href: '/admin/tags', label: 'Tags', icon: '🏷️' },
  { href: '/admin/admins', label: 'Administrateurs', icon: '🔐' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-stone-200 text-stone-900 dark:bg-stone-700 dark:text-stone-100'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 border-t border-stone-200 pt-4 dark:border-stone-700">
        <Link
          href="/"
          className="flex items-center gap-2 rounded px-3 py-2 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  )
}
