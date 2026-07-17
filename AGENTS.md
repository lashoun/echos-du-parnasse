# Échos du Parnasse

Digital library for public-domain poetry (French-first). Next.js 16 + Supabase.

## Project

- **Stack:** Next.js 16 (App Router, `dynamic = 'force-dynamic'` root layout), React 19, TypeScript 5 (strict), Tailwind CSS v4, Supabase (PostgreSQL + Auth), pnpm, Prettier 3 + eslint-config-prettier + prettier-plugin-tailwindcss, next-themes
- **Entry point:** `src/app/layout.tsx` (root layout, `<html lang="fr">`, 5 next/font families: Geist Sans, Literata, Crimson Pro, Zilla Slab, `SiteHeader`, `SiteFooter`)
- **Pages:** `/` homepage, `/poems` browse+filter+search, `/poems/[id]` detail, `/account` settings + delete, `/about`, `/privacy`, `/legal`, `/collections` / `/collections/[id]`, `/tags/[id]`, `/authors/[id]`, `/login`, `/auth/callback`, `/auth/signout`, `/auth/auth-code-error`, `/admin` dashboard, `/admin/authors` / `/admin/authors/new` / `/admin/authors/[id]/edit`, `/admin/collections` / `/admin/collections/new` / `/admin/collections/[id]/edit`, `/admin/poems` / `/admin/poems/new` / `/admin/poems/[id]/edit`, `/admin/tags`, `/admin/admins`
- **Database:** Supabase PostgreSQL with 7 tables (authors, collections, poems, tags, poem_tags, user_poem_status, admin_users) + RLS. 3 migrations in `supabase/migrations/`.
- **`@/` path alias** configured in `tsconfig.json` mapping to `./src/*`.

## Commands

