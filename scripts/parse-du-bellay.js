#!/usr/bin/env node
/**
 * Parse pandoc-converted TXT files of Joachim du Bellay poems
 * into the ScraperPoem JSON format for the seed script.
 *
 * Usage: node scripts/parse-du-bellay.js
 * Output: data/json/du-bellay.json
 *
 * Tags are NOT set here — run format-json.js afterwards.
 */

const fs = require('fs')
const path = require('path')

const TXT_DIR = path.resolve(__dirname, '..', 'data', 'txt')
const OUTPUT = path.resolve(__dirname, '..', 'data', 'json', 'du-bellay.json')

const COLLECTIONS = {
  'du_bellay-les_regrets.txt': 'Les Regrets',
  'du_bellay-les_antiquites_de_rome.txt': 'Les Antiquités de Rome',
  'du_bellay-le_songe.txt': 'Le Songe',
}

/** Normalize line content: remove NBSP placeholders, collapse blank lines. */
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

/** Rebuild content with proper stanza breaks from flat verse lines.
 *  stanzaPattern = [4,4,3,3] means 4-verse stanza, 4-verse stanza, 3-verse stanza, 3-verse stanza.
 *  If the pattern doesn't cover all verses, it wraps (like CSS flex-wrap). */
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

/** Split a pandoc TXT file into individual poems. */
function parseFile(filePath, collectionName) {
  const text = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n')
  const lines = text.split('\n')

  // Skip the first line which is always '[]' from pandoc
  const bodyLines = lines.slice(1)

  // Find poem marker lines (arabic or roman numerals followed by a dot)
  const markerRe = /^\s*(\d+\.|[IVXL]+\.)\s*$/

  const poems = []

  // ── Les Regrets: handle the two unnumbered introductory poems ──
  if (collectionName === 'Les Regrets') {
    const linesText = bodyLines.join('\n')

    // "À MONSIEUR D'AVANSON" — starts after the Latin epigraph, ends before "à son livre"
    const avansonMatch = linesText.match(
      /À MONSIEUR D'AVANSON[\s\S]*?\n\n(Si je n'ai plus la faveur de la Muse[\s\S]*?)à son livre/i,
    )
    if (avansonMatch) {
      const rawLines = avansonMatch[1].split('\n')
      const contentLines = normalizeLines(rawLines)
      if (contentLines.length > 0) {
        // Strip leading blank lines
        while (contentLines.length > 0 && contentLines[0].trim() === '') contentLines.shift()
        // Filter to flat verses only, then rebuild as 4-verse stanzas
        const avansonVerses = contentLines.filter(l => l.trim() !== '')
        poems.push({
          title: 'À Monsieur d\'Avanson',
          content: rebuildWithStanzas(avansonVerses, [4]),
          language: 'fr',
          collection: collectionName,
        })
      }
    }

    // "À son livre" — sonnet: 4/4/3/3
    const livreMatch = linesText.match(
      /à son livre[\s\S]*?\n\n(Mon livre[\s\S]*?)\n\n1\./i,
    )
    if (livreMatch) {
      const rawLines = livreMatch[1].split('\n')
      const contentLines = normalizeLines(rawLines)
      if (contentLines.length > 0) {
        while (contentLines.length > 0 && contentLines[0].trim() === '') contentLines.shift()
        // Filter to flat verses only, then rebuild as sonnet: 4/4/3/3
        const livreVerses = contentLines.filter(l => l.trim() !== '')
        poems.push({
          title: 'À son livre',
          content: rebuildWithStanzas(livreVerses, [4, 4, 3, 3]),
          language: 'fr',
          collection: collectionName,
        })
      }
    }
  }

  // ── Numbered poems ──
  // Build segments starting at marker lines
  const segments = []
  let currentSegment = null

  for (const raw of bodyLines) {
    const line = raw.trimEnd()

    // Stop at colophon
    if (line.toLowerCase().startsWith('à propos')) break
    if (line.includes('transcription et la mise en page')) break

    const match = line.match(markerRe)
    if (match) {
      if (currentSegment) segments.push(currentSegment)
      currentSegment = { marker: match[1].trim(), lines: [] }
    } else if (currentSegment) {
      currentSegment.lines.push(line)
    }
  }
  if (currentSegment) segments.push(currentSegment)

  for (const seg of segments) {
    const contentLines = normalizeLines(seg.lines)
    if (contentLines.length === 0) continue

    while (contentLines.length > 0 && contentLines[0].trim() === '') contentLines.shift()
    if (contentLines.length === 0) continue

    poems.push({
      title: seg.marker,
      content: contentLines.join('\n'),
      language: 'fr',
      collection: collectionName,
    })
  }

  return poems
}

// Main
const allPoems = []

for (const [filename, collectionName] of Object.entries(COLLECTIONS)) {
  const filePath = path.join(TXT_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    continue
  }
  const poems = parseFile(filePath, collectionName)
  console.log(
    `  ${filename}: ${poems.length} poems extracted (collection: "${collectionName}")`,
  )
  allPoems.push(...poems)
}

const output = {
  author: 'Joachim du Bellay',
  author_birth_year: 1522,
  author_death_year: 1560,
  poems: allPoems,
}

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8')
console.log(`\n✅ Written ${allPoems.length} poems to ${OUTPUT}`)
