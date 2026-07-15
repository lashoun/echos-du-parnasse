'use client'

import { useMemo, useRef, useState } from 'react'

interface Tag {
  id: string
  name: string
}

interface TagInputProps {
  allTags: Tag[]
  selectedTagIds: string[]
  /** Name attribute for hidden inputs (default: 'tag_ids') */
  inputName?: string
  /** Name attribute for new tag names (default: 'new_tag_names') */
  newTagInputName?: string
  /** Allow creating new tags via comma key (default: true) */
  creatable?: boolean
  /** Called when selection changes (for controlled mode without form submission) */
  onChange?: (selectedIds: string[]) => void
  placeholder?: string
}

export default function TagInput({
  allTags,
  selectedTagIds: initialSelected,
  inputName = 'tag_ids',
  newTagInputName = 'new_tag_names',
  creatable = true,
  onChange,
  placeholder,
}: TagInputProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected)
  const [newTagNames, setNewTagNames] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTags = useMemo(
    () => allTags.filter((t) => selectedIds.includes(t.id)),
    [allTags, selectedIds],
  )

  const availableTags = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allTags.filter(
      (t) =>
        !selectedIds.includes(t.id) && (!q || t.name.toLowerCase().includes(q)),
    )
  }, [allTags, selectedIds, query])

  function updateSelection(newIds: string[]) {
    setSelectedIds(newIds)
    if (onChange) onChange(newIds)
  }

  /** Commit the current query as a tag — either existing or new */
  function commitQuery() {
    const q = query.trim()
    if (!q) return

    // Check if it matches an existing tag
    const existing = allTags.find(
      (t) =>
        t.name.toLowerCase() === q.toLowerCase() && !selectedIds.includes(t.id),
    )
    if (existing) {
      updateSelection([...selectedIds, existing.id])
    } else if (creatable && !newTagNames.includes(q)) {
      // New tag — add to pending list
      setNewTagNames((prev) => [...prev, q])
    }
    setQuery('')
    inputRef.current?.focus()
  }

  function addTag(tag: Tag) {
    updateSelection([...selectedIds, tag.id])
    setQuery('')
    inputRef.current?.focus()
  }

  function removeTag(tagId: string) {
    updateSelection(selectedIds.filter((id) => id !== tagId))
  }

  function removeNewTag(name: string) {
    setNewTagNames((prev) => prev.filter((n) => n !== name))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && availableTags.length > 0) {
      e.preventDefault()
      addTag(availableTags[0])
      return
    }
    if (e.key === ',' && creatable) {
      e.preventDefault()
      commitQuery()
      return
    }
    if (e.key === 'Backspace' && !query && selectedIds.length > 0) {
      removeTag(selectedIds[selectedIds.length - 1])
    }
  }

  const showPlaceholder = selectedIds.length === 0 && newTagNames.length === 0

  return (
    <div className="relative">
      {/* Hidden inputs for existing tag IDs */}
      {inputName &&
        selectedIds.map((id) => (
          <input key={id} type="hidden" name={inputName} value={id} />
        ))}
      {/* Hidden inputs for new tag names */}
      {creatable &&
        newTagNames.map((name) => (
          <input key={name} type="hidden" name={newTagInputName} value={name} />
        ))}

      {/* Tag chips + input */}
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded border border-stone-300 px-3 py-2 text-sm focus-within:border-stone-500 focus-within:outline-none dark:border-stone-600 dark:bg-stone-700"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-800 dark:bg-stone-600 dark:text-stone-200"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded hover:bg-stone-300 dark:hover:bg-stone-500"
              aria-label={`Retirer ${tag.name}`}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
              </svg>
            </button>
          </span>
        ))}
        {creatable &&
          newTagNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded border border-dashed border-amber-400 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-300"
            >
              {name}
              <button
                type="button"
                onClick={() => removeNewTag(name)}
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded hover:bg-amber-100 dark:hover:bg-amber-900"
                aria-label={`Retirer ${name}`}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                </svg>
              </button>
            </span>
          ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={
            showPlaceholder ? (placeholder ?? 'Chercher des tags…') : ''
          }
          className="min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm text-stone-900 placeholder-stone-400 focus:ring-0 focus:outline-none dark:text-stone-100 dark:placeholder-stone-500"
        />
      </div>

      {/* Autocomplete dropdown — show all available on focus, filter by text when typed */}
      {focused && availableTags.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-stone-200 bg-white shadow-lg dark:border-stone-600 dark:bg-stone-800">
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                addTag(tag)
              }}
              className="flex w-full items-center px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* No results hint — only when typed and nothing matches */}
      {focused && query.trim() && availableTags.length === 0 && creatable && (
        <p className="mt-1 text-xs text-stone-500">
          Appuyez sur{' '}
          <kbd className="rounded border border-stone-300 px-1 font-mono text-xs dark:border-stone-600">
            ,
          </kbd>{' '}
          pour créer &quot;{query.trim()}&quot;
        </p>
      )}
      {focused && query.trim() && availableTags.length === 0 && !creatable && (
        <p className="mt-1 text-xs text-stone-500">Aucun tag trouvé.</p>
      )}
    </div>
  )
}
