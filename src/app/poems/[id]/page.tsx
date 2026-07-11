import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageShell from '@/components/page-shell'
import PoemStatusToggle from '@/components/poem-status-toggle'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function PoemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch the poem
  const { data: poem } = await supabase
    .from('poems')
    .select(
      'id, title, content, language, author_id, collection_id, position_in_collection',
    )
    .eq('id', id)
    .single()

  if (!poem) {
    notFound()
  }

  // Fetch the author if present
  let author: {
    name: string
    birth_year: number | null
    death_year: number | null
  } | null = null
  if (poem.author_id) {
    const { data: a } = await supabase
      .from('authors')
      .select('name, birth_year, death_year')
      .eq('id', poem.author_id)
      .single()
    author = a
  }

  // Fetch previous/next poems within the same collection
  let prevPoem: { id: string; title: string } | null = null
  let nextPoem: { id: string; title: string } | null = null

  if (poem.collection_id && poem.position_in_collection != null) {
    const position = poem.position_in_collection

    const { data: prev } = await supabase
      .from('poems')
      .select('id, title')
      .eq('collection_id', poem.collection_id)
      .lt('position_in_collection', position)
      .order('position_in_collection', { ascending: false })
      .limit(1)
      .single()

    if (prev) prevPoem = prev

    const { data: next } = await supabase
      .from('poems')
      .select('id, title')
      .eq('collection_id', poem.collection_id)
      .gt('position_in_collection', position)
      .order('position_in_collection', { ascending: true })
      .limit(1)
      .single()

    if (next) nextPoem = next
  }

  const lifespan =
    author?.birth_year || author?.death_year
      ? `${author!.birth_year ?? '?'}–${author!.death_year ?? '?'}`
      : null

  return (
    <PageShell>
      <article>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {poem.title}
          </h1>
          {author && (
            <p className="mt-1 text-stone-600 dark:text-stone-300">
              <Link
                href={`/authors/${poem.author_id}`}
                className="hover:underline"
              >
                {author.name}
              </Link>
              {lifespan && (
                <span className="text-stone-400 dark:text-stone-500">
                  {' '}
                  ({lifespan})
                </span>
              )}
            </p>
          )}
          <div className="mt-3">
            <PoemStatusToggle poemId={poem.id} />
          </div>
        </header>

        <div className="leading-relaxed whitespace-pre-line text-stone-700 dark:text-stone-300">
          {poem.content}
        </div>
      </article>

      {/* Previous / Next navigation within collection */}
      {(prevPoem || nextPoem) && (
        <nav className="mt-8 grid grid-cols-2 gap-4 border-t border-stone-200 pt-6">
          <div>
            {prevPoem && (
              <Link
                href={`/poems/${prevPoem.id}`}
                className="block text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              >
                <span className="text-stone-400">← Précédent</span>
                <p className="font-medium">{prevPoem.title}</p>
              </Link>
            )}
          </div>
          <div className="text-right">
            {nextPoem && (
              <Link
                href={`/poems/${nextPoem.id}`}
                className="block text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              >
                <span className="text-stone-400">Suivant →</span>
                <p className="font-medium">{nextPoem.title}</p>
              </Link>
            )}
          </div>
        </nav>
      )}

      <nav className="mt-6">
        <Link
          href="/poems"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          ← Retour aux poèmes
        </Link>
      </nav>
    </PageShell>
  )
}
