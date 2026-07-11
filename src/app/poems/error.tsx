'use client'

import Link from 'next/link'
import PageShell from '@/components/page-shell'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-stone-600 dark:text-stone-400">
          Une erreur est survenue
        </p>
        <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
          Impossible de charger les poèmes.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="mt-2 text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </PageShell>
  )
}
