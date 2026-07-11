import Link from 'next/link'
import PageShell from '@/components/page-shell'

export default function AuthCodeErrorPage() {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-stone-600 dark:text-stone-400">
          Erreur d&apos;authentification
        </p>
        <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
          La connexion a échoué. Veuillez réessayer.
        </p>
        <Link
          href="/login"
          className="mt-6 text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Retour à la page de connexion
        </Link>
      </div>
    </PageShell>
  )
}
