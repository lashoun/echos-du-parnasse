import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateCollection } from '../../actions'

export default async function EditCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single()

  if (!collection) notFound()

  const { data: authors } = await supabase
    .from('authors')
    .select('id, name')
    .order('name')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        Modifier : {collection.title}
      </h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={updateCollection.bind(null, id)}
        className="max-w-lg space-y-4 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Titre *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={collection.title}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        <div>
          <label
            htmlFor="author_id"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Auteur
          </label>
          <select
            id="author_id"
            name="author_id"
            defaultValue={collection.author_id ?? ''}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          >
            <option value="">— Aucun —</option>
            {authors?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Année
          </label>
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={collection.year ?? ''}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={collection.description ?? ''}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Enregistrer
          </button>
          <Link
            href="/admin/collections"
            className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
