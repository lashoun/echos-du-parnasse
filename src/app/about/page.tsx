import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'À propos — Échos du Parnasse',
}

const githubUser = process.env.GITHUB_USERNAME ?? ''
const githubRepo = process.env.GITHUB_REPO ?? ''
const repoUrl = githubUser
  ? `https://github.com/${githubUser}/${githubRepo}`
  : '#'
const issuesUrl = githubUser
  ? `https://github.com/${githubUser}/${githubRepo}/issues`
  : '#'

export default function AboutPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        À propos
      </h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        <p>
          <strong>Échos du Parnasse</strong> est une bibliothèque numérique
          dédiée à la poésie du domaine public. Elle rassemble des œuvres
          poétiques françaises librement accessibles à toutes et tous.
        </p>

        <p>
          Le nom du projet fait réference au{' '}
          <a
            href="https://fr.wikipedia.org/wiki/Mont_Parnasse"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            mont Parnasse
          </a>
          , qui était célébré dans la Grèce antique, avec le mont Hélicon, comme
          l&apos;une des deux retraites des neuf Muses. Il donna par ailleurs
          son nom à un mouvement littéraire français du XIXe siècle&nbsp;: le{' '}
          <a
            href="https://fr.wikipedia.org/wiki/Parnasse_(po%C3%A9sie)"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Parnasse
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Fonctionnalités
        </h2>

        <ul className="list-disc space-y-1 pl-5">
          <li>Parcourir et rechercher parmi des centaines de poèmes</li>
          <li>Filtrer par auteur, recueil ou tag</li>
          <li>Poème au hasard pour découvrir de nouvelles œuvres</li>
          <li>Marquer les poèmes comme lus ou favoris</li>
          <li>Compte facultatif pour synchroniser vos marque-pages</li>
        </ul>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Sources
        </h2>

        <p>
          Les poèmes proviennent de{' '}
          <a
            href="https://fr.wikisource.org"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Wikisource
          </a>{' '}
          et de{' '}
          <a
            href="https://gallica.bnf.fr/"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Gallica
          </a>
          . Le code source du site est publié sous licence libre{' '}
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            GNU GPLv3
          </a>{' '}
          sur{' '}
          <a
            href={repoUrl}
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            GitHub
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Contact
        </h2>

        <p>
          Pour toute question ou suggestion, vous pouvez ouvrir un{' '}
          <a
            href={issuesUrl}
            className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
          >
            ticket sur GitHub
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
