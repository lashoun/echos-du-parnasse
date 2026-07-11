import Link from 'next/link'
import PageShell from '@/components/page-shell'
import StateMessage from '@/components/state-message'
import PoemCard from '@/components/poem-card'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface SearchPageSearchParams {
  q?: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageSearchParams>
}) {
  const { q } = await searchParams
  const supabase = await createSupabaseServerClient()

  let poems:
    | { id: string; title: string; content: string; author_id: string | null }[]
    | null = null
  let authorMap = new Map<string, string>()

  if (q && q.trim()) {
    const query = q.trim()

    // Search poems by title or content using ILIKE
    const { data: results } = await supabase
      .from('poems')
      .select('id, title, content, author_id')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('title', { ascending: true })

    poems = results

    // Fetch author names
    const authorIds = [
      ...new Set(poems?.map((p) => p.author_id).filter(Boolean) as string[]),
    ]
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('authors')
        .select('id, name')
        .in('id', authorIds)
      authorMap = new Map(authors?.map((a) => [a.id, a.name]) ?? [])
    }
  }

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Rechercher
        </h1>
      </header>

      <form method="get" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Titre ou contenu du poème…"
            className="block flex-1 rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
          />
          <button
            type="submit"
            className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
          >
            Rechercher
          </button>
        </div>
      </form>

      {q && (
        <>
          {poems && poems.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                {poems.length} résultat{poems.length > 1 ? 's' : ''} pour « {q}{' '}
                »
              </p>
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
            </>
          ) : (
            <StateMessage
              title="Aucun résultat"
              description={`Aucun poème ne correspond à « ${q} ».`}
            />
          )}
        </>
      )}

      {!q && (
        <p className="py-10 text-center text-sm text-stone-400 dark:text-stone-500">
          Entrez un mot-clé pour rechercher dans les poèmes.
        </p>
      )}

      <nav className="mt-8">
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