| Command             | Action                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm dev`          | Start dev server (port 3000)                                                               |
| `pnpm build`        | Type-check + production build (next build)                                                 |
| `pnpm start`        | Run production build                                                                       |
| `pnpm lint`         | ESLint (flat config via `eslint.config.mjs`, next/core-web-vitals + typescript + prettier) |
| `pnpm format`       | Prettier (semi:false, singleQuote:true, tabWidth:2, tailwindcss plugin)                    |
| `pnpm format:check` | Prettier check (no-write)                                                                  |
| `pnpm seed`         | Seed database via `scripts/seed.ts`. Requires `--from file.json` (glob patterns supported) |
| `pnpm scrape`       | Scrape poems from French Wikisource (author/collection/config modes)                       |

- Env vars in `.env.local` (gitignored). Template at `.env.local.example`.
- Schema migrations: run `supabase db push` or paste SQL in Supabase Studio.

## Architecture

- **`src/app/`** — Next.js App Router pages. Root layout forces `dynamic = 'force-dynamic'`. Homepage (`/`) shows daily featured poem via deterministic hash of date. Displays `DismissableBanner` when `?message=` is set (account deletion, etc.). `/account` shows user email and allows account deletion with confirmation. Custom `not-found.tsx` and root `loading.tsx`.
- **`src/components/`** — Shared UI: `PageShell`, `SiteHeader`, `SiteFooter`, `PoemCard` (list/full variants), `PoemFilters` (multi-select chip filters for author/collection/tag with cascading OR logic), `PoemStatusToggle`, `TagInput` (searchable multi-select tag chips, supports creating new tags via comma key), `DismissableBanner`, `StateMessage`, `ConfirmDeleteForm`, `DisplayPreferencesForm`.
- **`src/lib/supabase/`** — Three Supabase client factories (`client.ts` browser, `server.ts` server component, `proxy.ts` route handler proxy) + `env.ts` config helpers.
- **`src/lib/use-poem-status.ts`** — Hook for read/favorite tracking. Completely disjoint: when logged in, reads/writes Supabase `user_poem_status` only; when logged out, reads/writes localStorage only. No sync between the two.
- **`src/lib/use-preferences.ts`** — Hook for display preferences: theme (light/dark/system via `next-themes`) and poem font (Geist Sans, Literata, Crimson Pro, Zilla Slab). Persists font choice in localStorage under `parnasse:preferences`.
- **`src/proxy.ts`** — Next.js 16 proxy, refreshes Supabase auth session.
- **`src/lib/admin.ts`** — Admin auth helpers: `getCurrentUser()` and `requireAdmin()` for protecting admin routes and server actions.
- **`src/types/database.ts`** — Hand-crafted `Database` type for Supabase type inference.
- **`src/app/robots.ts` + `src/app/sitemap.ts`** — robots.txt and sitemap generation. Sitemap fetches all poems, collections, authors, tags dynamically.
- **`scripts/seed.ts`** — Standalone Node script. Reads JSON in two formats (single-object scraper output or array of sample entries). Handles `tags?: string[]` on poems: creates tags via `ensureTag()`, links via `linkPoemTag()`. Requires `--from` (glob patterns supported). Supports `--reset`.
- **`scripts/scrape-wikisource.ts`** — Wikisource scraper. Uses page URL for titles (already correct French casing), preserves parenthetical disambiguation for uniqueness. Normalizes curly apostrophes, newlines. 1.2s rate limiting.
- **`scripts/convert-latex-sonnets.js`** — LaTeX sonnet converter (no deps). Reads `data/latex/{author}.tex` files. Parses `\sonnet` commands with optional epigraphs, subtitle, and content. Title logic: empty reuses previous, roman numerals get `— ` separator, subtitles in `()`. Normalizes accents, `\\`/`\\!` to newlines, `\vin` to tab, `---`/`--` to em/en-dash. Adds French non-breaking spaces before punctuation (narrow U+202F for `!?;`, regular U+00A0 for `:`). Outputs JSON with `tags: ['sonnet']`.

## Conventions

- **Server-first:** All data fetching in async server components. Client components are leaf nodes only.
- **Whitespace rendering:** Poem content uses `whitespace-pre-wrap` CSS so tabs and verse newlines render correctly.
- **Cascading chip filters:** On `/poems`, all three filters (author, collection, tag) are multi-select chip inputs using `TagInput`. Selecting authors unions their available collections; selecting collections filters authors accordingly. Tags cascade from both author and collection selections. All filters use OR logic (`?author=id1,id2&collection=id3`). Read/favorite toggle buttons filter the poem list by status with proper multi-condition support (intersection of positive, subtraction of negative). Pagination at 50 poems per page with `?page=N`. All relationship data fetched server-side and filtered client-side via `useMemo`.
- **Random poem:** Accessed via `/poems?random=1`. Picks randomly from the already-filtered poem array (respects all active filters: search, author, collection, tag, read/favorite status). Displayed as a full PoemCard with read/favorite toggles.
- **Supabase queries:** No `Database` generic on `createServerClient` — type inference from plain `.select('col1, col2')` works without it.
- **Env vars:** `NEXT_PUBLIC_*` for browser-safe vars. `SITE_URL` for production URL (auth redirects, canonical, sitemap). `GITHUB_USERNAME` for /about page links. `getSupabaseConfig()` returns null during build/static gen.
- **Formatting:** Prettier 3 with `semi: false`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: all`, `prettier-plugin-tailwindcss`.
- **Tailwind:** v4 CSS-first config (`@import 'tailwindcss'` + `@theme inline` block). Dark mode via class-based `.dark` strategy (controlled by `next-themes`). Custom theme tokens (`--color-primary`, `--color-muted`, etc.).
- **Error handling:** Root `loading.tsx` + per-route `error.tsx` and `loading.tsx` for `/poems` and `/poems/[id]`.
- **Strings:** All user-facing text in French.
- **Auth:** Server actions at `/login`. Signup passes `emailRedirectTo` from `SITE_URL` env var. OAuth callback at `/auth/callback`. Signout via POST to `/auth/signout`. Account deletion at `/account` uses the service role key via `auth.admin.deleteUser()` (cascades to `user_poem_status`).
- **Seed script:** `INSERT` with manual existence check, never `upsert`. Content-differing duplicates get a disambiguated title with the first verse line in parentheses.
- **Content normalization:** Curly apostrophes (U+2019) → straight (U+0027). Consecutive newlines → max 2. French non-breaking spaces: narrow U+202F before `!?;`, regular U+00A0 before `:`. Titles from Wikisource page URLs (already correct French casing).
- **Security headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` set in `next.config.ts`.

## Env vars

| Variable                               | Required    | Used by                                |
| -------------------------------------- | ----------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes         | Supabase clients                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes         | Supabase clients                       |
| `SUPABASE_URL`                         | Seed only   | `scripts/seed.ts`                      |
| `SUPABASE_SECRET_KEY`                  | Seed only   | `scripts/seed.ts`                      |
| `SITE_URL`                             | Production  | Auth redirects, canonical URL, sitemap |
| `GITHUB_USERNAME`                      | /about page | GitHub repository links (user)         |
| `GITHUB_REPO`                          | /about page | GitHub repository links (repo name)    |

## Notes

- **License:** GNU GPLv3 — see [LICENSE](./LICENSE).
- **Deployment:** Vercel recommended. Set `SITE_URL` in Vercel env vars. Update Supabase Auth URL Configuration in dashboard.
