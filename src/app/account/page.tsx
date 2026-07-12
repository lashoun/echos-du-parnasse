import Link from 'next/link'
import PageShell from '@/components/page-shell'
import { deleteAccount } from './actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Compte
      </h1>

      {params.message && (
        <p className="mt-4 mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      )}

      {params.error && (
        <p className="mt-4 mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <div className="mt-6 space-y-6 text-sm">
        <section>
          <h2 className="font-semibold text-stone-800 dark:text-stone-200">
            Informations personnelles
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            {user.email}
          </p>
        </section>

        <section className="border-t border-stone-200 pt-6 dark:border-stone-700">
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            Zone dangereuse
          </h2>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            La suppression de votre compte est irréversible. Toutes vos données
            (marque-pages, favoris) seront définitivement effacées.
          </p>

          <form action={deleteAccount} className="mt-4 space-y-3">
            <label className="block text-sm text-stone-600 dark:text-stone-400">
              <span>Tapez </span>
              <strong>SUPPRIMER</strong>
              <span> pour confirmer&nbsp;:</span>
              <input
                type="text"
                name="confirmation"
                required
                pattern="SUPPRIMER"
                placeholder="SUPPRIMER"
                className="mt-1 block w-full rounded border border-red-300 px-3 py-2 text-sm text-stone-900 focus:border-red-500 focus:outline-none dark:border-red-600 dark:bg-stone-800 dark:text-stone-100"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Supprimer mon compte
            </button>
          </form>
        </section>
      </div>

      <nav className="mt-8">
        <Link
          href="/"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          ← Retour à l&apos;accueil
        </Link>
      </nav>
    </PageShell>
  )
}
