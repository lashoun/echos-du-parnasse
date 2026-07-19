/**
 * Shared utilities for poem text processing.
 * Used by parse-*.js, format-json.js, and related scripts.
 */

// ── French typography ─────────────────────────────────────

/**
 * Apply French non-breaking space rules:
 *   - Narrow NBSP (U+202F) before ! ? ;
 *   - Regular NBSP (U+00A0) before :
 */
function normalizeTypography(text) {
  text = text.replace(/(\S)[ \u00A0\u202F]*([!?;])/g, '$1\u202F$2')
  text = text.replace(/(\S)[ \u00A0\u202F]*(:)/g, '$1\u00A0$2')
  return text
}

// ── Line / verse helpers ──────────────────────────────────

/** Filter NBSP placeholders and deduplicate consecutive blank lines. */
function normalizeLines(lines) {
  return lines
    .filter((l) => l.trim() !== '\u00a0')
    .reduce((acc, l) => {
      const prev = acc[acc.length - 1]
      if (l.trim() === '' && prev === '') return acc
      acc.push(l)
      return acc
    }, [])
}

/**
 * Group flat verse strings into stanzas by a repeating pattern.
 * @param {string[]} verses — flat verse lines
 * @param {number[]} stanzaPattern — e.g. [4,4,3,3], wraps if longer than verses
 * @returns {string} — verses joined with \n within stanza, \n\n between stanzas
 */
function rebuildWithStanzas(verses, stanzaPattern) {
  const result = []
  let idx = 0
  let stanzaIdx = 0
  while (idx < verses.length) {
    const size = stanzaPattern[stanzaIdx % stanzaPattern.length]
    const chunk = verses.slice(idx, idx + size)
    if (chunk.length > 0) {
      result.push(chunk.join('\n'))
    }
    idx += size
    stanzaIdx++
  }
  return result.join('\n\n')
}

/**
 * Return the first non-empty line of poem content, cleaned and truncated.
 * Trailing sentence-ending punctuation (. ! ?) is kept; other trailing
 * punctuation is replaced with …; if there's no trailing punctuation, … is appended.
 */
function firstVerse(content) {
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (t) {
      let result = t.replace(/^[«""''\s]+|[»""''\s]+$/g, '').substring(0, 60).trimEnd()
      const last = result[result.length - 1]
      if (last === '.' || last === '!' || last === '?') {
        // keep as-is
      } else if (/[\.!?,;: ]+$/.test(result)) {
        result = result.replace(/[\.!?,;: ]+$/, '…')
      } else {
        result += '…'
      }
      return result
    }
  }
  return null
}

/** Return the number of non-empty lines (verses) in poem content. */
function countVerses(content) {
  return content.split('\n').filter((l) => l.trim() !== '').length
}

// ── Roman numerals ────────────────────────────────────────

function toRoman(n) {
  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  for (const [val, sym] of map) {
    while (n >= val) {
      result += sym
      n -= val
    }
  }
  return result
}

module.exports = {
  normalizeTypography,
  normalizeLines,
  rebuildWithStanzas,
  firstVerse,
  countVerses,
  toRoman,
}
