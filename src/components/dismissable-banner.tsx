'use client'

import { useState } from 'react'

export default function DismissableBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <p className="relative mb-6 rounded bg-green-50 p-3 pr-10 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
      {message}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
        aria-label="Fermer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </p>
  )
}
