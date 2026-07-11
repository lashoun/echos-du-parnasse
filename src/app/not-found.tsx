import Link from 'next/link'
import PageShell from '@/components/page-shell'

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-stone-600 dark:text-stone-400">
          Page introuvable
        </p>
        <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </PageShell>
  )
}
