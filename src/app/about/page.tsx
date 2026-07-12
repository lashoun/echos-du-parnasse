import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'À propos — Échos du Parnasse',
}

const githubUser = process.env.GITHUB_USERNAME ?? ''
const repoUrl = `https://github.com/${githubUser}/echos-du-parnasse`
const issuesUrl = `https://github.com/${githubUser}/echos-du-parnasse/issues`

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
          poétiques françaises du XIX<sup>e</sup> siècle, librement accessibles
          à toutes et tous.
        </p>

        <p>
          Le projet s&apos;inscrit dans la tradition du{' '}
          <strong>Parnasse</strong>, mouvement poétique de la seconde moitié du
          XIX<sup>e</sup> siècle qui prônait «&nbsp;l&apos;art pour
          l&apos;art&nbsp;» et le culte de la beauté formelle. En écho à cet
          idéal, le site met en valeur la richesse et la diversité de la poésie
          parnassienne et romantique.
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
          (bibliothèque libre de textes du domaine public) et de fichiers LaTeX
          compilés à partir d&apos;éditions académiques. Le code source du site
          est publié sous licence libre{' '}
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
