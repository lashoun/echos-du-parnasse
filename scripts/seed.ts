/**
 * Seed script for Échos du Parnasse.
 *
 * Inserts curated French public-domain poems into Supabase.
 * Uses the secret key for admin access.
 *
 * Usage:
 *   pnpm seed                              # seed data/sample-poems.json
 *   pnpm seed --from baudelaire.json       # seed from scraper output
 *   pnpm seed --from baudelaire.json --author "Name"  # force author
 *   pnpm seed --reset --from sample.json   # reset + seed
 *
 * Requires SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !secretKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, secretKey)

// ── Types ─────────────────────────────────────────────────────────────

interface ScraperPoem {
  title: string
  content: string
  language: string
  collection?: string | null
  source_url?: string
  tags?: string[]
}
interface ScraperOutput {
  author?: string | null
  author_bio?: string | null
  author_birth_year?: number | null
  author_death_year?: number | null
  poems: ScraperPoem[]
  errors?: { title: string; reason: string }[]
}
interface SampleEntry {
  author: string
  author_bio?: string | null
  author_birth_year?: number | null
  author_death_year?: number | null
  poems: ScraperPoem[]
}
interface CliArgs {
  from: string[]
  author?: string
  reset?: boolean
}
type InsertResult = { id: string } | false

// ── CLI ────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { from: [] }
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--from':
        args.from.push(argv[++i])
        break
      case '--author':
      case '-a':
        args.author = argv[++i]
        break
      case '--reset':
        args.reset = true
        break
    }
  }
  return args
}

// ── Database helpers ──────────────────────────────────────────────────

async function resetDatabase() {
  console.log('🗑️  Clearing database…')
  await supabase
    .from('poem_tags')
    .delete()
    .neq('poem_id', '00000000-0000-0000-0000-000000000000')
  await supabase
    .from('poems')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase
    .from('collections')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('✅ Database cleared')
}

async function ensureAuthor(name: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('authors')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (existing) return existing.id
  const { data: i, error } = await supabase
    .from('authors')
    .insert({ name })
    .select('id')
    .single()
  if (error) {
    console.error(`  ❌ Failed to create author "${name}": ${error.message}`)
    return null
  }
  console.log(`  ✅ Author created: ${name} (${i.id})`)
  return i.id
}

async function updateAuthorBio(
  authorId: string,
  bio: string,
  birthYear: number | null,
  deathYear: number | null,
) {
  const { data: existing } = await supabase
    .from('authors')
    .select('bio')
    .eq('id', authorId)
    .single()
  if (!existing?.bio) {
    await supabase
      .from('authors')
      .update({ bio, birth_year: birthYear, death_year: deathYear })
      .eq('id', authorId)
  }
}

async function ensureCollection(
  title: string,
  authorId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('collections')
    .select('id')
    .eq('title', title)
    .eq('author_id', authorId)
    .maybeSingle()
  if (existing) return existing.id
  const { data: i, error } = await supabase
    .from('collections')
    .insert({ title, author_id: authorId })
    .select('id')
    .single()
  if (error) {
    console.error(
      `  ❌ Failed to create collection "${title}": ${error.message}`,
    )
    return null
  }
  console.log(`  ✅ Collection created: ${title}`)
  return i.id
}

async function ensureTag(name: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (existing) return existing.id
  const { data: i, error } = await supabase
    .from('tags')
    .insert({ name })
    .select('id')
    .single()
  if (error) {
    console.error(`  ❌ Failed to create tag "${name}": ${error.message}`)
    return null
  }
  return i.id
}

async function linkPoemTag(poemId: string, tagId: string) {
  const { error } = await supabase
    .from('poem_tags')
    .upsert(
      { poem_id: poemId, tag_id: tagId },
      { onConflict: 'poem_id,tag_id' },
    )
  if (error) console.error(`  ❌ Failed to link tag: ${error.message}`)
}

function firstLine(text: string): string {
  return (
    text
      .replace(/^[「""'']?\s*/, '')
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 10 && !/^[—–\-_]+$/.test(l))
      ?.replace(/[「」""''…!?;:,.]$/, '')
      ?.substring(0, 60)
      ?.trim() ?? ''
  )
}

