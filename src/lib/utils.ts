/**
 * Truncate a string to `maxLength` characters, appending "…" if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Map Roman numeral characters to their values. */
const ROMAN_MAP: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

/**
 * Convert a Roman numeral string (e.g. "CLVII") to an integer.
 * Returns NaN if the input is not a valid Roman numeral.
 */
export function romanToInt(s: string): number {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const cur = ROMAN_MAP[s[i]]
    if (!cur) return NaN
    const next = ROMAN_MAP[s[i + 1]]
    if (next && next > cur) {
      total += next - cur
      i++
    } else {
      total += cur
    }
  }
  return total
}

/**
 * Return a sort key for a poem title: Roman-numeral-prefixed titles
 * (e.g. "I. (text)", "CLVII. — text") get a zero-padded numeric key,
 * other titles use the original string.
 */
export function poemSortKey(title: string): string {
  const match = title.match(/^([IVXLCDM]+)\.\s/)
  if (match) {
    const num = romanToInt(match[1])
    if (!Number.isNaN(num)) {
      return String(num).padStart(6, '0')
    }
  }
  return title
}

/**
 * Sort poems array in-place by Roman-numeral-aware title order.
 */
export function sortPoems<T extends { title: string }>(poems: T[]): T[] {
  return poems.sort((a, b) => {
    const ka = poemSortKey(a.title)
    const kb = poemSortKey(b.title)
    if (ka < kb) return -1
    if (ka > kb) return 1
    return 0
  })
}
