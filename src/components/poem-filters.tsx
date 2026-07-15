'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TagInput from './tag-input'

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
  authorId: string | null
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

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
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
  const debouncedSearch = useDebounce(searchValue, 300)

  // Whether this is the first render (to avoid double-navigation on init)
  const isFirstRender = useRef(true)

  const [authorIds, setAuthorIds] = useState<string[]>(
    author ? author.split(',') : [],
  )
  const [collectionIds, setCollectionIds] = useState<string[]>(
    collection ? collection.split(',') : [],
  )
  const [tagIds, setTagIds] = useState<string[]>(tag ? tag.split(',') : [])
  const [readValue, setReadValue] = useState<'1' | '0' | null>(
    read === '1' ? '1' : read === '0' ? '0' : null,
  )
  const [favValue, setFavValue] = useState<'1' | '0' | null>(
    favorite === '1' ? '1' : favorite === '0' ? '0' : null,
  )

  const navigate = useCallback(
    (overrides?: {
      authorIds?: string[]
      collectionIds?: string[]
      tagIds?: string[]
      readValue?: '1' | '0' | null
      favValue?: '1' | '0' | null
      searchValue?: string
    }) => {
      const a = overrides?.authorIds ?? authorIds
      const c = overrides?.collectionIds ?? collectionIds
      const t = overrides?.tagIds ?? tagIds
      const r = overrides?.readValue ?? readValue
      const f = overrides?.favValue ?? favValue
      const sq = overrides?.searchValue ?? debouncedSearch

      const params = new URLSearchParams()
      if (sq.trim()) params.set('q', sq.trim())
      if (a.length > 0) params.set('author', a.join(','))
      if (c.length > 0) params.set('collection', c.join(','))
      if (t.length > 0) params.set('tag', t.join(','))
      if (r) params.set('read', r)
      if (f) params.set('favorite', f)
      const qs = params.toString()
      router.push(qs ? `/poems?${qs}` : '/poems')
    },
    [
      authorIds,
      collectionIds,
      tagIds,
      readValue,
      favValue,
      debouncedSearch,
      router,
    ],
  )

  // Keep navigateRef in sync with the latest navigate function
  const navigateRef = useRef(navigate)
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  // Navigate when debounced search changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    navigateRef.current({ searchValue: debouncedSearch })
  }, [debouncedSearch])

  const navigateAuthor = useCallback(
    (ids: string[]) => {
      setAuthorIds(ids)
      navigate({ authorIds: ids })
    },
    [navigate],
  )

  const navigateCollection = useCallback(
    (ids: string[]) => {
      setCollectionIds(ids)
      navigate({ collectionIds: ids })
    },
    [navigate],
  )

  const navigateTag = useCallback(
    (ids: string[]) => {
      setTagIds(ids)
      navigate({ tagIds: ids })
    },
    [navigate],
  )

  const cycleRead = useCallback(() => {
    const next = readValue === null ? '1' : readValue === '1' ? '0' : null
    setReadValue(next)
    navigate({ readValue: next })
  }, [readValue, navigate])

  const cycleFav = useCallback(() => {
    const next = favValue === null ? '1' : favValue === '1' ? '0' : null
    setFavValue(next)
    navigate({ favValue: next })
  }, [favValue, navigate])

  // Collections filter: show all collections from any selected author
  const availableCollections = useMemo(() => {
    if (authorIds.length === 0) return collections
    const selectedAuthorSet = new Set(authorIds)
    return collections.filter(
      (c) => c.author_id && selectedAuthorSet.has(c.author_id),
    )
  }, [authorIds, collections])

  // Authors filter: when collections are selected, only show authors of those collections
  const availableAuthors = useMemo(() => {
    if (collectionIds.length === 0) return authors
    const colls = collections.filter((c) => collectionIds.includes(c.id))
    const relevantAuthorIds = new Set(
      colls.map((c) => c.author_id).filter(Boolean) as string[],
    )
    return authors.filter((a) => relevantAuthorIds.has(a.id))
  }, [collectionIds, authors, collections])

  const availableTags = useMemo(() => {
    let rels = tagRelationships
    if (authorIds.length > 0)
      rels = rels.filter((r) => r.authorId && authorIds.includes(r.authorId))
    if (collectionIds.length > 0)
      rels = rels.filter(
        (r) => r.collectionId && collectionIds.includes(r.collectionId),
      )
    const validTagIds = new Set(rels.map((r) => r.tagId))
    return tags.filter((t) => validTagIds.has(t.id))
  }, [authorIds, collectionIds, tagRelationships, tags])

  function resetFilters() {
    window.location.href = '/poems'
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-2">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Titre ou contenu du poème…"
          className="block flex-1 rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
        />
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-[160px] flex-1 basis-[180px]">
          <TagInput
            allTags={availableAuthors.map((a) => ({ id: a.id, name: a.name }))}
            selectedTagIds={authorIds}
            creatable={false}
            placeholder="Auteurs…"
            onChange={navigateAuthor}
          />
        </div>
        <div className="min-w-[180px] flex-[2] basis-[200px]">
          <TagInput
            allTags={availableCollections.map((c) => ({
              id: c.id,
              name: c.title,
            }))}
            selectedTagIds={collectionIds}
            creatable={false}
            placeholder="Collections…"
            onChange={navigateCollection}
            inputName=""
          />
        </div>
        <div className="min-w-[160px] flex-1 basis-[180px]">
          <TagInput
            allTags={availableTags}
            selectedTagIds={tagIds}
            creatable={false}
            placeholder="Tags…"
            onChange={navigateTag}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search)
            params.set('random', '1')
            router.push(`/poems?${params.toString()}`)
          }}
          className="rounded bg-stone-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          Poème au hasard
        </button>

        <button
          onClick={cycleRead}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors ${
            readValue === '1'
              ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-300'
              : readValue === '0'
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300'
                : 'border-stone-300 text-stone-500 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            {readValue === '1' ? (
              <path d="M20 6 9 17l-5-5" />
            ) : (
              <circle cx="12" cy="12" r="10" />
            )}
          </svg>
          {readValue === '0' ? 'Non lus' : 'Lus'}
        </button>

        <button
          onClick={cycleFav}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors ${
            favValue === '1'
              ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-300'
              : favValue === '0'
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300'
                : 'border-stone-300 text-stone-500 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={favValue === '1' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          {favValue === '0' ? 'Non favoris' : 'Favoris'}
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
