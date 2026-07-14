# Échos du Parnasse

A digital library for public domain poetry. French-first, multilingual later.

## Tech stack

- **Next.js 16** (App Router, React Server Components, TypeScript)
- **React 19** / **React DOM 19**
- **Tailwind CSS v4** (CSS-first config)
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — PostgreSQL, auth, RLS
- **Package manager:** pnpm

## Getting started

### Prerequisites

- Node.js 20+ and pnpm
- A Supabase project (local or remote)

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase project values:

| Variable                               | Required | Used by                   |
| -------------------------------------- | -------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | `src/lib/supabase/env.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | `src/lib/supabase/env.ts` |

> Note: the key variable is named `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, not the conventional `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Database setup

The schema and RLS policies live in `supabase/migrations/`. To apply them to a Supabase project:

```bash
# Link to a remote project
supabase link --project-ref <your-project-ref>

# Apply pending migrations
supabase db push
```

Or run the SQL file directly in the Supabase Studio SQL editor:

```
supabase/migrations/20260706120000_initial_schema.sql
```

### Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                                                |
| `pnpm build`        | Production build (also type-checks)                                                 |
| `pnpm start`        | Run the production build                                                            |
| `pnpm lint`         | Run ESLint                                                                          |
| `pnpm format`       | Format source files with Prettier                                                   |
| `pnpm format:check` | Check formatting without writing                                                    |
| `pnpm seed`         | Seed poems from `data/` JSON files (requires `--from path`, supports glob patterns) |
| `pnpm scrape`       | Scrape poems from French Wikisource                                                 |

## Project structure

```
src/
├── app/                  Next.js App Router (pages, layout, route handlers)
├── components/
│   ├── dismissable-banner.tsx  Closable message banner
│   ├── poem-card.tsx     Poem display (list + full variants)
│   ├── poem-filters.tsx  Cascading search/filter controls
│   ├── poem-status-toggle.tsx  Read/favorite buttons
│   ├── page-shell.tsx    Page layout wrapper
│   ├── site-footer.tsx   Footer with legal links
│   ├── site-header.tsx   Auth-aware navigation
│   └── state-message.tsx Empty/error state display
├── lib/
│   ├── supabase/
│   │   ├── env.ts        Lazy env-var guard
│   │   ├── server.ts     Server client (RSC, route handlers)
│   │   └── client.ts     Browser client (client components)
│   ├── use-poem-status.ts  Disjoint read/favorite hook (Supabase when logged in, localStorage when not)
│   └── utils.ts          Shared helpers
├── proxy.ts              Supabase auth session refresh
└── types/database.ts     Schema types
scripts/
├── seed.ts               Poem seeder (reads JSON files from data/)
├── scrape-wikisource.ts   Wikisource scraper
└── convert-latex-sonnets.js  LaTeX sonnet converter
data/
├── sample-poems.json      Curated sample poems (Baudelaire, Rimbaud, Verlaine)
├── baudelaire.json        Scraped poems from Wikisource
├── banville-sonnets.json  53 sonnets by Théodore de Banville
├── gautier-sonnets.json   52 sonnets by Théophile Gautier
├── heredia-sonnets.json   140 sonnets by José-Maria de Heredia
├── lecontedelisle-sonnets.json  27 sonnets by Leconte de Lisle
├── mendes-sonnets.json    39 sonnets by Catulle Mendès
└── prudhomme-sonnets.json 160 sonnets by Sully Prudhomme
supabase/
└── migrations/           Schema + RLS policies
```

## Routes

| Path                    | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `/`                     | Homepage — daily featured poem, nav links       |
| `/poems`                | Browse, search & filter all poems + random poem |
| `/poems/[id]`           | Poem detail + prev/next nav                     |
| `/collections`          | Collection listing                              |
| `/collections/[id]`     | Collection detail with ordered poems            |
| `/tags/[id]`            | Poems by tag                                    |
| `/authors/[id]`         | Author detail + their poems/collections         |
| `/about`                | Project info, features, sources, contact        |
| `/privacy`              | Privacy policy (email, localStorage, cookies)   |
| `/legal`                | Mentions légales (editor, hosting, license)     |
| `/account`              | Account settings & account deletion             |
| `/login`                | Email/password login & signup                   |
| `/auth/callback`        | OAuth code exchange handler                     |
| `/auth/signout`         | POST signout handler                            |
| `/auth/auth-code-error` | OAuth error display                             |

## Data Model

Six tables in `public` schema:

- **Author** — `id`, `name`, `birth_year`, `death_year`, `bio`, `created_at`
- **Collection** — `id`, `title`, `author_id`, `year`, `description`, `created_at`
- **Poem** — `id`, `title`, `content`, `author_id`, `collection_id`, `position_in_collection`, `language`, `created_at`
- **Tag** — `id`, `name`
- **PoemTag** — `poem_id`, `tag_id` (junction table)
- **UserPoemStatus** — `user_id`, `poem_id`, `is_read`, `is_favorite`, `updated_at` (RLS: owner only)

Library tables have public read access. User data is owner-only via RLS.

### Seed script env vars

| Variable              | Required for | Used by           |
| --------------------- | ------------ | ----------------- |
| `SUPABASE_URL`        | Seed only    | `scripts/seed.ts` |
| `SUPABASE_SECRET_KEY` | Seed only    | `scripts/seed.ts` |
| `SITE_URL`            | Production   | Auth redirects    |
| `GITHUB_USERNAME`     | /about page  | GitHub links (user) |
| `GITHUB_REPO`         | /about page  | GitHub links (repo) |

## Design Principles

- Minimal, typography-focused UI
- Accessible (WCAG AA) — aspirational
- Offline-capable (PWA goal)
- Free software, contributor-friendly

## License

GNU General Public License v3.0. See [LICENSE](./LICENSE).

## Known Issues / TODO

- No author listing page (only detail page via `/authors/[id]`)
- No test suite
- Dark mode uses `prefers-color-scheme` media query (no manual toggle)
