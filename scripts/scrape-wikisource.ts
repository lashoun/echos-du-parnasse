#!/usr/bin/env node

/**
 * Wikisource Scraper for Échos du Parnasse.
 *
 * Fetches public-domain poems from French Wikisource (fr.wikisource.org)
 * and outputs structured JSON ready for review and seeding.
 *
 * Wikisource poem structure:
 *   - Category pages (Catégorie:Poèmes de X) list all pages for an author.
 *   - Some pages are direct poems (subpages like "Collection/Poem" with .poem.verse).
 *   - Others are disambiguation/index pages listing editions — the scraper follows
 *     the first French Wikisource subpage link to find the actual poem.
 *
 * Usage:
 *   pnpm scrape --author "Charles Baudelaire"              # scrape all poems
 *   pnpm scrape --author "Charles Baudelaire" --limit 5    # first 5 poems
 *   pnpm scrape --collection "Les Fleurs du mal (1861)"    # scrape a collection
 *   pnpm scrape --config authors.json --output poems.json
 *
 * Config file format (authors.json):
 *   { "authors": [{ "name": "Charles Baudelaire" }] }
 *   Optionally specify a custom category:
 *   { "authors": [{ "name": "Charles Baudelaire", "category": "Catégorie:Poèmes de Charles Baudelaire" }] }
 */

import { parse as parseHtml } from 'node-html-parser'
import { sleep, apiFetch } from './lib/http'

// ── Types ──────────────────────────────────────────────────────────

interface PageInfo {
  pageid: number
  title: string
}

interface ScrapedPoem {
  title: string
  content: string
  language: string
  collection: string | null
  source_url: string
}

interface ParsedArgs {
  author?: string
  category?: string
  collection?: string
  config?: string
  output?: string
  limit?: number
  help?: boolean
}

// ── Constants ──────────────────────────────────────────────────────

const WIKISOURCE_API = 'https://fr.wikisource.org/w/api.php'
const GITHUB_USER = process.env.GITHUB_USERNAME ?? 'unknown'
const GITHUB_REPO = process.env.GITHUB_REPO ?? 'echos-du-parnasse'
const USER_AGENT = `EchosDuParnasse/1.0 (https://github.com/${GITHUB_USER}/${GITHUB_REPO}; scraper for public-domain poems)`
const RATE_LIMIT_MS = 1_200 // 1.2s between requests (respectful to Wikisource)

function apiUrl(params: Record<string, string>): string {
  const search = new URLSearchParams({ format: 'json', ...params })
  return `${WIKISOURCE_API}?${search.toString()}`
}

// ── Category / collection page listing ─────────────────────────────

async function getCategoryPages(categoryTitle: string): Promise<PageInfo[]> {
  const pages: PageInfo[] = []
  let cmcontinue: string | null = null

  do {
    const params: Record<string, string> = {
      action: 'query',
      list: 'categorymembers',
      cmtitle: categoryTitle,
      cmlimit: 'max',
      cmtype: 'page',
    }
    if (cmcontinue) params.cmcontinue = cmcontinue

    const data = await apiFetch(apiUrl(params), USER_AGENT).then((r) => r.json())
    const members = (data.query?.categorymembers ?? []) as PageInfo[]
    for (const page of members) {
      if (page.title && page.pageid) pages.push(page)
    }

    cmcontinue = data.continue?.cmcontinue ?? null
    if (cmcontinue) await sleep(RATE_LIMIT_MS)
  } while (cmcontinue)

  return pages
}

async function getCollectionSubpages(
  collectionTitle: string,
): Promise<PageInfo[]> {
  const pages: PageInfo[] = []
  const prefix = `${collectionTitle}/`

  let offset: string | null = null
  do {
    const params: Record<string, string> = {
      action: 'query',
      list: 'prefixsearch',
      pssearch: prefix,
      pslimit: 'max',
      psnamespace: '0',
    }
    if (offset) params.psoffset = offset

    const data = await apiFetch(apiUrl(params), USER_AGENT).then((r) => r.json())
    const results = (data.query?.prefixsearch ?? []) as PageInfo[]
    for (const page of results) {
      if (page.title && page.pageid) pages.push(page)
    }

    offset = data?.continue?.psoffset ?? null
    if (offset) await sleep(RATE_LIMIT_MS)
  } while (offset)

  return pages
}

// ── HTML fetching ──────────────────────────────────────────────────

async function fetchPageHtml(title: string): Promise<string | null> {
  const url = apiUrl({
    action: 'parse',
    page: title,
    prop: 'text',
    disablelimitreport: '1',
    disableeditsection: '1',
  })

  try {
    const data = await apiFetch(url, USER_AGENT).then((r) => r.json())
    if (data.error) {
      console.error(`  ⚠ API error for "${title}": ${data.error.info}`)
      return null
    }
    return data.parse?.text?.['*'] ?? null
  } catch (err) {
    console.error(`  ⚠ Fetch failed for "${title}": ${err}`)
    return null
  }
}

