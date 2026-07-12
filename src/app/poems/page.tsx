import Link from 'next/link'
import PageShell from '@/components/page-shell'
import PoemCard from '@/components/poem-card'
import PoemFilters from '@/components/poem-filters'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface PoemsSearchParams {
  q?: string
  author?: string
  collection?: string
  tag?: string
  random?: string
}

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<PoemsSearchParams>
}) {
  const filters = await searchParams
  const showRandom = filters.random === '1'
  const supabase = await createSupabaseServerClient()

  // Fetch filter options + relationship data for cascading filters
  const [
    { data: authors },
    { data: collections },
    { data: tags },
    { data: poemTags },
    { data: allPoems },
  ] = await Promise.all([
    supabase.from('authors').select('id, name').order('name'),
    supabase.from('collections').select('id, title, author_id').order('title'),
    supabase.from('tags').select('id, name').order('name'),
    supabase.from('poem_tags').select('tag_id, poem_id'),
    supabase.from('poems').select('id, author_id, collection_id'),
  ])

  // Build tag → author/collection relationships for cascading filters
  const poemMap = new Map((allPoems ?? []).map((p: any) => [p.id, p]))
  const tagRelationships: {
    tagId: string
    authorId: string
    collectionId: string | null
  }[] = (poemTags ?? []).flatMap((pt: any) => {
    const poem = poemMap.get(pt.poem_id)
    if (!poem) return []
    return [
      {
        tagId: pt.tag_id,
        authorId: poem.author_id,
        collectionId: poem.collection_id ?? null,
      },
    ]
  })

  // Build the query dynamically
  let query = supabase.from('poems').select('id, title, content, author_id')

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim()
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  }
  if (filters.author) {
    query = query.eq('author_id', filters.author)
  }
  if (filters.collection) {
    query = query.eq('collection_id', filters.collection)
  }

  // Handle tag filter via poem_tags junction
  let hasTagFilter = false
  if (filters.tag) {
    hasTagFilter = true
    const { data: poemIds } = await supabase
      .from('poem_tags')
      .select('poem_id')
      .eq('tag_id', filters.tag)

    const ids = poemIds?.map((pt) => pt.poem_id) ?? []
    if (ids.length > 0) {
      query = query.in('id', ids)
    }
  }

  const { data: poems } = await query.order('title', { ascending: true })

  // Build author map
  const authorIds = [
    ...new Set(poems?.map((p) => p.author_id).filter(Boolean) as string[]),
  ]
  let authorMap = new Map<string, string>()
  if (authorIds.length > 0) {
    const { data: fetched } = await supabase
      .from('authors')
      .select('id, name')
      .in(
        'id',
        authorIds.length > 0
          ? authorIds
          : ['00000000-0000-0000-0000-000000000000'],
      )
    authorMap = new Map(fetched?.map((a) => [a.id, a.name]) ?? [])
  }

  // Random poem from filtered set
  let randomPoem: {
    id: string
    title: string
    content: string
    author_id: string | null
  } | null = null
  let randomPoemAuthor: string | null = null

  if (showRandom) {
    const { data: randomId } = await supabase.rpc('get_random_poem_id', {
      p_author_id: filters.author ?? null,
      p_collection_id: filters.collection ?? null,
      p_tag_id: filters.tag ?? null,
    })
    if (randomId) {
      const { data: p } = await supabase
        .from('poems')
        .select('id, title, content, author_id')
        .eq('id', randomId)
        .single()
      if (p) {
        randomPoem = p
        if (p.author_id) {
          const { data: a } = await supabase
            .from('authors')
            .select('name')
            .eq('id', p.author_id)
            .single()
          randomPoemAuthor = a?.name ?? null
        }
      }
    }
  }

  const hasActiveFilters =
    !!filters.q ||
    !!filters.author ||
    !!filters.collection ||
    !!filters.tag ||
    hasTagFilter
  const totalPoems = !hasActiveFilters ? (poems?.length ?? 0) : null

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Tous les poèmes
        </h1>
      </header>

      <PoemFilters
        q={filters.q}
        author={filters.author}
        collection={filters.collection}
        tag={filters.tag}
        authors={authors ?? []}
        collections={collections ?? []}
        tags={tags ?? []}
        tagRelationships={tagRelationships}
      />

      {showRandom && randomPoem ? (
        <section className="mb-8">
          <Link href={`/poems/${randomPoem.id}`}>
            <PoemCard
              poem={{
                id: randomPoem.id,
                title: randomPoem.title,
                content: randomPoem.content,
                author_name: randomPoemAuthor,
              }}
              variant="full"
            />
          </Link>
        </section>
      ) : showRandom && !randomPoem ? (
        <StateMessage
          title="Aucun poème trouvé"
          description="Aucun poème ne correspond à ces filtres."
        />
      ) : null}

      {!showRandom && (
        <>
          {poems && poems.length > 0 && (
            <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
              {poems.length} poème{poems.length > 1 ? 's' : ''}
              {filters.q ? ` pour « ${filters.q} »` : ''}
            </p>
          )}

          {poems && poems.length > 0 ? (
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
          ) : (
            <StateMessage
              title="Aucun poème"
              description={
                filters.q
                  ? `Aucun poème ne correspond à « ${filters.q} ».`
                  : 'Aucun poème trouvé.'
              }
            />
          )}
        </>
      )}

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
