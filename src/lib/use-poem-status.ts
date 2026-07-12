'use client'

import { useCallback, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export interface PoemStatus {
  isRead: boolean
  isFavorite: boolean
}

const STORAGE_KEY = 'parnasse:poem-status'

// Shared browser client — one instance, internal session cache.
const supabase = createSupabaseBrowserClient()

// ── localStorage helpers ─────────────────────────────────────

function loadLocalAll(): Record<string, PoemStatus> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalAll(statuses: Record<string, PoemStatus>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  } catch {
    // localStorage may be full or unavailable
  }
}

// ── Hook ─────────────────────────────────────────────────────
// When logged in → read/write Supabase only.
// When logged out → read/write localStorage only.
// Completely disjoint — no cross-over, no fallback.

export function usePoemStatus(poemId: string) {
  const [status, setStatus] = useState<PoemStatus>({
    isRead: false,
    isFavorite: false,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id

      if (userId) {
        const { data: remote } = await supabase
          .from('user_poem_status')
          .select('is_read, is_favorite')
          .eq('user_id', userId)
          .eq('poem_id', poemId)
          .maybeSingle()

        if (!cancelled) {
          setStatus({
            isRead: remote?.is_read ?? false,
            isFavorite: remote?.is_favorite ?? false,
          })
          setLoaded(true)
        }
      } else {
        if (!cancelled) {
          const local = loadLocalAll()
          setStatus(local[poemId] ?? { isRead: false, isFavorite: false })
          setLoaded(true)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [poemId])

  const persist = useCallback(
    (next: PoemStatus) => {
      supabase.auth.getUser().then(({ data: auth }) => {
        if (auth.user) {
          supabase
            .from('user_poem_status')
            .upsert(
              {
                user_id: auth.user.id,
                poem_id: poemId,
                is_read: next.isRead,
                is_favorite: next.isFavorite,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id, poem_id' },
            )
            .then(() => {}, () => {})
        } else {
          const all = loadLocalAll()
          all[poemId] = next
          saveLocalAll(all)
        }
      })
    },
    [poemId],
  )

  const toggleRead = useCallback(() => {
    setStatus((prev) => {
      const next = { ...prev, isRead: !prev.isRead }
      persist(next)
      return next
    })
  }, [persist])

  const toggleFavorite = useCallback(() => {
    setStatus((prev) => {
      const next = { ...prev, isFavorite: !prev.isFavorite }
      persist(next)
      return next
    })
  }, [persist])

  if (!loaded) {
    return { isRead: false, isFavorite: false, toggleRead, toggleFavorite }
  }

  return { ...status, toggleRead, toggleFavorite }
}
