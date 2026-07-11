import Link from 'next/link'
import PageShell from '@/components/page-shell'
import PoemCard from '@/components/poem-card'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function PoemsPage() {
  const supabase = await createSupabaseServerClient()

  // Fetch all tags for the tag cloud
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name', { ascending: true })

  // Fetch poems with their author names in a single go
  const { data: poems } = await supabase
    .from('poems')
    .select('id, title, content, author_id')
    .order('title', { ascending: true })

  // Fetch all referenced authors
  const authorIds = [
    ...new Set(poems?.map((p) => p.author_id).filter(Boolean) as string[]),
  ]
  const { data: authors } = await supabase
    .from('authors')
    .select('id, name')
    .in(
      'id',
      authorIds.length > 0
        ? authorIds
        : ['00000000-0000-0000-0000-000000000000'],
    )

  const authorMap = new Map(authors?.map((a) => [a.id, a.name]) ?? [])

  if (!poems || poems.length === 0) {
    return (
      <PageShell>
        <StateMessage
          title="Aucun poème"
          description="Il n'y a pas encore de poèmes dans la bibliothèque."
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Tous les poèmes
        </h1>
        <Link
          href="/random"
          className="mt-1 inline-block text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Poème au hasard →
        </Link>
      </header>

      {/* Tag cloud */}
      {tags && tags.length > 0 && (
        <nav className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.id}`}
              className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600 hover:border-stone-500 hover:text-stone-900 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-400 dark:hover:text-stone-200"
            >
              {tag.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="space-y-4">
        {poems.map((poem) => (
          <PoemCard
            key={poem.id}
            poem={{
              id: poem.id,
              title: poem.title,
              content: poem.content,
              author_name: poem.author_id
                ? (authorMap.get(poem.author_id) ?? null)
                : null,
            }}
          />
        ))}
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
