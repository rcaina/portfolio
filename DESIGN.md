# DESIGN.md

The visual language for the portfolio. If you're adding or editing UI, match these patterns so the site stays coherent.

## The aesthetic

A developer's terminal, but warm. Off-white "paper" in light mode, warm-tinted near-black in dark mode, both with a subtle film-grain noise overlay (`body::before` in `globals.css`). Every word on the page is rendered in **JetBrains Mono**. The brand accent is a warm sienna/amber — think `man` page on a CRT, not green-on-black hacker movie.

Recurring metaphors:

- **Shell prompts.** `~ renzo.caina/ $ whoami` appears in the hero and 404. Section headings render `$ <command> <label>/` underneath the title (`cat`, `find`, `git log`, `head -1`, `ls`).
- **Editor chrome.** A fixed gutter of fake line numbers ([EditorGutter](components/motion/EditorGutter.tsx)) tracks scroll progress on lg+ screens. The hero shows a `v26.05 · branch/main` build-info line.
- **Caret cursor.** A blinking amber block sits next to the hero name (`Hero.tsx`).
- **Tree characters.** Subsidiaries in experience cards are prefixed with `└─`; section headings prefix groups with `#`; list bullets use `›`.

## Tokens

All tokens are HSL channel values in [styles/globals.css](styles/globals.css). Reference via Tailwind, never hardcode.

### Light (`:root`) — "warm paper"

- `--background` `45 18% 97%` — warm off-white
- `--foreground` `30 8% 12%` — near-black with warm tint
- `--muted-foreground` `30 5% 40%` — secondary text
- `--brand` `18 75% 48%` — warm sienna
- `--brand-muted` `18 50% 42%`
- `--status` `150 45% 38%` — muted green for the "available" dot
- `--border` `40 6% 86%`
- `--radius` `0.375rem` (used as `rounded-md` standard)

### Dark (`.dark`) — "warm-tinted near-black"

- `--background` `30 6% 7%`
- `--foreground` `45 18% 92%`
- `--brand` `25 85% 60%` — brighter amber in dark
- `--brand-muted` `25 55% 52%`
- `--status` `150 50% 56%`

### How to use

```tsx
className = "bg-background text-foreground border-foreground/15";
className = "text-brand";
className = "text-muted-foreground"; // for secondary copy
className = "bg-foreground/[0.015]"; // for card backgrounds — yes, that low
```

Common opacities: `/5`, `/10`, `/15`, `/20`, `/25`, `/30`, `/40`. Avoid plain `gray-*` or `neutral-*` — go through tokens.

## Typography

- Font stack: `JetBrains Mono` (variable `--font-mono`) with system mono fallbacks. Set globally on `body`.
- Headings use `tracking-tight` (h1 is `-0.035em`, h2/h3 `-0.015em`). Hero h1 uses `tracking-[-0.05em]`.
- Font-feature-settings on body: `"rlig" 1, "calt" 1, "ss01" 1`. On headings additionally `"ss02" 1, "zero" 1` (zero gets the slashed zero — distinctive).
- Fluid type scale: use `clamp()` for any hero-sized text. The display utility is `text-display` → `clamp(3rem, 12vw, 7rem)`.
- Common body sizes: `text-xs` (chips, hints), `text-sm` (cards), `text-base` (hero copy). Mono-by-default means looks dense — lean a step smaller than you would in a sans-serif design.

## Layout

- Main content container: `max-w-5xl` for the outer `<main>`, but section content is `max-w-3xl` (≈768px reading width).
- Standard section padding: `px-4` (16px) on mobile.
- Section vertical rhythm: `mt-[clamp(4rem,8vw,6rem)]` between major sections (`page.tsx`). Hero → activity is tighter: `mt-[clamp(2.5rem,6vw,4rem)]`.
- Border radii: `rounded-md` everywhere standard. `rounded-xl` for the command palette dialog. `rounded` (small) for inline kbd hints and tech chips.

## Components patterns

### Card / accordion (Experience, Project)

