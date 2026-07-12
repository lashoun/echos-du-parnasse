'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

interface FilterOption {
  id: string
  name: string
}

interface CollectionOption {
  id: string
  title: string
  author_id: string | null
}

interface TagRelationship {
  tagId: string
  authorId: string
  collectionId: string | null
}

interface PoemFiltersProps {
  q?: string
  author?: string
  collection?: string
  tag?: string
  authors: FilterOption[]
  collections: CollectionOption[]
  tags: FilterOption[]
  tagRelationships: TagRelationship[]
}

export default function PoemFilters({
  q,
  author,
  collection,
  tag,
  authors,
  collections,
  tags,
  tagRelationships,
}: PoemFiltersProps) {
  const router = useRouter()

  const [searchValue, setSearchValue] = useState(q ?? '')
  const [authorValue, setAuthorValue] = useState(author ?? '')
  const [collectionValue, setCollectionValue] = useState(collection ?? '')
  const [tagValue, setTagValue] = useState(tag ?? '')

  // Compute available collections based on selected author
  const availableCollections = useMemo(() => {
    if (!authorValue) return collections
    return collections.filter((c) => c.author_id === authorValue)
  }, [authorValue, collections])

  // Compute available authors based on selected collection
  const availableAuthors = useMemo(() => {
    if (!collectionValue) return authors
    const coll = collections.find((c) => c.id === collectionValue)
    if (!coll?.author_id) return authors
    return authors.filter((a) => a.id === coll.author_id)
  }, [collectionValue, authors, collections])

  // Compute available tags based on selected author and/or collection
  const availableTags = useMemo(() => {
    let rels = tagRelationships

    if (authorValue) {
      rels = rels.filter((r) => r.authorId === authorValue)
    }
    if (collectionValue) {
      rels = rels.filter((r) => r.collectionId === collectionValue)
    }

    const validTagIds = new Set(rels.map((r) => r.tagId))
    return tags.filter((t) => validTagIds.has(t.id))
  }, [authorValue, collectionValue, tagRelationships, tags])

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
          onChange={(e) => {
            setAuthorValue(e.target.value)
            if (e.target.value && collectionValue) {
              const coll = collections.find((c) => c.id === collectionValue)
              if (coll && coll.author_id !== e.target.value) {
                setCollectionValue('')
                setTagValue('')
              }
            }
          }}
          className="flex-[3] rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les auteurs</option>
          {availableAuthors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={collectionValue}
          onChange={(e) => {
            const newVal = e.target.value
            setCollectionValue(newVal)
            if (newVal) {
              const coll = collections.find((c) => c.id === newVal)
              if (coll?.author_id) setAuthorValue(coll.author_id)
              setTagValue('')
            }
          }}
          className="flex-[5] rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Toutes les collections</option>
          {availableCollections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          className="flex-[2] rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les tags</option>
          {availableTags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">

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
      {availableTags.length === 0 && tags.length > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500">
          Aucun tag disponible pour la sélection actuelle.
        </p>
      )}
    </div>
  )
}
