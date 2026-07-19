#!/usr/bin/env node
/**
 * Format a ScraperPoem JSON file:
 *   - French typography normalization (non-breaking spaces before punctuation)
 *   - Auto-tagging sonnets (exactly 14 non-empty verses → tag "sonnet")
 *   - Title disambiguation:
 *       a) If title is an Arabic numeral → convert to Roman numeral + append first verse
 *       b) If any title is duplicated → append first verse to ALL duplicates
 *
 * Usage: node scripts/format-json.js <path-to-json>
 *   node scripts/format-json.js data/json/du-bellay.json
 *
 * The file is edited in-place. Idempotent — safe to run multiple times.
 */

const fs = require('fs')

// ── Roman numeral converter ───────────────────────────────

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

// ── French typography ─────────────────────────────────────

function normalizeTypography(text) {
  text = text.replace(/(\S)[ \u00A0\u202F]*([!?;])/g, '$1\u202F$2')
  text = text.replace(/(\S)[ \u00A0\u202F]*(:)/g, '$1\u00A0$2')
  return text
}

/** Return the first verse (first non-empty line) of a poem. */
function firstVerse(content) {
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (t) {
      let result = t.replace(/^[«""''\s]+|[»""''\s]+$/g, '').substring(0, 60).trimEnd()
      // If it ends with a non-sentence-ending punctuation, replace it with …
      const last = result[result.length - 1]
      if (last === '.' || last === '!' || last === '?') {
        // Keep sentence-ending punctuation as-is
      } else if (/[\.!?,;: ]+$/.test(result)) {
        result = result.replace(/[\.!?,;: ]+$/, '…')
      } else {
        // No punctuation at all – append ellipsis
        result += '…'
      }
      return result
    }
  }
  return null
}

/** Return the number of non-empty lines (verses) in a poem's content. */
function countVerses(content) {
  return content.split('\n').filter((l) => l.trim() !== '').length
}

/** Check if a title looks like a plain Arabic or Roman number (e.g. "1", "I.", "XV.") */
const NUMBER_RE = /^(\d+)\.?$/
const ROMAN_RE = /^([IVXL]+)\.?$/

// ── Main ──────────────────────────────────────────────────

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node scripts/format-json.js <path-to-json>')
  process.exit(1)
}

const raw = fs.readFileSync(filePath, 'utf-8')
const data = JSON.parse(raw)

if (!Array.isArray(data.poems)) {
  console.error('JSON does not have a "poems" array')
  process.exit(1)
}

// Phase 1: typography normalization + sonnet tagging
let changed = false
let tagged = 0
let sonnetCount = 0
let nonSonnetCount = 0

for (const poem of data.poems) {
  if (!poem.content) continue

  const normalized = normalizeTypography(poem.content)
  if (normalized !== poem.content) {
    poem.content = normalized
    changed = true
  }

  const verses = countVerses(poem.content)
  if (verses === 14) sonnetCount++
  else nonSonnetCount++
  if (verses === 14) {
    if (!poem.tags?.includes('sonnet')) {
      poem.tags = [...(poem.tags ?? []), 'sonnet']
      tagged++
      changed = true
    }
  } else {
    if (!poem.tags?.includes('non-sonnet')) {
      poem.tags = [...(poem.tags ?? []), 'non-sonnet']
      changed = true
    }
  }

  if (Array.isArray(poem.tags) && poem.tags.length === 0) {
    delete poem.tags
  }
}

// Phase 2: title disambiguation
// Build a map of title → indices
const titleIndex = new Map()
for (let i = 0; i < data.poems.length; i++) {
  const t = data.poems[i].title
  if (!titleIndex.has(t)) titleIndex.set(t, [])
  titleIndex.get(t).push(i)
}

for (const [title, indices] of titleIndex) {
  if (indices.length === 0) continue

  const isNumbered = NUMBER_RE.test(title) || ROMAN_RE.test(title)
  const needsDisambig = isNumbered || indices.length > 1

  if (!needsDisambig) continue

  for (const idx of indices) {
    const poem = data.poems[idx]
    const fv = firstVerse(poem.content)
    if (!fv) continue

    if (isNumbered) {
      let prefix
      const arabic = title.match(NUMBER_RE)
      if (arabic) {
        prefix = toRoman(parseInt(arabic[1], 10))
      } else {
        const roman = title.match(ROMAN_RE)
        prefix = roman ? roman[1] : ''
      }
      poem.title = `${prefix}. (${fv})`
    } else {
      // Duplicate title — append first verse in parentheses
      poem.title = `${title} (${fv})`
    }
    changed = true
  }
}

// Report
if (changed) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✅ ${filePath} formatted`)
  console.log(`   ${tagged} poems tagged as sonnet (${sonnetCount} total with 14 verses)`)
  if (nonSonnetCount > 0) console.log(`   ${nonSonnetCount} poems tagged as non-sonnet`)
} else {
  console.log(`✓ ${filePath} already formatted`)
}
