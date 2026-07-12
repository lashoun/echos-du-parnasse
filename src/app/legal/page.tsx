import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Mentions légales — Échos du Parnasse',
}

const githubUser = process.env.GITHUB_USERNAME ?? ''
const githubRepo = process.env.GITHUB_REPO ?? ''
const issuesUrl = githubUser
  ? `https://github.com/${githubUser}/${githubRepo}/issues`
  : '#'

export default function LegalPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Mentions légales
      </h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Éditeur
        </h2>

        <p>
          Le site <strong>Échos du Parnasse</strong> est un projet personnel
          hébergé par son créateur. Pour toute communication, veuillez utiliser
          le système de tickets sur{' '}
          <a
            href={issuesUrl}
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            le dépôt GitHub
          </a>{' '}
          du projet.
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Hébergement
        </h2>

        <p>
          Ce site est hébergé par{' '}
          <a
            href="https://vercel.com"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Vercel Inc.
          </a>
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Propriété intellectuelle
        </h2>

        <p>
          Les textes publiés sur ce site sont tirés d&apos;œuvres du domaine
          public. Les contenus originaux du site (code, design, textes
          explicatifs) sont diffusés sous licence{' '}
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            GNU GPLv3
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Responsabilité
        </h2>

        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des
          informations diffusées. En cas d&apos;erreur dans un texte ou une
          attribution, merci de le signaler via{' '}
          <a
            href={issuesUrl}
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            le dépôt GitHub
          </a>
          .
        </p>
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
