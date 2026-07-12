# Échos du Parnasse

Digital library for public-domain poetry (French-first). Next.js 16 + Supabase.

## Project

- **Stack:** Next.js 16 (App Router), React 19, TypeScript 5 (strict), Tailwind CSS v4, Supabase (PostgreSQL + Auth), pnpm, Prettier 3 + eslint-config-prettier + prettier-plugin-tailwindcss
- **Entry point:** `src/app/layout.tsx` (root layout, `<html lang="fr">`, Geist font, `SiteHeader`)
- **Pages:** `/` homepage, `/poems` browse, `/poems/[id]` detail, `/random` random+filter, `/collections` / `/collections/[id]`, `/tags/[id]`, `/authors/[id]`, `/search`, `/login`, `/auth/callback`, `/auth/signout`
- **Database:** Supabase PostgreSQL with 6 tables (authors, collections, poems, tags, poem_tags, user_poem_status) + RLS. Migrations in `supabase/migrations/`.

## Commands

| Command       | Action                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`    | Start dev server (port 3000)                                                                                         |
| `pnpm build`  | Type-check + production build                                                                                        |
| `pnpm start`  | Run production build                                                                                                 |
| `pnpm lint`   | ESLint (flat config, next/core-web-vitals + typescript + prettier)                                                   |
| `pnpm format` | Prettier (semi:false, singleQuote:true, tailwindcss plugin)                                                          |
| `pnpm seed`   | Seed database via `scripts/seed.ts`. Defaults to `data/sample-poems.json`. Use `--from file.json` for scraper output |
| `pnpm scrape` | Scrape poems from French Wikisource (author/collection/config modes)                                                 |

- Env vars in `.env.local` (gitignored). Template at `.env.local.example`.
- Schema migrations: run `supabase db push` or paste SQL in Supabase Studio.

## Architecture

- **`src/app/`** — Next.js App Router pages. All are async server components that fetch from Supabase directly. Client components use `'use client'` marker.
  - Homepage (`/`) features a daily poem: deterministic hash of `YYYY-MM-DD` picks a random index from total count. Same poem all day, different every day.
- **`src/components/`** — Shared UI: `PageShell` (wrapper with max-w-2xl), `SiteHeader` (auth-aware), `PoemCard` (featured/list + read/fav icons), `PoemStatusToggle`, `StateMessage` (empty/error state).
- **`src/lib/supabase/`** — Three Supabase client factories + proxy session refresh:
  - `env.ts` → lazy `getSupabaseConfig()` / `requireSupabaseConfig()` (throws if missing during request)
  - `server.ts` → `createSupabaseServerClient()` (async, cookie-based, for RSC/route handlers/actions)
  - `client.ts` → `createSupabaseBrowserClient()` (singleton, for client components)
  - `proxy.ts` → `updateSession()` (called by `src/proxy.ts`)
- **`src/lib/use-poem-status.ts`** — Hook for anonymous read/favorite tracking via localStorage. Exports `getAllPoemStatuses()` + `clearAllPoemStatuses()` for merge-on-login.
- **`src/proxy.ts`** — Next.js 16 proxy (replaces middleware), refreshes Supabase auth session on every matched request.
- **`src/types/database.ts`** — Hand-crafted `Database` type with `Tables`, `Functions`, `Relationships` for Supabase type inference.
- **`scripts/seed.ts`** — Standalone Node script (runs via `tsx`), loads `.env.local` with `dotenv`. Reads JSON in two formats:
  - Single-object (scraper output) with `author`, `author_bio?`, `poems[]`
  - Array of entries (sample format) with `author`, `author_bio`, `poems[]`
  - Defaults to `data/sample-poems.json` when no `--from` given.
  - Supports `--reset` to clear poems/collections before seeding.
  - Uses `ensureAuthor()`, `ensureCollection()`, `insertPoem()` helpers with find-or-create.
- **`scripts/scrape-wikisource.ts`** — Wikisource scraper with 3 modes:
  - `--collection` → lists subpages via `prefixsearch` API, parses `<div class="poem verse">`
  - `--author` → lists category pages, resolves disambiguation pages by following edition links
  - `--config` → batch mode for multiple authors
  - Title extraction: uses Wikisource page title (last segment after `/`), not `<h3>`.
    Parenthetical disambiguation `(« … »)` is preserved for uniqueness.
  - Normalizations: curly apostrophes (U+2019) → straight (U+0027), consecutive newlines → max 2.
  - 1.2s rate limiting between API calls, retry on 429/5xx.
  - Outputs JSON with `author`, `poems[]` (title, content, collection, source_url).

## Conventions

- **Server-first:** All data fetching happens in async server components. Client components are leaf nodes only (interactivity, localStorage).
- **Supabase queries:** No `Database` generic on `createServerClient` — type inference from plain `.select('col1, col2')` strings works without it. Author joins are done with 2 queries (poems + authors map) instead of embedded joins.
- **Env vars:** `NEXT_PUBLIC_*` for browser-safe vars. `getSupabaseConfig()` returns null during build/static gen — callers must handle that gracefully.
- **Formatting:** Prettier 3 with `semi: false`, `singleQuote: true`, `trailingComma: all`, `prettier-plugin-tailwindcss`. Run `pnpm format` before every commit. ESLint config includes `eslint-config-prettier` to avoid conflicts.
- **Tailwind:** v4 CSS-first config (`@import "tailwindcss"` + `@theme inline` in globals.css). Dark mode uses `prefers-color-scheme` media query + `dark:` variants on components.
- **Error handling:** Per-route `error.tsx` (client component) and `loading.tsx` (server component) for `/poems` and `/poems/[id]`. Root-level for everything else.
- **Strings:** All user-facing text in French. Link labels, error messages, button text — all French.
- **Auth:** `/login` uses server actions (`src/app/login/actions.ts`). OAuth callback at `/auth/callback/route.ts`. Signout via POST to `/auth/signout`. The `proxy.ts` refreshes session but never redirects (public browsing without login).
- **Seed script:** `INSERT` with manual existence check (`maybeSingle()`), never `upsert` (no unique constraints on name/title). When content differs from an existing title, the new poem gets a disambiguated title with the first verse line in parentheses.
- **Content normalization:** Poem content is normalized on scrape: curly apostrophes (U+2019 → U+0027), consecutive newlines collapsed to max 2. Titles come from the Wikisource page URL (last segment after `/`) — already in correct French casing, no post-processing needed.

## Notes

- **License:** GNU GPLv3 — see [LICENSE](./LICENSE).
