'use client'

import { useSyncExternalStore } from 'react'
import { useDisplayPreferences } from '@/lib/use-preferences'

const FONT_LABELS: Record<string, string> = {
  sans: 'Geist (Sans)',
  serif: 'Literata (Sérif)',
  slab: 'Zilla Slab (Empattement)',
  crimson: 'Crimson Pro (Sérif)',
}

export default function DisplayPreferencesForm() {
  const { theme, setTheme, poemFont, setPoemFont } = useDisplayPreferences()

  // Hydration guard: useSyncExternalStore returns false on server, true on client
  // without needing setState in an effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <section className="border-t border-stone-200 pt-6 dark:border-stone-700">
        <h2 className="font-semibold text-stone-800 dark:text-stone-200">
          Préférences d&apos;affichage
        </h2>
        <div className="mt-4 h-20" />
      </section>
    )
  }

  return (
    <section className="border-t border-stone-200 pt-6 dark:border-stone-700">
      <h2 className="font-semibold text-stone-800 dark:text-stone-200">
        Préférences d&apos;affichage
      </h2>
      <div className="mt-4 space-y-4">
        {/* Theme selector */}
        <div>
          <p className="mb-2 text-sm text-stone-600 dark:text-stone-400">
            Thème
          </p>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                  theme === t
                    ? 'border-stone-500 bg-stone-200 text-stone-900 dark:border-stone-400 dark:bg-stone-600 dark:text-stone-100'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
                }`}
              >
                {t === 'light' && '☀️ Clair'}
                {t === 'dark' && '🌙 Sombre'}
                {t === 'system' && '💻 Système'}
              </button>
            ))}
          </div>
        </div>

        {/* Font selector */}
        <div>
          <p className="mb-2 text-sm text-stone-600 dark:text-stone-400">
            Police des poèmes
          </p>
          <div className="flex flex-wrap gap-2">
            {(['sans', 'crimson', 'serif', 'slab'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPoemFont(f)}
                className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                  poemFont === f
                    ? 'border-stone-500 bg-stone-200 text-stone-900 dark:border-stone-400 dark:bg-stone-600 dark:text-stone-100'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400 dark:border-stone-600 dark:text-stone-400 dark:hover:border-stone-500'
                }`}
                style={{
                  fontFamily: `var(--font-${
                    f === 'sans'
                      ? 'geist-sans'
                      : f === 'serif'
                        ? 'literata'
                        : f === 'slab'
                          ? 'zilla-slab'
                          : 'crimson-pro'
                  })`,
                }}
              >
                {FONT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
