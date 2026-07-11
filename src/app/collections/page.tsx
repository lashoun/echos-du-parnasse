import Link from 'next/link'
import PageShell from '@/components/page-shell'
import StateMessage from '@/components/state-message'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function CollectionsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, year, description, author_id')
    .order('title', { ascending: true })

  // Fetch author names
  const authorIds = [
    ...new Set(
      collections?.map((c) => c.author_id).filter(Boolean) as string[],
    ),
  ]
  const { data: authors } = authorIds.length
    ? await supabase.from('authors').select('id, name').in('id', authorIds)
    : { data: [] }

  const authorMap = new Map(authors?.map((a) => [a.id, a.name]) ?? [])

  if (!collections || collections.length === 0) {
    return (
      <PageShell>
        <StateMessage
          title="Aucune collection"
          description="Il n'y a pas encore de collections."
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Collections
        </h1>
      </header>

      <div className="space-y-4">
        {collections.map((c) => (
          <Link key={c.id} href={`/collections/${c.id}`}>
            <article className="rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500">
              <h2 className="font-medium text-stone-900 dark:text-stone-100">
                {c.title}
              </h2>
              {c.year && (
                <p className="mt-0.5 text-sm text-stone-400 dark:text-stone-500">
                  {c.year}
                </p>
              )}
              {c.author_id && authorMap.has(c.author_id) && (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {authorMap.get(c.author_id)}
                </p>
              )}
              {c.description && (
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {c.description}
                </p>
              )}
            </article>
          </Link>
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
