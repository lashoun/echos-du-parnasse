import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updatePoem } from '../../actions'

export default async function EditPoemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const [
    { data: poem },
    { data: authors },
    { data: collections },
    { data: tags },
    { data: currentTagIds },
  ] = await Promise.all([
    supabase.from('poems').select('*').eq('id', id).single(),
    supabase.from('authors').select('id, name').order('name'),
    supabase.from('collections').select('id, title').order('title'),
    supabase.from('tags').select('id, name').order('name'),
    supabase.from('poem_tags').select('tag_id').eq('poem_id', id),
  ])

  if (!poem) notFound()

  const selectedTagIds = new Set(currentTagIds?.map((pt) => pt.tag_id) ?? [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        Modifier : {poem.title}
      </h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={updatePoem.bind(null, id)}
        className="max-w-2xl space-y-4 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
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
            defaultValue={poem.title}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Contenu *
          </label>
          <textarea
            id="content"
            name="content"
            rows={15}
            required
            defaultValue={poem.content}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
          <p className="mt-1 text-xs text-stone-500">
            Le texte du poème. Les sauts de ligne et les espaces sont conservés.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              defaultValue={poem.author_id ?? ''}
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
              htmlFor="collection_id"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Collection
            </label>
            <select
              id="collection_id"
              name="collection_id"
              defaultValue={poem.collection_id ?? ''}
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            >
              <option value="">— Aucune —</option>
              {collections?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="position_in_collection"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Position dans la collection
            </label>
            <input
              id="position_in_collection"
              name="position_in_collection"
              type="number"
              defaultValue={poem.position_in_collection ?? ''}
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Langue
            </label>
            <select
              id="language"
              name="language"
              defaultValue={poem.language}
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="la">Latin</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Tags
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {tags?.length === 0 && (
              <p className="text-sm text-stone-500">
                Aucun tag. Créez-en d&apos;abord dans la section Tags.
              </p>
            )}
            {tags?.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-1.5 rounded border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50 dark:border-stone-600 dark:hover:bg-stone-700"
              >
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={selectedTagIds.has(tag.id)}
                  className="h-3.5 w-3.5"
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Enregistrer
          </button>
          <Link
            href="/admin/poems"
            className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
