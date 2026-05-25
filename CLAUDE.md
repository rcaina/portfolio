# CLAUDE.md

Context for AI assistants working on this repo. Keep this file accurate when the codebase changes — outdated guidance here is worse than none.

## What this is

Renzo Caiña's personal portfolio site at **renzocaina.com**. Single-page, scroll-based, terminal-themed. Currently on branch `app-redesign` — a redesign migrating from Pages Router to App Router with a "developer-terminal" aesthetic (monospace, prompts, line numbers, dot grid).

The deployed site (main branch) is the older Pages Router version; the current branch is a from-scratch visual redesign that has not yet shipped to production.

## Stack

| Area            | Choice                                                               |
| --------------- | -------------------------------------------------------------------- |
| Framework       | **Next.js 16, App Router** (`app/` directory)                        |
| Language        | TypeScript 5                                                         |
| Styling         | Tailwind CSS 3, CSS variables (HSL) for theme tokens                 |
| Theming         | `next-themes` — `class` strategy, defaults to **dark**, system-aware |
| Typography      | **JetBrains Mono** via `next/font/google` (entire site is monospace) |
| Motion          | Framer Motion 11 (`useReducedMotion` everywhere)                     |
| UI primitives   | Heroicons, `cmdk` (command palette), Radix Tooltip                   |
| AI assistant    | OpenAI `gpt-4o-mini` via [app/api/ai/route.ts](app/api/ai/route.ts)  |
| Package manager | **pnpm 9** (do not use npm/yarn)                                     |
| Node            | 18.x–24.x; Volta pins 22.11                                          |

## Layout

```
app/
├── layout.tsx              # Root layout: JetBrains Mono, metadata, Providers, Header, CommandPalette
├── page.tsx                # Home — composes all view sections under DotGridBackground + EditorGutter
├── providers.tsx           # next-themes + Radix Tooltip + react-toastify
├── not-found.tsx           # Terminal-styled 404
├── opengraph-image.tsx     # Edge-rendered OG card (1200x630)
├── robots.ts / sitemap.ts  # Single-page sitemap
└── api/ai/route.ts         # OpenAI proxy; reads system prompt from /public/files/

components/
├── common/
│   ├── CommandPalette.tsx  # ⌘K palette w/ navigation, actions, and AI chat mode
│   ├── ExperienceCard.tsx  # Collapsible accordion; supports nested subsidiaries
│   ├── ProjectCard.tsx     # Collapsible card; renders Webflow vs code projects differently
│   ├── GithubStrip.tsx     # Server component, fetches github events (10min revalidate)
│   ├── SectionHeading.tsx  # Numbered "$ <cmd> <label>/" terminal-style heading
│   ├── SectionReveal.tsx   # Motion wrapper: fade+rise on whileInView
│   └── Spinner.tsx
├── layout/
│   ├── Header.tsx          # Fixed top-left logo, expands on hover to show full name
│   └── Container.tsx
└── motion/
    ├── DotGridBackground.tsx  # Fixed parallax dot grid (scrolls at 0.15x)
    └── EditorGutter.tsx       # Desktop-only fake line numbers, lg+ breakpoint

lib/
├── constants.ts            # ALL site content — NAME, EXPERIENCES, CODING_PROJECTS, WEBFLOW_PROJECTS, socialLinks
├── views/                  # Section-level components (Hero, Experience, Projects, OtherProjects, Education)
├── usePlatform.ts          # Detects mac vs other for ⌘ vs Ctrl key hint
└── utils.ts                # cx() helper + SYSTEM_PROMPT loaded from public/files/

public/
├── files/
│   ├── renzo_caina.pdf            # Resume — served via /files/renzo_caina.pdf
│   └── renzo_caina_ai_prompt.txt  # System prompt for the AI chat (read at runtime by /api/ai)
├── images/                 # Company/project logos imported as StaticImageData in constants.ts
├── icons/                  # Favicons + apple-icon
└── manifest.json
```

## Conventions

### Content editing

All site copy lives in [lib/constants.ts](lib/constants.ts). To add a job, project, or social link, edit the corresponding exported array — **do not** create per-entry components or files. Logo images are imported at the top of `constants.ts` as `StaticImageData` and bundled.

- `EXPERIENCES[]` — array of `Experience` objects. `subsidiaries: []` is required; nested subsidiaries render as indented child cards (used by Renew Biotechnologies).
- `CODING_PROJECTS[]` — coding work. Has optional `demo_account_info` for try-it credentials.
- `WEBFLOW_PROJECTS[]` — visual-only/no-code projects (Webflow/Figma). Note: `ProjectCard` switches the live button label to "visit site" when `technologies` includes `"Webflow"`.

When editing experience descriptions, write in plain prose (each bullet is one sentence in `description: string[]`). The card renders them as `›`-prefixed list items.

### Section structure

Every section in `lib/views/` follows the same skeleton:

```tsx
<section id="<slug>" aria-labelledby="<slug>-title" className="... max-w-3xl scroll-mt-12 ...">
  <SectionHeading id="<slug>-title" label="<name>" number="0X" command="<unix-cmd>" count={...} />
  {/* content */}
</section>
```

