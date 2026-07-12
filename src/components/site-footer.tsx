import Link from 'next/link'

const links = [
  { href: '/about', label: 'À propos' },
  { href: '/privacy', label: 'Politique de confidentialité' },
  { href: '/legal', label: 'Mentions légales' },
]

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 py-8 dark:border-stone-700">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-center text-xs text-stone-400 dark:text-stone-500">
          Échos du Parnasse — Bibliothèque numérique de poésie du domaine
          public.
        </p>
        <nav className="mt-3 flex justify-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
