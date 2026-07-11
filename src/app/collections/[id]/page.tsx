import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageShell from '@/components/page-shell'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch collection
  const { data: collection } = await supabase
    .from('collections')
    .select('id, title, year, description, author_id')
    .eq('id', id)
    .single()

  if (!collection) notFound()

  // Fetch author
  let authorName: string | null = null
  if (collection.author_id) {
    const { data: a } = await supabase
      .from('authors')
      .select('name')
      .eq('id', collection.author_id)
      .single()
    authorName = a?.name ?? null
  }

  // Fetch poems in the collection, ordered by position
  const { data: poems } = await supabase
    .from('poems')
    .select('id, title, content, position_in_collection')
    .eq('collection_id', id)
    .order('position_in_collection', {
      ascending: true,
      nullsFirst: false,
    })
    .order('title', { ascending: true })

  if (!poems || poems.length === 0) {
    return (
      <PageShell>
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {collection.title}
          </h1>
          {authorName && (
            <p className="mt-1 text-sm text-stone-500">{authorName}</p>
          )}
          {collection.year && (
            <p className="text-sm text-stone-400">{collection.year}</p>
          )}
          {collection.description && (
            <p className="mt-2 text-stone-600 dark:text-stone-300">
              {collection.description}
            </p>
          )}
        </header>
        <StateMessage
          title="Aucun poème"
          description="Cette collection ne contient pas encore de poèmes."
        />
        <nav className="mt-8">
          <Link
            href="/collections"
            className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
          >
            ← Retour aux collections
          </Link>
        </nav>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {collection.title}
        </h1>
        {authorName && (
          <p className="mt-1 text-sm text-stone-500">{authorName}</p>
        )}
        {collection.year && (
          <p className="text-sm text-stone-400">{collection.year}</p>
        )}
        {collection.description && (
          <p className="mt-2 text-stone-600 dark:text-stone-300">
            {collection.description}
          </p>
        )}
        <p className="mt-1 text-sm text-stone-400">
          {poems.length} poème{poems.length > 1 ? 's' : ''}
        </p>
      </header>

      <div className="space-y-4">
        {poems.map((poem, index) => (
          <article
            key={poem.id}
            className="rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-400"
          >
            <Link href={`/poems/${poem.id}`}>
              <h2 className="font-medium text-stone-900">
                {poem.position_in_collection != null
                  ? `${poem.position_in_collection}. `
                  : `${index + 1}. `}
                {poem.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {poem.content.length > 150
                  ? poem.content.slice(0, 150).trimEnd() + '…'
                  : poem.content}
              </p>
            </Link>
          </article>
        ))}
      </div>

      <nav className="mt-8">
        <Link
          href="/collections"
          className="text-sm font-medium text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          ← Retour aux collections
        </Link>
      </nav>
    </PageShell>
  )
}
