import Link from 'next/link'
import ConfirmDeleteForm from '@/components/confirm-delete-form'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { deleteAuthorAction } from './actions'

export default async function AdminAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const { message, error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: authors } = await supabase
    .from('authors')
    .select('id, name, birth_year, death_year')
    .order('name')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Auteurs
        </h1>
        <Link
          href="/admin/authors/new"
          className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          + Nouvel auteur
        </Link>
      </div>

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

      {!authors || authors.length === 0 ? (
        <p className="text-stone-500">Aucun auteur pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                  Naissance
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                  Décès
                </th>
                <th className="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {authors.map((author) => (
                <tr
                  key={author.id}
                  className="bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800"
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                    <Link
                      href={`/admin/authors/${author.id}/edit`}
                      className="hover:underline"
                    >
                      {author.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {author.birth_year ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {author.death_year ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/authors/${author.id}/edit`}
                        className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                      >
                        Modifier
                      </Link>
                      <ConfirmDeleteForm
                        action={deleteAuthorAction}
                        fieldName="author_id"
                        fieldValue={author.id}
                        confirmMessage={`Supprimer ${author.name} et tous ses poèmes associés ?`}
                      >
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </ConfirmDeleteForm>
                    </div>
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
