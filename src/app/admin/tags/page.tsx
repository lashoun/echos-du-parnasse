import Link from 'next/link'
import ConfirmDeleteForm from '@/components/confirm-delete-form'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createTag, deleteTagAction } from './actions'

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const { message, error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        Tags
      </h1>

      {message && (
        <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Create tag */}
      <form action={createTag} className="mb-6 flex max-w-md gap-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Nom du tag"
          className="block flex-1 rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
        />
        <button
          type="submit"
          className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Créer
        </button>
      </form>

      {!tags || tags.length === 0 ? (
        <p className="text-stone-500">Aucun tag pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                  Nom
                </th>
                <th className="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800"
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                    {tag.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmDeleteForm
                      action={deleteTagAction}
                      fieldName="tag_id"
                      fieldValue={tag.id}
                      confirmMessage={`Supprimer le tag « ${tag.name} » ?`}
                    >
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </ConfirmDeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/admin"
          className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
