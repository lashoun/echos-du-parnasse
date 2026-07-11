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
        {isRead ? '✓ Lu' : 'Marquer comme lu'}
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
        {isFavorite ? '♥ Favori' : '♡ Ajouter aux favoris'}
      </button>
    </div>
  )
}
