import Link from 'next/link'
import PageShell from '@/components/page-shell'
import PoemCard from '@/components/poem-card'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  // Fetch the first poem
  const { data: poems } = await supabase
    .from('poems')
    .select('id, title, content, author_id')
    .limit(1)

  const poem = poems?.[0] ?? null
  let authorName: string | null = null

  if (poem?.author_id) {
    const { data: author } = await supabase
      .from('authors')
      .select('name')
      .eq('id', poem.author_id)
      .single()

    authorName = author?.name ?? null
  }

  if (!poem) {
    return (
      <PageShell>
        <StateMessage
          title="Bienvenue sur Échos du Parnasse"
          description="Aucun poème pour le moment. Revenez bientôt !"
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Échos du Parnasse
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Bibliothèque numérique de poésie du domaine public
        </p>
      </header>

      <section>
        <PoemCard
          poem={{
            id: poem.id,
            title: poem.title,
            content: poem.content,
            author_name: authorName,
          }}
          variant="featured"
        />
      </section>

      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href="/poems"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Parcourir tous les poèmes →
        </Link>
        <Link
          href="/random"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Poème au hasard →
        </Link>
        <Link
          href="/collections"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Collections →
        </Link>
        <Link
          href="/search"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Rechercher →
        </Link>
      </nav>
    </PageShell>
  )
}
