# Belle (joinbelle.com) — Resume Details

Telehealth marketing site for a women's health brand (GLP-1 weight loss, longevity,
skincare), migrated from Webflow to a modern Next.js + Sanity stack.

## Summary line (pick one)

- Sole engineer who designed, built, and shipped joinbelle.com, migrating a women's-health
  telehealth marketing site from Webflow to Next.js 16 (App Router) + React 19 + TypeScript +
  Tailwind CSS 4 with a Sanity headless CMS; delivered 30+ routes, a custom design system, and
  a full SEO/structured-data layer as the primary contributor (200+ commits).

- Full-stack engineer who rebuilt joinbelle.com end to end (frontend, CMS schema design, SEO
  architecture, third-party integrations, performance) on Next.js 16 + Sanity, shipping a
  quiz-driven recommendation flow, A/B-tested intake, and a token-based design system.

## Full bullets (grouped)

### Architecture & migration

- Migrated the marketing site from Webflow to a Next.js 16 App Router architecture using a
  server-shell / client-content pattern that fetches content server-side and hydrates only the
  interactive sections.
- Authored 60+ permanent redirects from legacy Webflow URLs to preserve SEO equity and avoid
  404s through the migration.
- Designed a Sanity CMS content model (15+ schema types: products, pages, blog, testimonials,
  team, FAQs, site settings) so non-technical staff manage all copy, pricing, and imagery
  without deploys.
- Built the TypeScript data layer with GROQ queries, parallelized fetches, webhook-driven cache
  revalidation (revalidatePath / tags), and 60-second ISR on blog content.

### SEO & structured data

- Implemented a comprehensive Schema.org JSON-LD layer (MedicalBusiness with aggregate ratings,
  Drug / MedicalTherapy, BreadcrumbList, FAQPage, BlogPosting, Person) to drive rich results and
  E-E-A-T for medical (YMYL) content.
- Built a dynamic XML sitemap and robots config that auto-includes CMS-driven product, blog, and
  team routes, with an explicit AI-crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, etc.).
- Created an Edge-runtime dynamic OpenGraph image generator that produces brand-styled social
  cards on demand.

### Interactive features

- Built a "Find Your Treatment" quiz with a custom scoring/recommendation engine
  (category -> symptoms -> priority/severity -> ranked matches with scores and reasoning),
  instrumented with GTM event tracking.
- Implemented a cookie-persisted 50/50 A/B test for the intake/questionnaire flow, configurable
  from the CMS.
- Built UTM/affiliate attribution forwarding that captures landing params into sessionStorage and
  propagates them through every CTA to the conversion flow via a centralized URL builder.

### Design system & UX

- Authored a token-based design system (brand color semantics, type scale, component patterns,
  motion presets) with a mobile-first standard (>=44px tap targets, no horizontal scroll,
  responsive next/image sizing).
- Built scroll-driven animations with Framer Motion across 35+ components (parallax, per-word
  text reveals, hero cycle-word effect) with full prefers-reduced-motion support.

### Integrations & performance

- Integrated Google Tag Manager, Intercom, Customer.io, and Trustpilot reviews; hardened the
  Next.js config with security headers (X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Tuned Core Web Vitals via responsive image sizing, font display: swap, and ISR, and used
  real-world field data (LCP/INP) rather than lab scores to drive third-party script loading
  decisions.

## Early traction (4-day post-launch signal; refresh after full crawl)

> These are early signals from a 4-day window (Jun 2-6) before Google had re-crawled the site.
> Treat as directional; replace with a like-for-like monthly before/after once indexing settles.

- In the first 4 days post-launch (pre-full-crawl), the rebuilt site already matched the prior
  site's 5-month organic daily run-rate: ~540 clicks/day and ~920 impressions/day at ~58% CTR.
- Expanded the indexable surface from 3 pages to 30+ via a dynamic sitemap and Schema.org JSON-LD;
  full re-crawl and indexing in progress.
- Maintained engagement through the redesign (pages/session, scroll depth, and quick-back rate
  held flat vs the prior site).

## Condensed 5-bullet version

- Migrated joinbelle.com from Webflow to Next.js 16 + Sanity CMS as sole engineer (200+ commits),
  with 60+ redirects to preserve SEO equity.
- Built a Schema.org JSON-LD + dynamic sitemap SEO layer and expanded the indexable surface from
  3 pages to 30+ for a YMYL medical site.
- Shipped a quiz-driven treatment-recommendation engine and a CMS-configurable A/B-tested intake
  flow with full UTM attribution forwarding.
- Authored a token-based, mobile-first design system with Framer Motion animations across 35+
  components.
- In a 4-day post-launch window, matched the prior site's 5-month organic daily run-rate
  (~540 clicks/day) before full re-indexing.

## Tech stack (one line)

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Sanity CMS (GROQ),
Vercel; GTM, Customer.io, Intercom, Trustpilot.
