import Link from 'next/link'
import { createAuthor } from '../actions'

export default async function NewAuthorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        Nouvel auteur
      </h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={createAuthor}
        className="max-w-lg space-y-4 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Nom *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="birth_year"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Année de naissance
            </label>
            <input
              id="birth_year"
              name="birth_year"
              type="number"
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>
          <div>
            <label
              htmlFor="death_year"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Année de décès
            </label>
            <input
              id="death_year"
              name="death_year"
              type="number"
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Biographie
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Créer
          </button>
          <Link
            href="/admin/authors"
            className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
