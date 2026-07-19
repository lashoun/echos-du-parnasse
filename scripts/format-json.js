#!/usr/bin/env node
/**
 * Format a ScraperPoem JSON file:
 *   - French typography normalization (non-breaking spaces before punctuation)
 *   - Auto-tagging sonnets (exactly 14 non-empty verses → tag "sonnet")
 *   - Title disambiguation:
 *       a) If title is an Arabic or Roman numeral → normalize to Roman + append first verse
 *       b) If any title is duplicated → append first verse to ALL duplicates
 *
 * Usage: node scripts/format-json.js <path-to-json>
 *
 * The file is edited in-place. Idempotent.
 */

const fs = require('fs')
const {
  normalizeTypography,
  firstVerse,
  countVerses,
  toRoman,
} = require('./lib/poem-utils')

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

// Phase 1: typography + sonnet tagging
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
      poem.title = `${title} (${fv})`
    }
    changed = true
  }
}

if (changed) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`✅ ${filePath} formatted`)
  console.log(`   ${tagged} poems tagged as sonnet (${sonnetCount} total with 14 verses)`)
  if (nonSonnetCount > 0) console.log(`   ${nonSonnetCount} poems tagged as non-sonnet`)
} else {
  console.log(`✓ ${filePath} already formatted`)
}