- Outer: `border border-foreground/10 bg-foreground/[0.015]`. On hover: `border-foreground/25`.
- Header grid: `[3rem_1fr_auto]` mobile / `[4.5rem_2.75rem_1fr_auto]` desktop with year column.
- Logo box: `h-11 w-11 sm:h-12 sm:w-12`, inside a rounded-md `bg-background` square.
- Expand affordance: a 28px `border` square with `PlusIcon` that rotates 45° when open.
- Collapse animation: CSS-grid trick — `grid-rows-[0fr]` ↔ `grid-rows-[1fr]` with `overflow-hidden`. Avoid Framer Motion height animations for these.

### Section heading

- Pattern: large amber number (00–04), then heading label, then a `$ command label/` line underneath in muted mono. Bottom border `border-foreground/15`. See [SectionHeading.tsx](components/common/SectionHeading.tsx).

### Chips

- **TechChip**: `rounded border border-foreground/15 bg-foreground/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-foreground/75`.
- **LinkChip** (action button): `min-h-11`, `border border-foreground/15 bg-foreground/[0.02]`, hover bumps border to `/40` and bg to `/5`. Always pairs with `ArrowUpRightIcon`.

### Buttons / links

- Primary CTA (e.g. resume button): `border border-brand bg-brand text-background`. Hover: `bg-brand-muted`.
- Secondary: `border border-foreground/20 bg-foreground/[0.02]`. Hover: `border-foreground/40 bg-foreground/5`.
- Decorated link: brackets `[...]` flanking the icon+label (e.g. `[contact]` in hero), brackets brighten on hover (`text-brand/70 group-hover:text-brand`).
- kbd chip: `rounded border border-foreground/20 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] tracking-wider`.

### Command palette

- Trigger: fixed `bottom-4 right-4` (`bottom-6 right-6` on md+), 48px tall, sparkles icon + label + kbd chip.
- Dialog: `max-w-xl`, `rounded-xl`, opens at `pt-[10vh]` (sm: `15vh`). Backdrop is `bg-foreground/40 backdrop-blur-sm`.
- Group headings: lowercase, `#`-prefixed (CSS `before:content-['#']`), shown via `[&_[cmdk-group-heading]]:...` selectors — defined once in `GROUP_HEADING_CLASS`.

## Motion

- **Easing.** Everything custom uses `[0.16, 1, 0.3, 1]` (an ease-out expo curve). Tailwind's defaults are fine for small hovers.
- **Durations.** Page-level reveals: 450ms (`SectionReveal`). Hero stagger: 550ms per line with 60ms delay step. Card accordions: 300ms. Microinteractions (hover color): 200ms.
- **Reduced motion.** Every animated component imports `useReducedMotion` from framer-motion and gates non-essential motion. The dot grid and editor gutter explicitly bail out when `prefers-reduced-motion: reduce`.
- **Parallax.** `DotGridBackground` translates the grid at `scrollY * 0.15` via `transform: translate3d(0, -Ypx, 0)` with `will-change: transform`. Don't add more parallax layers — one is enough.

## Accessibility

- `aria-labelledby` on every section linking to its `SectionHeading` `id`.
- Tap targets ≥ 44px (`min-h-11`).
- Skip-to-content link at the top of root layout.
- Focus rings always use brand color at 40–60% alpha. Don't strip focus outlines without replacing them.
- `aria-hidden` on decorative glyphs (`›`, `└─`, `$`, brackets, the blinking caret).
- The status dot has `role="status" aria-label="Currently available for new roles"`.

## Imagery

- Logos are imported as `next/image` `StaticImageData` (PNG/JPG in `public/images/`). They render at 44–48px inside rounded borders with a `bg-background` square — this gives white-on-white logos a frame so they don't disappear in light mode.
- Profile image: 112×112 on mobile, up to 160×160 on md+. Rounded-md (not full circle).
- The OG image ([app/opengraph-image.tsx](app/opengraph-image.tsx)) renders text-only — no logo imports, so it's portable across edge runtime.

## What to keep, what to change

**Keep.** Monospace everywhere. The terminal-prompt headings. Warm palette (no cool grays, no pure blacks/whites). Min 44px targets. CSS-grid accordion expand pattern. Token-based colors.

**Change carefully.** The amber brand color — it's the only chromatic accent on the page. If you introduce a second accent, the whole identity shifts.

**Don't.** Add sans-serif fonts. Use pure `text-gray-*` or `bg-white`/`bg-black`. Animate without a reduced-motion fallback. Add a second hover-parallax layer.
