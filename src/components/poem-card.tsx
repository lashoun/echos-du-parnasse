'use client'

import Link from 'next/link'
import { usePoemStatus } from '@/lib/use-poem-status'

interface Poem {
  id: string
  title: string
  content: string
  author_name: string | null
}

interface PoemCardProps {
  poem: Poem
  variant?: 'list' | 'full'
}

function StatusIcons({ poemId }: { poemId: string }) {
  const { isRead, isFavorite, toggleRead, toggleFavorite } =
    usePoemStatus(poemId)

  return (
    <div className="flex items-start gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleRead()
        }}
        className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
          isRead
            ? 'text-green-600 dark:text-green-400'
            : 'text-stone-300 hover:text-stone-400 dark:text-stone-600 dark:hover:text-stone-400'
        }`}
        title={isRead ? 'Marqué comme lu' : 'Marquer comme lu'}
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
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite()
        }}
        className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${
          isFavorite
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-stone-300 hover:text-stone-400 dark:text-stone-600 dark:hover:text-stone-400'
        }`}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
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
      </button>
    </div>
  )
}

export default function PoemCard({ poem, variant = 'list' }: PoemCardProps) {
  if (variant === 'full') {
    return (
      <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500">
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
        <div className="mt-4 leading-relaxed whitespace-pre-wrap text-stone-700 dark:text-stone-300">
          {poem.content}
        </div>
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
          {poem.content.substring(0, 150)}
          {poem.content.length > 150 ? '…' : ''}
        </p>
      </Link>
    </article>
  )
}
