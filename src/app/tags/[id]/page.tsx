import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageShell from '@/components/page-shell'
import StateMessage from '@/components/state-message'
import PoemCard from '@/components/poem-card'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { poemSortKey } from '@/lib/utils'

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch tag
  const { data: tag } = await supabase
    .from('tags')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!tag) notFound()

  // Fetch poems linked to this tag
  const { data: poemTags } = await supabase
    .from('poem_tags')
    .select('poem_id')
    .eq('tag_id', id)

  const poemIds = poemTags?.map((pt) => pt.poem_id) ?? []

  if (poemIds.length === 0) {
    return (
      <PageShell>
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {tag.name}
          </h1>
        </header>
        <StateMessage
          title="Aucun poème"
          description={`Aucun poème n&apos;est associé au tag « ${tag.name} ».`}
        />
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

  const { data: rawPoems } = await supabase
    .from('poems')
    .select('id, title, content, author_id, collection_id')
    .in('id', poemIds)

  // Fetch author names
  const allAuthorIds = [
    ...new Set(rawPoems?.map((p) => p.author_id).filter(Boolean) as string[]),
  ]
  const { data: authors } = allAuthorIds.length
    ? await supabase.from('authors').select('id, name').in('id', allAuthorIds)
    : { data: [] }

  const authorNames = new Map(authors?.map((a) => [a.id, a.name]) ?? [])

  // Sort by author name, then collection, then Roman-numeral-aware title
  const poems = (rawPoems ?? []).sort((a, b) => {
    const aa = authorNames.get(a.author_id ?? '') ?? ''
    const ab = authorNames.get(b.author_id ?? '') ?? ''
    if (aa < ab) return -1
    if (aa > ab) return 1
    const ca = a.collection_id ?? ''
    const cb = b.collection_id ?? ''
    if (ca < cb) return -1
    if (ca > cb) return 1
    return poemSortKey(a.title).localeCompare(poemSortKey(b.title))
  })

  const authorMap = authorNames

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">{tag.name}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {poems?.length ?? 0} poème{(poems?.length ?? 0) > 1 ? 's' : ''}
        </p>
      </header>

      <div className="space-y-4">
        {poems?.map((poem) => (
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
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          ← Retour à l&apos;accueil
        </Link>
      </nav>
    </PageShell>
  )
}