// ── HTML parsing ───────────────────────────────────────────────────

function extractTitle(html: string, pageTitle: string): string {
  // Use the Wikisource page title (last segment after /) as the primary source.
  // This is unambiguous — no roman numerals, no editorial formatting.
  // Parenthetical disambiguation like (« … ») is preserved so that
  // poems with identical titles (e.g. multiple "Spleen" poems) stay unique.
  const segments = pageTitle.split('/')
  return (segments[segments.length - 1] ?? '').replace(/_/g, ' ')
}

function extractPoemContent(html: string): string | null {
  const root = parseHtml(html)
  const stanzas = root.querySelectorAll('div.poem.verse')
  if (stanzas.length === 0) return null

  const stanzasText: string[] = []
  for (const stanza of stanzas) {
    const p = stanza.querySelector('p')
    if (!p) continue

    const lines: string[] = []
    let current = ''
    for (const child of p.childNodes) {
      if (child.nodeType === 3) {
        const text = child.textContent?.trim()
        if (text) current += text
      } else if (child.nodeType === 1) {
        const el = child as unknown as HTMLElement
        if (el.tagName === 'BR') {
          if (current.trim()) lines.push(current.trim())
          else lines.push('')
          current = ''
        } else if (el.tagName === 'SPAN') {
          const cls = el.className ?? ''
          if (cls.includes('pagenum') || cls.includes('ws-pagenum')) continue
          current += el.textContent?.trim() ?? ''
        } else {
          current += el.textContent?.trim() ?? ''
        }
      }
    }
    if (current.trim()) lines.push(current.trim())

    if (lines.length > 0) stanzasText.push(lines.join('\n'))
  }

  return stanzasText.length > 0 ? stanzasText.join('\n\n') : null
}

function extractCollection(pageTitle: string): string | null {
  const idx = pageTitle.lastIndexOf('/')
  if (idx >= 0) return pageTitle.slice(0, idx).replace(/_/g, ' ')
  return null
}

function extractEditionSubpages(html: string, poemName: string): string[] {
  const root = parseHtml(html)
  const links: string[] = []

  const anchors = root.querySelectorAll('a')
  for (const a of anchors) {
    const href = a.getAttribute('href') ?? ''

    if (!href.startsWith('/wiki/')) continue
    const pageTitle = decodeURIComponent(href.replace('/wiki/', '')).replace(
      /_/g,
      ' ',
    )

    if (!pageTitle.includes('/')) continue

    const lastSegment = pageTitle.split('/').pop() ?? ''
    if (lastSegment === poemName) {
      links.push(pageTitle)
    }
  }

  return [...new Set(links)]
}

// ── Poem page parsing ──────────────────────────────────────────────

async function parseDirectPoemPage(
  pageTitle: string,
): Promise<ScrapedPoem | null> {
  const html = await fetchPageHtml(pageTitle)
  if (!html) return null

  const rawContent = extractPoemContent(html)
  if (!rawContent) return null

  const content = rawContent.replace(/\u2019/g, "'").replace(/\n{3,}/g, '\n\n')
  const title = extractTitle(html, pageTitle).replace(/\u2019/g, "'")
  const collection =
    extractCollection(pageTitle)?.replace(/\u2019/g, "'") ?? null
  const sourceUrl = `https://fr.wikisource.org/wiki/${pageTitle.replace(/ /g, '_')}`

  return { title, content, language: 'fr', collection, source_url: sourceUrl }
}

async function resolveAndParseDisambiguationPage(
  pageTitle: string,
): Promise<ScrapedPoem | null> {
  const html = await fetchPageHtml(pageTitle)
  if (!html) return null

  const poemName = pageTitle.split('/').pop() ?? pageTitle
  const subpages = extractEditionSubpages(html, poemName)

  if (subpages.length === 0) return null

  for (const subpage of subpages) {
    await sleep(RATE_LIMIT_MS)
    const poem = await parseDirectPoemPage(subpage)
    if (poem) return poem
  }

  return null
}

async function parsePoemPage(pageTitle: string): Promise<ScrapedPoem | null> {
  const directPoem = await parseDirectPoemPage(pageTitle)
  if (directPoem) return directPoem

  await sleep(RATE_LIMIT_MS)
  const resolvedPoem = await resolveAndParseDisambiguationPage(pageTitle)
  if (resolvedPoem) return resolvedPoem

  return null
}

// ── CLI args ───────────────────────────────────────────────────────

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--author':
      case '-a':
        args.author = argv[++i]
        break
      case '--category':
      case '-t':
        args.category = argv[++i]
        break
      case '--collection':
        args.collection = argv[++i]
        break
      case '--config':
      case '-c':
        args.config = argv[++i]
        break
      case '--output':
      case '-o':
        args.output = argv[++i]
        break
      case '--limit':
      case '-n':
        args.limit = Number(argv[++i])
        break
      case '--help':
      case '-h':
        args.help = true
        break
    }
  }
  return args
}

