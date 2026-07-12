import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Échos du Parnasse',
}

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Politique de confidentialité
      </h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Données collectées
        </h2>

        <p>
          <strong>Compte facultatif</strong>&nbsp;— si vous créez un compte,
          nous collectons votre adresse email (nécessaire à
          l&apos;authentification). Aucune autre donnée personnelle n&apos;est
          demandée.
        </p>

        <p>
          <strong>Marque-pages locaux</strong>&nbsp;— sans compte, les poèmes
          que vous marquez comme lus ou favoris sont stockés uniquement dans le
          stockage local de votre navigateur (localStorage). Ces données ne sont
          pas transmises au serveur.
        </p>

        <p>
          <strong>Cookies</strong>&nbsp;— un cookie de session est utilisé
          uniquement si vous êtes connecté, afin de maintenir votre session
          active. Aucun cookie de suivi ou de traçage n&apos;est employé.
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Utilisation des données
        </h2>

        <p>
          Les données collectées servent uniquement au fonctionnement du site —
          authentification et synchronisation de vos marque-pages entre
          appareils. Elles ne sont jamais partagées avec des tiers, ni utilisées
          à des fins publicitaires ou commerciales.
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Suppression de compte
        </h2>

        <p>
          Vous pouvez demander la suppression de votre compte et de toutes les
          données associées à tout moment en nous contactant via l&apos;adresse
          indiquée sur la page «&nbsp;À propos&nbsp;».
        </p>

        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Modification de cette politique
        </h2>

        <p>
          Cette politique de confidentialité peut être mise à jour
          ponctuellement. La date de dernière modification est indiquée
          ci-dessous.
        </p>

        <p className="text-xs text-stone-400 dark:text-stone-500">
          Dernière mise à jour — juillet 2026.
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
