'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTheme } from 'next-themes'

export type PoemFont = 'sans' | 'serif' | 'slab' | 'crimson'

export interface DisplayPreferences {
  poemFont: PoemFont
}

const STORAGE_KEY = 'parnasse:preferences'

interface PoemFontContextValue {
  poemFont: PoemFont
  setPoemFont: (font: PoemFont) => void
}

const PoemFontContext = createContext<PoemFontContextValue | null>(null)

export function PoemFontProvider({ children }: { children: React.ReactNode }) {
  const [poemFont, setPoemFontState] = useState<PoemFont>(() => {
    // Lazy init from localStorage — runs once, avoids effect for hydration
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.poemFont) return parsed.poemFont
      }
    } catch {
      // ignore
    }
    return 'sans'
  })

  // Apply CSS variables to <html> — Tailwind calc() in globals.css resolves them
  useEffect(() => {
    const fontMap: Record<string, string> = {
      sans: 'var(--font-geist-sans)',
      serif: 'var(--font-literata)',
      slab: 'var(--font-zilla-slab)',
      crimson: 'var(--font-crimson-pro)',
    }
    const scaleMap: Record<string, string> = {
      sans: '1',
      crimson: '1.1',
      serif: '0.95',
      slab: '1.05',
    }
    const leadingMap: Record<string, string> = {
      sans: '1',
      crimson: '0.85',
      serif: '0.995',
      slab: '0.925',
    }
    const root = document.documentElement
    root.style.setProperty('--font-poem', fontMap[poemFont] ?? fontMap.sans)
    root.style.setProperty('--font-poem-scale', scaleMap[poemFont] ?? '1')
    root.style.setProperty('--font-poem-leading', leadingMap[poemFont] ?? '1')
  }, [poemFont])

  const setPoemFont = useCallback((font: PoemFont) => {
    setPoemFontState(font)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ poemFont: font }))
    } catch {
      // ignore
    }
  }, [])

  return (
    <PoemFontContext.Provider value={{ poemFont, setPoemFont }}>
      {children}
    </PoemFontContext.Provider>
  )
}

export function useDisplayPreferences() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const ctx = useContext(PoemFontContext)

  if (!ctx) {
    return {
      theme: theme ?? 'system',
      setTheme,
      resolvedTheme,
      poemFont: 'sans' as PoemFont,
      setPoemFont: () => {},
    }
  }

  return {
    theme: theme ?? 'system',
    setTheme,
    resolvedTheme,
    poemFont: ctx.poemFont,
    setPoemFont: ctx.setPoemFont,
  }
}