async function insertPoem(
  title: string,
  content: string,
  language: string,
  authorId: string,
  collectionId?: string | null,
): Promise<InsertResult> {
  const { data: existing } = await supabase
    .from('poems')
    .select('id, content, collection_id')
    .eq('title', title)
    .eq('author_id', authorId)
    .maybeSingle()
  if (existing) {
    const ec = (existing as any).content ?? ''
    const eci = (existing as any).collection_id ?? null
    if (collectionId && !eci)
      await supabase
        .from('poems')
        .update({ collection_id: collectionId })
        .eq('id', existing.id)
    if (ec === content) {
      console.log(`  ✅ Poem: ${title} (already exists)`)
      return { id: existing.id }
    }
    const line = firstLine(content)
    const disambiguated = line ? `${title} (${line})` : `${title} (variante)`
    const { data: existsWithNew } = await supabase
      .from('poems')
      .select('id')
      .eq('title', disambiguated)
      .eq('author_id', authorId)
      .maybeSingle()
    if (existsWithNew) {
      console.log(`  ✅ Poem: ${disambiguated} (already exists)`)
      return { id: existsWithNew.id }
    }
    const { data: ins, error } = await supabase
      .from('poems')
      .insert({
        title: disambiguated,
        content,
        language,
        author_id: authorId,
        collection_id: collectionId ?? null,
      })
      .select('id')
      .single()
    if (error) {
      console.error(
        `  ❌ Failed to insert poem "${disambiguated}": ${error.message}`,
      )
      return false
    }
    console.log(`  ✅ Poem: ${disambiguated}`)
    return { id: ins.id }
  }
  const { data: ins, error } = await supabase
    .from('poems')
    .insert({
      title,
      content,
      language,
      author_id: authorId,
      collection_id: collectionId ?? null,
    })
    .select('id')
    .single()
  if (error) {
    console.error(`  ❌ Failed to insert poem "${title}": ${error.message}`)
    return false
  }
  console.log(`  ✅ Poem: ${title}`)
  return { id: ins.id }
}

// ── Seed from JSON ────────────────────────────────────────────────────

async function seedFromJSON(filePath: string, cliAuthor?: string) {
  const fs = await import('fs')
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const entries: SampleEntry[] = Array.isArray(raw)
    ? raw
    : [raw as ScraperOutput]

  // Collect all unique tags across all entries first
  const allTags = [
    ...new Set(entries.flatMap((e) => e.poems.flatMap((p) => p.tags ?? []))),
  ]
  const tagMap: Record<string, string | null> = {}
  for (const tagName of allTags) {
    tagMap[tagName] = await ensureTag(tagName)
  }

  for (const entry of entries) {
    const authorName = entry.author ?? cliAuthor
    if (!authorName) {
      console.error(
        `  ❌ No author in ${filePath}. Pass --author "Name" to specify.`,
      )
      continue
    }
    console.log(
      `\n📄 ${filePath} — ${entry.poems.length} poem(s) for ${authorName}`,
    )
    const authorId = await ensureAuthor(authorName)
    if (!authorId) continue
    if (entry.author_bio)
      await updateAuthorBio(
        authorId,
        entry.author_bio,
        entry.author_birth_year ?? null,
        entry.author_death_year ?? null,
      )

    const collections = [
      ...new Set(
        entry.poems.map((p) => p.collection).filter(Boolean) as string[],
      ),
    ]
    const collectionMap: Record<string, string | null> = {}
    for (const ct of collections)
      collectionMap[ct] = await ensureCollection(ct, authorId)

    for (const p of entry.poems) {
      const result = await insertPoem(
        p.title,
        p.content,
        p.language,
        authorId,
        p.collection ? (collectionMap[p.collection] ?? null) : null,
      )
      if (result && p.tags) {
        for (const tagName of p.tags) {
          const tagId = tagMap[tagName]
          if (tagId) await linkPoemTag(result.id, tagId)
        }
      }
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv)
  if (args.reset) await resetDatabase()
  const files = args.from.length > 0 ? args.from : ['data/sample-poems.json']
  console.log('🌱 Seeding…\n')
  for (const f of files) await seedFromJSON(f, args.author)
  console.log('\n✨ Seeding complete!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
