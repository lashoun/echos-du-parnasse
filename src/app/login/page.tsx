import Link from 'next/link'
import PageShell from '@/components/page-shell'
import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Connexion</h1>
      </header>

      {params.message && (
        <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      )}

      {params.error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <form className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            formAction={login}
            className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
          >
            Se connecter
          </button>
          <button
            formAction={signup}
            className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            S&apos;inscrire
          </button>
        </div>
      </form>

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
