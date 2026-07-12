import Link from 'next/link'
import { getSupabaseConfig } from '@/lib/supabase/env'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function SiteHeader() {
  const config = getSupabaseConfig()
  let userEmail: string | null = null

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
              <Link
                href="/account"
                className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Compte
              </Link>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {userEmail}
              </span>
              <form action="/auth/signout" method="post" className="inline-flex items-center">
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
