# Échos du Parnasse

Digital library for public-domain poetry (French-first). Next.js 16 + Supabase.

## Project

- **Stack:** Next.js 16 (App Router), React 19, TypeScript 5 (strict), Tailwind CSS v4, Supabase (PostgreSQL + Auth), pnpm, Prettier 3 + eslint-config-prettier + prettier-plugin-tailwindcss
- **Entry point:** `src/app/layout.tsx` (root layout, `<html lang="fr">`, Geist font, `SiteHeader`)
- **Pages:** `/` homepage, `/poems` browse, `/poems/[id]` detail, `/random` random+filter, `/collections` / `/collections/[id]`, `/tags/[id]`, `/authors/[id]`, `/search`, `/login`, `/auth/callback`, `/auth/signout`
- **Database:** Supabase PostgreSQL with 6 tables (authors, collections, poems, tags, poem_tags, user_poem_status) + RLS. Migrations in `supabase/migrations/`.

## Commands

| Command       | Action                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm dev`    | Start dev server (port 3000)                                                                      |
| `pnpm build`  | Type-check + production build                                                                     |
| `pnpm start`  | Run production build                                                                              |
| `pnpm lint`   | ESLint (flat config, next/core-web-vitals + typescript + prettier)                                |
| `pnpm format` | Prettier (semi:false, singleQuote:true, tailwindcss plugin)                                       |
| `pnpm seed`   | Seed database via `scripts/seed.ts`. Defaults to `data/sample-poems.json`. Use `--from file.json` |
| `pnpm scrape` | Scrape poems from French Wikisource (author/collection/config modes)                              |

- Env vars in `.env.local` (gitignored). Template at `.env.local.example`.
- Schema migrations: run `supabase db push` or paste SQL in Supabase Studio.

## Architecture

- **`src/app/`** — Next.js App Router pages. Homepage (`/`) features a daily poem: deterministic hash of `YYYY-MM-DD` picks a random index from total count.
- **`src/components/`** — Shared UI: `PageShell`, `SiteHeader`, `PoemCard`, `PoemStatusToggle`, `StateMessage`.
- **`src/lib/supabase/`** — Three Supabase client factories + proxy session refresh.
- **`src/lib/use-poem-status.ts`** — Hook for anonymous read/favorite tracking via localStorage.
- **`src/proxy.ts`** — Next.js 16 proxy, refreshes Supabase auth session.
- **`src/types/database.ts`** — Hand-crafted `Database` type for Supabase type inference.
- **`scripts/seed.ts`** — Standalone Node script. Reads JSON in two formats (single-object scraper output or array of sample entries). Handles `tags?: string[]` on poems: creates tags via `ensureTag()`, links via `linkPoemTag()`. Defaults to `data/sample-poems.json`. Supports `--reset`.
- **`scripts/scrape-wikisource.ts`** — Wikisource scraper. Uses page URL for titles (already correct French casing), preserves parenthetical disambiguation for uniqueness. Normalizes curly apostrophes, newlines. 1.2s rate limiting.
- **`scripts/convert-latex-sonnets.js`** — LaTeX sonnet converter (no deps). Reads `data/latex/{author}.tex` files. Parses `\sonnet` commands with optional epigraphs, subtitle, and content. Title logic: empty reuses previous, roman numerals get `–` separator, subtitles in `()`. Normalizes accents, `\\`/`\\!` to newlines, `\vin` to tab. Outputs JSON with `tags: ['sonnet']`.

## Conventions

- **Server-first:** All data fetching in async server components. Client components are leaf nodes only.
- **Whitespace rendering:** Poem content uses `whitespace-pre-wrap` CSS (in `poem-card.tsx`, `poems/[id]/page.tsx`, `random/page.tsx`) so tabs and verse newlines render correctly.
- **Supabase queries:** No `Database` generic on `createServerClient` — type inference from plain `.select('col1, col2')` works without it.
- **Env vars:** `NEXT_PUBLIC_*` for browser-safe vars. `getSupabaseConfig()` returns null during build/static gen.
- **Formatting:** Prettier 3 with `semi: false`, `singleQuote: true`, `trailingComma: all`, `prettier-plugin-tailwindcss`.
- **Tailwind:** v4 CSS-first config. Dark mode via `prefers-color-scheme` media query.
- **Error handling:** Per-route `error.tsx` and `loading.tsx` for `/poems` and `/poems/[id]`.
- **Strings:** All user-facing text in French.
- **Auth:** Server actions at `/login`. OAuth callback at `/auth/callback`. Signout via POST to `/auth/signout`.
- **Seed script:** `INSERT` with manual existence check, never `upsert`. Content-differing duplicates get a disambiguated title with the first verse line in parentheses.
- **Content normalization:** Curly apostrophes (U+2019) → straight (U+0027). Consecutive newlines → max 2. Titles from Wikisource page URLs (already correct French casing).

## Notes

- **License:** GNU GPLv3 — see [LICENSE](./LICENSE).
