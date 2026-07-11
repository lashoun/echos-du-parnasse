import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageShell from '@/components/page-shell'
import StateMessage from '@/components/state-message'
import PoemCard from '@/components/poem-card'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch author
  const { data: author } = await supabase
    .from('authors')
    .select('id, name, birth_year, death_year, bio')
    .eq('id', id)
    .single()

  if (!author) notFound()

  // Fetch poems by this author
  const { data: poems } = await supabase
    .from('poems')
    .select('id, title, content')
    .eq('author_id', id)
    .order('title', { ascending: true })

  // Fetch collections by this author
  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, year')
    .eq('author_id', id)
    .order('title', { ascending: true })

  const lifespan =
    author.birth_year || author.death_year
      ? `${author.birth_year ?? '?'}–${author.death_year ?? '?'}`
      : null

  return (
    <PageShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {author.name}
        </h1>
        {lifespan && (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {lifespan}
          </p>
        )}
        {author.bio && (
          <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">
            {author.bio}
          </p>
        )}
      </header>

      {/* Collections */}
      {collections && collections.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-200">
            Collections
          </h2>
          <div className="space-y-2">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`}>
                <article className="rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500">
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {c.title}
                  </span>
                  {c.year && (
                    <span className="ml-2 text-sm text-stone-400 dark:text-stone-500">
                      {c.year}
                    </span>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Poems */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-800">
          Poèmes
          {poems && (
            <span className="ml-1 font-normal text-stone-400 dark:text-stone-500">
              ({poems.length})
            </span>
          )}
        </h2>
        {poems && poems.length > 0 ? (
          <div className="space-y-4">
            {poems.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={{
                  id: poem.id,
                  title: poem.title,
                  content: poem.content,
                  author_name: author.name,
                }}
              />
            ))}
          </div>
        ) : (
          <StateMessage
            title="Aucun poème"
            description={`Aucun poème de ${author.name} dans la bibliothèque.`}
          />
        )}
      </section>

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
