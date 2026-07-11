'use client'

import Link from 'next/link'
import { usePoemStatus } from '@/lib/use-poem-status'
import { truncate } from '@/lib/utils'

interface Poem {
  id: string
  title: string
  content: string
  author_name: string | null
}

interface PoemCardProps {
  poem: Poem
  variant?: 'featured' | 'list'
}

function StatusIcons({ poemId }: { poemId: string }) {
  const { isRead, isFavorite, toggleRead, toggleFavorite } =
    usePoemStatus(poemId)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleRead()
        }}
        className={`text-sm transition-colors ${
          isRead
            ? 'text-green-600 dark:text-green-400'
            : 'text-stone-300 hover:text-stone-400 dark:text-stone-600 dark:hover:text-stone-500'
        }`}
        title={isRead ? 'Marqué comme lu' : 'Marquer comme lu'}
      >
        {isRead ? '✓ Lu' : '○'}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite()
        }}
        className={`text-sm transition-colors ${
          isFavorite
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-stone-300 hover:text-stone-400 dark:text-stone-600 dark:hover:text-stone-500'
        }`}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {isFavorite ? '♥' : '♡'}
      </button>
    </div>
  )
}

export default function PoemCard({ poem, variant = 'list' }: PoemCardProps) {
  if (variant === 'featured') {
    return (
      <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              {poem.title}
            </h2>
            {poem.author_name && (
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {poem.author_name}
              </p>
            )}
          </div>
          <StatusIcons poemId={poem.id} />
        </div>
        <p className="mt-4 leading-relaxed whitespace-pre-line text-stone-700 dark:text-stone-300">
          {truncate(poem.content, 400)}
        </p>
        <Link
          href={`/poems/${poem.id}`}
          className="mt-4 inline-block text-sm font-medium text-stone-500 underline underline-offset-2 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
        >
          Lire le poème →
        </Link>
      </article>
    )
  }

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500">
      <Link href={`/poems/${poem.id}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-medium text-stone-900 dark:text-stone-100">
              {poem.title}
            </h2>
            {poem.author_name && (
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                {poem.author_name}
              </p>
            )}
          </div>
          <StatusIcons poemId={poem.id} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {truncate(poem.content, 150)}
        </p>
      </Link>
    </article>
  )
}