The `number` increments by section (`00` activity → `01` experience → `02` projects → `03` webflow → `04` education). The `command` is the terminal verb shown as `$ <command> <label>/`. **If you reorder or add a section, renumber and add it to `SECTIONS` in [components/common/CommandPalette.tsx](components/common/CommandPalette.tsx#L37) so ⌘K navigation finds it.**

### Sections & scroll IDs

The home page composes these section ids (used by command palette and in-page anchors):

- `hero`, `activity` (GithubStrip), `experience`, `projects`, `other-projects`, `education`

### Styling

- **Always font-mono.** Headings, body, chips — everything. `globals.css` sets `body { @apply font-mono }`.
- Theme tokens live as **HSL channels** in [styles/globals.css](styles/globals.css) under `:root` and `.dark`. Reference them via Tailwind: `bg-background`, `text-foreground`, `text-brand`, `border-foreground/15`, etc. **Don't** hardcode hex colors in component classes — go through the token.
- Min tap target is `min-h-11` (h-11 = 44px) on every interactive element. Preserve this when editing buttons/links.
- Focus rings use `focus-visible:ring-2 focus-visible:ring-brand/40` (or `/50`). Keep consistent.
- Use `clamp(...)` for fluid type/spacing (see Hero h1, SectionHeading number, section gaps in `page.tsx`).
- See [DESIGN.md](DESIGN.md) for the full visual language reference.

### Motion

- Always respect `useReducedMotion()` — gate non-essential animations on it.
- Standard easing curve: `[0.16, 1, 0.3, 1]` (cubic-bezier ease-out expo-ish).
- `SectionReveal` wraps each home section; don't duplicate fade-in logic inside the section itself.

### Components

- Prefer **server components** by default. Add `"use client"` only when needed (state, effects, framer-motion, browser APIs). Currently client: CommandPalette, ProjectCard, ExperienceCard, Hero, SectionReveal, DotGridBackground, EditorGutter, usePlatform, providers.
- Path alias: `@/` → repo root. Use it (`@/lib/constants`, `@/components/...`).

## Common tasks

| Task                      | Where                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Add/edit a job            | [lib/constants.ts](lib/constants.ts) → `EXPERIENCES`                                                           |
| Add/edit a project        | [lib/constants.ts](lib/constants.ts) → `CODING_PROJECTS` or `WEBFLOW_PROJECTS`                                 |
| Update headline / tagline | [lib/views/Hero.tsx](lib/views/Hero.tsx) → `postLines`                                                         |
| Update name/title/school  | [lib/constants.ts](lib/constants.ts) → `NAME`, `JOB_TITLE`, `UNIVERSITY`, etc.                                 |
| Replace the resume PDF    | [public/files/renzo_caina.pdf](public/files/renzo_caina.pdf) (filename is referenced in Hero + CommandPalette) |
| Edit AI chat persona      | [public/files/renzo_caina_ai_prompt.txt](public/files/renzo_caina_ai_prompt.txt) — loaded by `lib/utils.ts`    |
| Change palette commands   | [components/common/CommandPalette.tsx](components/common/CommandPalette.tsx)                                   |
| Tweak theme colors        | [styles/globals.css](styles/globals.css) (`:root` / `.dark`)                                                   |
| Add a new section         | Create `lib/views/X.tsx`, add to [app/page.tsx](app/page.tsx), add to `SECTIONS` in CommandPalette             |

## Gotchas

- **Hardcoded paths.** `/files/renzo_caina.pdf` is referenced in [Hero.tsx](lib/views/Hero.tsx) and [CommandPalette.tsx](components/common/CommandPalette.tsx). The contact email `renzo.caina@outlook.com` is hardcoded in those same two files. Update both if you change either.
- **AI route reads from disk.** `lib/utils.ts` does `fs.readFileSync` at import time on the AI prompt file. It only works on Node runtime (the route already sets `runtime = "nodejs"`). Don't move that file or it'll break the chat at runtime.
- **GithubStrip is a server component with 10-min revalidation.** Hits the unauthenticated GitHub events API — `GITHUB_USER` is hardcoded to `"rcaina"`.
- **The README is stale.** It still describes the Pages Router architecture and deleted components (SideNav, ThemeToggle, ChatWidget, QuickLink). Trust this file and the actual code, not the README, until it's updated.
- **Two profile images exist** in `public/images/`: `profile.jpg` and `profile_img.jpg`. Hero uses `profile_img.jpg`. The other may be obsolete.
- **OG image is edge-rendered** ([app/opengraph-image.tsx](app/opengraph-image.tsx)) — it can't import `StaticImageData` modules or use anything from `lib/constants.ts` directly; copy text inline.
- **`pnpm start` runs on port 8080**, not 3000 (dev is 3000).

## Commands

```bash
pnpm dev          # dev server on :3000
pnpm build        # production build
pnpm start        # production server on :8080
pnpm lint         # eslint
pnpm lint:write   # eslint --fix
pnpm format       # prettier check
pnpm format:write # prettier write
```

Pre-commit (husky + lint-staged): runs `pnpm lint` and `prettier --write` on staged `.ts/.tsx/.js` files.

## Deployment

- **Vercel** for the full app (API routes need a Node runtime).
- `.github/workflows/ci.yml` includes a static-export-to-Pages path (`./out` upload) — but that path can't host `/api/ai`. The live OpenAI-backed site must run on Vercel/Docker.
- `Dockerfile` targets a standalone build (`output: "standalone"` in `next.config.js`).
