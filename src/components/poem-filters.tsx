'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FilterOption {
  id: string
  name: string
}

interface PoemFiltersProps {
  q?: string
  author?: string
  collection?: string
  tag?: string
  authors: FilterOption[]
  collections: { id: string; title: string }[]
  tags: FilterOption[]
}

export default function PoemFilters({
  q,
  author,
  collection,
  tag,
  authors,
  collections,
  tags,
}: PoemFiltersProps) {
  const router = useRouter()

  const [searchValue, setSearchValue] = useState(q ?? '')
  const [authorValue, setAuthorValue] = useState(author ?? '')
  const [collectionValue, setCollectionValue] = useState(collection ?? '')
  const [tagValue, setTagValue] = useState(tag ?? '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (searchValue.trim()) params.set('q', searchValue.trim())
    if (authorValue) params.set('author', authorValue)
    if (collectionValue) params.set('collection', collectionValue)
    if (tagValue) params.set('tag', tagValue)
    const qs = params.toString()
    router.push(qs ? `/poems?${qs}` : '/poems')
  }

  function resetFilters() {
    setSearchValue('')
    setAuthorValue('')
    setCollectionValue('')
    setTagValue('')
    router.push('/poems')
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-2">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Titre ou contenu du poème…"
          className="block flex-1 rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={authorValue}
          onChange={(e) => setAuthorValue(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les auteurs</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={collectionValue}
          onChange={(e) => setCollectionValue(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Toutes les collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            const params = new URLSearchParams()
            if (searchValue.trim()) params.set('q', searchValue.trim())
            if (authorValue) params.set('author', authorValue)
            if (collectionValue) params.set('collection', collectionValue)
            if (tagValue) params.set('tag', tagValue)
            params.set('random', '1')
            router.push(`/poems?${params.toString()}`)
          }}
          className="rounded bg-stone-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          Poème au hasard
        </button>

        <button
          onClick={applyFilters}
          className="rounded bg-stone-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          Filtrer
        </button>

        <button
          onClick={resetFilters}
          className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
