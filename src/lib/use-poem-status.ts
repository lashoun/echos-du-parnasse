'use client'

import { useCallback, useEffect, useState } from 'react'

interface PoemStatus {
  isRead: boolean
  isFavorite: boolean
}

const STORAGE_KEY = 'parnasse:poem-status'

function loadAllStatuses(): Record<string, PoemStatus> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAllStatuses(statuses: Record<string, PoemStatus>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function usePoemStatus(poemId: string) {
  const [status, setStatus] = useState<PoemStatus>(() => {
    const all = loadAllStatuses()
    return all[poemId] ?? { isRead: false, isFavorite: false }
  })

  useEffect(() => {
    const all = loadAllStatuses()
    setStatus(all[poemId] ?? { isRead: false, isFavorite: false })
  }, [poemId])

  const toggleRead = useCallback(() => {
    setStatus((prev) => {
      const next = { ...prev, isRead: !prev.isRead }
      const all = loadAllStatuses()
      all[poemId] = next
      saveAllStatuses(all)
      return next
    })
  }, [poemId])

  const toggleFavorite = useCallback(() => {
    setStatus((prev) => {
      const next = { ...prev, isFavorite: !prev.isFavorite }
      const all = loadAllStatuses()
      all[poemId] = next
      saveAllStatuses(all)
      return next
    })
  }, [poemId])

  return { ...status, toggleRead, toggleFavorite }
}

/** Get all stored statuses (for merging on login). */
export function getAllPoemStatuses(): Record<string, PoemStatus> {
  return loadAllStatuses()
}

/** Clear all stored statuses (after successful merge). */
export function clearAllPoemStatuses() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
