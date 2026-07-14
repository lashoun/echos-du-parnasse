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
  read?: string
  favorite?: string
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
  read,
  favorite,
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
  const [readValue, setReadValue] = useState<'1' | '0' | null>(read === '1' ? '1' : read === '0' ? '0' : null)
  const [favValue, setFavValue] = useState<'1' | '0' | null>(favorite === '1' ? '1' : favorite === '0' ? '0' : null)

  const availableCollections = useMemo(() => {
    if (!authorValue) return collections
    return collections.filter((c) => c.author_id === authorValue)
  }, [authorValue, collections])

  const availableAuthors = useMemo(() => {
    if (!collectionValue) return authors
    const coll = collections.find((c) => c.id === collectionValue)
    if (!coll?.author_id) return authors
    return authors.filter((a) => a.id === coll.author_id)
  }, [collectionValue, authors, collections])

  const availableTags = useMemo(() => {
    let rels = tagRelationships
    if (authorValue) rels = rels.filter((r) => r.authorId === authorValue)
    if (collectionValue) rels = rels.filter((r) => r.collectionId === collectionValue)
    const validTagIds = new Set(rels.map((r) => r.tagId))
    return tags.filter((t) => validTagIds.has(t.id))
  }, [authorValue, collectionValue, tagRelationships, tags])

  function buildParams(extra: Record<string, string> = {}): URLSearchParams {
    const params = new URLSearchParams()
    if (searchValue.trim()) params.set('q', searchValue.trim())
    if (authorValue) params.set('author', authorValue)
    if (collectionValue) params.set('collection', collectionValue)
    if (tagValue) params.set('tag', tagValue)
    if (readValue) params.set('read', readValue)
    if (favValue) params.set('favorite', favValue)
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v)
    }
    return params
  }

  function applyFilters() {
    const params = buildParams()
    const qs = params.toString()
    router.push(qs ? `/poems?${qs}` : '/poems')
  }

  function resetFilters() {
    setSearchValue('')
    setAuthorValue('')
    setCollectionValue('')
    setTagValue('')
    setReadValue(null)
    setFavValue(null)
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
            <option key={a.id} value={a.id}>{a.name}</option>
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
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <select
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          className="flex-[2] rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          <option value="">Tous les tags</option>
          {availableTags.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            const p = buildParams({ random: '1' })
            router.push(`/poems?${p.toString()}`)
          }}
          className="rounded bg-stone-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          Poème au hasard
        </button>

        <button
          onClick={() => setReadValue((v) => (v === null ? '1' : v === '1' ? '0' : null))}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors ${
            readValue === '1'
              ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-300'
              : readValue === '0'
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300'
                : 'border-stone-300 text-stone-500 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            {readValue === '1' ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="10" />}
          </svg>
          {readValue === '0' ? 'Non lus' : 'Lus'}
        </button>

        <button
          onClick={() => setFavValue((v) => (v === null ? '1' : v === '1' ? '0' : null))}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors ${
            favValue === '1'
              ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-300'
              : favValue === '0'
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300'
                : 'border-stone-300 text-stone-500 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
          }`}
        >
          <svg viewBox="0 0 24 24" fill={favValue === '1' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          {favValue === '0' ? 'Non favoris' : 'Favoris'}
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
