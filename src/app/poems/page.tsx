import Link from 'next/link'
import React from 'react'
import PageShell from '@/components/page-shell'
import PoemCard from '@/components/poem-card'
import PoemFilters from '@/components/poem-filters'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** Pure alternative to Math.random for picking a random array index. */
function randomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

function buildPageUrl(filters: PoemsSearchParams, page: number): string {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.author) params.set('author', filters.author)
  if (filters.collection) params.set('collection', filters.collection)
  if (filters.tag) params.set('tag', filters.tag)
  if (filters.read) params.set('read', filters.read)
  if (filters.favorite) params.set('favorite', filters.favorite)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/poems?${qs}` : '/poems'
}

interface PoemsSearchParams {
  q?: string
  author?: string
  collection?: string
  tag?: string
  random?: string
  read?: string
  favorite?: string
  page?: string
}

export default async function PoemsPage({
  searchParams,
}: {
  searchParams: Promise<PoemsSearchParams>
}) {
  const filters = await searchParams
  const showRandom = filters.random === '1'
  const currentPage = Math.max(1, Number(filters.page) || 1)
  const PAGE_SIZE = 50
  const supabase = await createSupabaseServerClient()

  // Fetch filter options + relationship data
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

  // Build tag → author/collection relationships
  const poemMap = new Map(
    (allPoems ?? []).map(
      (p: {
        id: string
        author_id: string | null
        collection_id: string | null
      }) => [p.id, p],
    ),
  )
  const tagRelationships: {
    tagId: string
    authorId: string | null
    collectionId: string | null
  }[] = (poemTags ?? []).flatMap((pt: { tag_id: string; poem_id: string }) => {
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

  // Get current user for read/favorite filtering
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id ?? null

  // Filter poems by read/favorite status.
  // A poem with no row in user_poem_status is implicitly not-read and not-favorite.
  let statusPoemIds: string[] | null = null
  let excludeStatusIds = false
  const readFilter = filters.read
  const favFilter = filters.favorite

  if (
    (readFilter === '1' ||
      readFilter === '0' ||
      favFilter === '1' ||
      favFilter === '0') &&
    userId
  ) {
    // Strategy: fetch IDs matching each condition separately, then combine.
    // - Positive conditions (read=1, fav=1): include poems matching ALL of these (intersection)
    // - Negative conditions (read=0, fav=0): exclude poems matching ANY of these (union)
    // This correctly handles poems with no status row (they're not in any result set).

    const fetchCondition = async (condition: {
      is_read?: boolean
      is_favorite?: boolean
    }) => {
      let q = supabase
        .from('user_poem_status')
        .select('poem_id')
        .eq('user_id', userId)
      if (condition.is_read !== undefined)
        q = q.eq('is_read', condition.is_read)
      if (condition.is_favorite !== undefined)
        q = q.eq('is_favorite', condition.is_favorite)
      const { data } = await q
      return new Set((data ?? []).map((r) => r.poem_id))
    }

    // Positive conditions: build intersection
    const positivePromises: ReturnType<typeof fetchCondition>[] = []
    if (readFilter === '1')
      positivePromises.push(fetchCondition({ is_read: true }))
    if (favFilter === '1')
      positivePromises.push(fetchCondition({ is_favorite: true }))

    // Negative conditions: build union to exclude
    const negativePromises: ReturnType<typeof fetchCondition>[] = []
    if (readFilter === '0')
      negativePromises.push(fetchCondition({ is_read: true }))
    if (favFilter === '0')
      negativePromises.push(fetchCondition({ is_favorite: true }))

    if (positivePromises.length > 0 && negativePromises.length === 0) {
      // All positive: intersect
      const sets = await Promise.all(positivePromises)
      const result = new Set(sets[0])
      for (let i = 1; i < sets.length; i++) {
        for (const id of result) {
          if (!sets[i].has(id)) result.delete(id)
        }
      }
      statusPoemIds = [...result]
      excludeStatusIds = false
    } else if (positivePromises.length === 0 && negativePromises.length > 0) {
      // All negative: union the positives of what to exclude
      const sets = await Promise.all(negativePromises)
      const excluded = new Set(sets.flatMap((s) => [...s]))
      statusPoemIds = [...excluded]
      excludeStatusIds = true
    } else if (positivePromises.length > 0 && negativePromises.length > 0) {
      // Mixed: intersect positives, subtract the union of negatives
      const [posSets, negSets] = await Promise.all([
        Promise.all(positivePromises),
        Promise.all(negativePromises),
      ])
      const positives = new Set(posSets[0])
      for (let i = 1; i < posSets.length; i++) {
        for (const id of positives) {
          if (!posSets[i].has(id)) positives.delete(id)
        }
      }
      const negatives = new Set(negSets.flatMap((s) => [...s]))
      statusPoemIds = [...positives].filter((id) => !negatives.has(id))
      excludeStatusIds = false
    }
  }

  // Build a count query (same filters, no pagination)
  let countQuery = supabase
    .from('poems')
    .select('*', { count: 'exact', head: true })

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim()
    countQuery = countQuery.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  }
  if (filters.author) {
    const authorList = filters.author.split(',').filter(Boolean)
    if (authorList.length === 1) {
      countQuery = countQuery.eq('author_id', authorList[0])
    } else {
      countQuery = countQuery.in('author_id', authorList)
    }
  }
  if (filters.collection) {
    const collectionList = filters.collection.split(',').filter(Boolean)
    if (collectionList.length === 1) {
      countQuery = countQuery.eq('collection_id', collectionList[0])
    } else {
      countQuery = countQuery.in('collection_id', collectionList)
    }
  }
  if (statusPoemIds !== null) {
    if (excludeStatusIds) {
      countQuery = countQuery.not(
        'id',
        'in',
        `(${statusPoemIds.length > 0 ? statusPoemIds.join(',') : '00000000-0000-0000-0000-000000000000'})`,
      )
    } else {
      countQuery = countQuery.in(
        'id',
        statusPoemIds.length > 0
          ? statusPoemIds
          : ['00000000-0000-0000-0000-000000000000'],
      )
    }
  }
  if (filters.tag) {
    const tagList = filters.tag.split(',').filter(Boolean)
    const { data: poemTags } = await supabase
      .from('poem_tags')
      .select('poem_id')
      .in('tag_id', tagList)

    const ids = [...new Set(poemTags?.map((pt) => pt.poem_id) ?? [])]
    if (ids.length > 0) countQuery = countQuery.in('id', ids)
  }

  const { count: totalCount } = await countQuery
  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)

  // Fetch the current page, with the same filters applied
  let query = supabase.from('poems').select('id, title, content, author_id')

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim()
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  }
  if (filters.author) {
    const authorList = filters.author.split(',').filter(Boolean)
    if (authorList.length === 1) {
      query = query.eq('author_id', authorList[0])
    } else {
      query = query.in('author_id', authorList)
    }
  }
  if (filters.collection) {
    const collectionList = filters.collection.split(',').filter(Boolean)
    if (collectionList.length === 1) {
      query = query.eq('collection_id', collectionList[0])
    } else {
      query = query.in('collection_id', collectionList)
    }
  }
  if (statusPoemIds !== null) {
    if (excludeStatusIds) {
      query = query.not(
        'id',
        'in',
        `(${statusPoemIds.length > 0 ? statusPoemIds.join(',') : '00000000-0000-0000-0000-000000000000'})`,
      )
    } else {
      query = query.in(
        'id',
        statusPoemIds.length > 0
          ? statusPoemIds
          : ['00000000-0000-0000-0000-000000000000'],
      )
    }
  }

  // Handle tag filter — OR logic: poems matching any selected tag
  if (filters.tag) {
    const tagList = filters.tag.split(',').filter(Boolean)
    const { data: poemTags } = await supabase
      .from('poem_tags')
      .select('poem_id')
      .in('tag_id', tagList)

    const ids = [...new Set(poemTags?.map((pt) => pt.poem_id) ?? [])]
    if (ids.length > 0) query = query.in('id', ids)
  }

  const offset = (currentPage - 1) * PAGE_SIZE
  const { data: poems } = await query
    .order('title', { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1)

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

  // Random poem: pick from the already-filtered poems array
  let randomPoem: {
    id: string
    title: string
    content: string
    author_id: string | null
  } | null = null
  let randomPoemAuthor: string | null = null

  if (showRandom && poems && poems.length > 0) {
    const idx = randomIndex(poems.length)
    randomPoem = poems[idx]
    randomPoemAuthor = randomPoem.author_id
      ? (authorMap.get(randomPoem.author_id) ?? null)
      : null
  }

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
        read={filters.read}
        favorite={filters.favorite}
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
              {totalCount ?? 0} poème{(totalCount ?? 0) > 1 ? 's' : ''}
              {filters.q ? ` pour « ${filters.q} »` : ''}
              {' ('}
              {offset + 1}–{offset + poems.length}
              {' affichés)'}
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

      {/* Pagination */}
      {!showRandom && totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-1">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(filters, currentPage - 1)}
              className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              ← Précédente
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
            )
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-stone-400">…</span>
                )}
                {p === currentPage ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-stone-700 text-sm font-medium text-white dark:bg-stone-500">
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildPageUrl(filters, p)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                  >
                    {p}
                  </Link>
                )}
              </React.Fragment>
            ))}
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(filters, currentPage + 1)}
              className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              Suivante →
            </Link>
          )}
        </nav>
      )}

      <nav className="mt-6">
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
