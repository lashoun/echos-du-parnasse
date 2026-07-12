import Link from 'next/link'
import PageShell from '@/components/page-shell'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RandomPageSearchParams {
  author?: string
  collection?: string
  tag?: string
}

export default async function RandomPage({
  searchParams,
}: {
  searchParams: Promise<RandomPageSearchParams>
}) {
  const filters = await searchParams
  const supabase = await createSupabaseServerClient()

  // Fetch filter options
  const { data: authors } = await supabase
    .from('authors')
    .select('id, name')
    .order('name', { ascending: true })

  const { data: collections } = await supabase
    .from('collections')
    .select('id, title')
    .order('title', { ascending: true })

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name', { ascending: true })

  // Get a random poem ID
  const { data: poemId } = await supabase.rpc('get_random_poem_id', {
    p_author_id: filters.author ?? null,
    p_collection_id: filters.collection ?? null,
    p_tag_id: filters.tag ?? null,
  })

  let poemTitle: string | null = null
  let poemContent: string | null = null
  let poemAuthorName: string | null = null

  if (poemId) {
    const { data: p } = await supabase
      .from('poems')
      .select('id, title, content, author_id')
      .eq('id', poemId)
      .single()
    if (p) {
      poemTitle = p.title
      poemContent = p.content
      if (p.author_id) {
        const { data: a } = await supabase
          .from('authors')
          .select('name')
          .eq('id', p.author_id)
          .single()
        poemAuthorName = a?.name ?? null
      }
    }
  }

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Poème au hasard
        </h1>
      </header>

      {/* Filter form */}
      <form method="get" className="mb-8 flex flex-wrap gap-3">
        <select
          name="author"
          defaultValue={filters.author ?? ''}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les auteurs</option>
          {authors?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          name="collection"
          defaultValue={filters.collection ?? ''}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Toutes les collections</option>
          {collections?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          name="tag"
          defaultValue={filters.tag ?? ''}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les tags</option>
          {tags?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded bg-stone-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          Filtrer
        </button>
      </form>

      {/* Poem display */}
      {poemTitle ? (
        <article>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            {poemTitle}
          </h2>
          {poemAuthorName && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {poemAuthorName}
            </p>
          )}
          <div className="mt-4 leading-relaxed whitespace-pre-wrap text-stone-700 dark:text-stone-300">
            {poemContent}
          </div>
        </article>
      ) : (
        <StateMessage
          title="Aucun poème trouvé"
          description="Essayez de modifier vos filtres."
        />
      )}

      <nav className="mt-8 flex gap-4">
        <form method="get">
          {filters.author && (
            <input type="hidden" name="author" value={filters.author} />
          )}
          {filters.collection && (
            <input type="hidden" name="collection" value={filters.collection} />
          )}
          {filters.tag && (
            <input type="hidden" name="tag" value={filters.tag} />
          )}
          <button
            type="submit"
            className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Un autre poème →
          </button>
        </form>
        <Link
          href="/"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          ← Retour à l&apos;accueil
        </Link>
      </nav>
    </PageShell>
  )
}
