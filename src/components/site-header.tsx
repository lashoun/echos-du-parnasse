import Link from 'next/link'
import { getSupabaseConfig } from '@/lib/supabase/env'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function SiteHeader() {
  const config = getSupabaseConfig()
  let userEmail: string | null = null
  let isAdmin = false

  if (config) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(config.url, config.publishableKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // no-op for header-only read
          },
        },
      })
      const { data } = await supabase.auth.getUser()
      userEmail = data?.user?.email ?? null

      if (data?.user) {
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        isAdmin = adminRow !== null
      }
    } catch {
      // Silently ignore
    }
  }

  return (
    <header className="border-b border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
        >
          Échos du Parnasse
        </Link>
        <div className="flex items-center gap-3">
          {userEmail ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs text-amber-600 underline underline-offset-2 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                >
                  Admin
                </Link>
              )}
              <div className="group relative inline-flex items-center">
                <Link
                  href="/account"
                  className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  Compte
                </Link>
                <span className="invisible absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded bg-stone-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
                  {userEmail}
                </span>
              </div>
              <form
                action="/auth/signout"
                method="post"
                className="inline-flex items-center"
              >
                <button
                  type="submit"
                  className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