function printHelp(): void {
  console.log(`
Usage:
  pnpm scrape --author "Author Name" [--output file.json]
  pnpm scrape --collection "Collection Name" [--limit N]
  pnpm scrape --config authors.json [--output file.json]

Options:
  --author, -a     Author name (e.g. "Charles Baudelaire")
  --collection     Collection name (e.g. "Les Fleurs du mal (1861)")
  --category, -t   Wikisource category (default: Catégorie:Poèmes de {Author})
  --config, -c     Path to JSON config file with author list
  --output, -o     Output file path (default: stdout)
  --limit, -n      Max poems to scrape (default: all)
  --help, -h       Show this help

Examples:
  pnpm scrape --author "Charles Baudelaire" --limit 5
  pnpm scrape --collection "Les Fleurs du mal (1861)"
  pnpm scrape --author "Arthur Rimbaud" --output rimbaud.json
  pnpm scrape --config authors.json --output all-poems.json

Config file format:
  { "authors": [{ "name": "Charles Baudelaire" }] }
  Optionally: { "authors": [{ "name": "Charles Baudelaire", "category": "Catégorie:Poèmes..." }] }
`)
}

async function loadConfig(
  configPath: string,
): Promise<{ authors: { name: string; category?: string }[] }> {
  const fs = await import('fs')
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv)

  if (args.help) {
    printHelp()
    process.exit(0)
  }

  // Determine which pages to scrape and track the author name
  let pageTitles: string[] = []
  let authorNameForOutput: string | null = null

  if (args.collection) {
    console.log(`📖 Listing subpages of "${args.collection}"...`)
    const subpages = await getCollectionSubpages(args.collection)
    pageTitles = subpages.map((p) => p.title)
    console.log(`   Found ${pageTitles.length} pages`)
    // Author is optional when using --collection; pass via --author flag
    if (args.author) authorNameForOutput = args.author
  } else if (args.config) {
    const config = await loadConfig(args.config)
    for (const authorDef of config.authors) {
      const category =
        authorDef.category ?? `Catégorie:Poèmes de ${authorDef.name}`
      console.log(`\n📖 Scraping author: ${authorDef.name} (${category})...`)
      const pages = await getCategoryPages(category)
      console.log(`   Found ${pages.length} pages in category`)
      pageTitles.push(...pages.map((p) => p.title))
    }
    if (config.authors.length > 0) authorNameForOutput = config.authors[0].name
  } else if (args.author) {
    const category = args.category ?? `Catégorie:Poèmes de ${args.author}`
    console.log(`\n📖 Scraping author: ${args.author} (${category})...`)
    const pages = await getCategoryPages(category)
    console.log(`   Found ${pages.length} pages in category`)
    pageTitles = pages.map((p) => p.title)
    authorNameForOutput = args.author
  } else {
    console.error(
      '❌ Please provide --author, --collection, or --config. See --help.',
    )
    process.exit(1)
  }

  // Apply limit
  if (args.limit && args.limit < pageTitles.length) {
    pageTitles = pageTitles.slice(0, args.limit)
  }

  if (pageTitles.length === 0) {
    console.log('\n⚠ No pages to scrape.')
    process.exit(0)
  }

  // ── Scrape each page ─────────────────────────────────────────────
  const poems: ScrapedPoem[] = []
  const errors: { title: string; reason: string }[] = []

  for (let i = 0; i < pageTitles.length; i++) {
    const title = pageTitles[i]
    const progress = `[${i + 1}/${pageTitles.length}]`
    const display = title.length > 60 ? title.substring(0, 57) + '...' : title
    process.stdout.write(`   ${progress} ${display}... `)

    if (i > 0) await sleep(RATE_LIMIT_MS)

    const poem = await parsePoemPage(title)
    if (poem) {
      console.log(`✅ "${poem.title}"`)
      poems.push(poem)
    } else {
      console.log(`⏭ No poem content`)
      errors.push({ title, reason: 'No poem content found' })
    }
  }

  // ── Output ───────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(48))
  console.log('📊 Résumé')
  console.log('='.repeat(48))
  console.log(`   ✅ ${poems.length} poème(s) extrait(s)`)
  if (errors.length > 0) console.log(`   ⏭ ${errors.length} page(s) ignorée(s)`)
  for (const p of poems) {
    const coll = p.collection ? ` (${p.collection})` : ''
    const preview = p.content.replace(/\n/g, ' ').substring(0, 60)
    console.log(`   • ${p.title}${coll}`)
    console.log(`     ${preview}…`)
  }

  const result: Record<string, unknown> = { poems, errors }
  if (authorNameForOutput) result.author = authorNameForOutput
  const output = JSON.stringify(result, null, 2)

  if (args.output) {
    const fs = await import('fs')
    fs.writeFileSync(args.output, output + '\n', 'utf-8')
    console.log(`\n💾 Écrit dans ${args.output}`)
  } else {
    console.log('\n' + output)
  }
}

main().catch((err) => {
  console.error('\n❌ Erreur fatale:', err)
  process.exit(1)
})
