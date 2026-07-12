'use client'

import { usePoemStatus } from '@/lib/use-poem-status'

interface PoemStatusToggleProps {
  poemId: string
}

export default function PoemStatusToggle({ poemId }: PoemStatusToggleProps) {
  const { isRead, isFavorite, toggleRead, toggleFavorite } =
    usePoemStatus(poemId)

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggleRead}
        className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors ${
          isRead
            ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-300'
            : 'border-stone-300 text-stone-500 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          {isRead ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <circle cx="12" cy="12" r="10" />
          )}
        </svg>
        {isRead ? 'Lu' : 'Marquer comme lu'}
      </button>
      <button
        type="button"
        onClick={toggleFavorite}
        className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors ${
          isFavorite
            ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-300'
            : 'border-stone-300 text-stone-500 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
      </button>
    </div>
  )
}
