# Personal Portfolio

A modern, responsive personal portfolio built with Next.js and TypeScript. It presents experience, projects, education, and contact links, with optional theming, section navigation, and an AI assistant backed by the OpenAI API.

## Features

- **Responsive layout** — Works across common breakpoints; mobile section menu and fixed controls adapt to small screens.
- **Light / dark / system theme** — `next-themes` with a floating toggle; respects system preference when enabled.
- **Section navigation** — Side navigation (desktop rail + mobile sheet) with smooth scrolling to Hero, Experience, Projects, Other Projects, and Education.
- **Route progress** — Top-of-page animated progress indicator on navigation (Framer Motion).
- **AI assistant** — Floating “Ask About My Work” chat widget calling `/api/ai` (OpenAI). Graceful messaging when quotas or errors occur; toasts via React Toastify.
- **PWA-oriented metadata** — Web app manifest and icon links in `_app`.
- **Tooling** — ESLint, Prettier (with Tailwind class sorting), Husky + lint-staged, GitHub Actions CI (lint, build, typecheck).

## Page sections

- **Hero** — Name, role, email, resume action, and social links.
- **Experience** — Roles and highlights.
- **Projects** — Featured work with cards and links.
- **Other Projects** — Additional items.
- **Education** — Academic background.

## Tech stack

| Area          | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (Pages Router)                                                         |
| Language      | TypeScript                                                                        |
| Styling       | Tailwind CSS, `tailwindcss-animate`, `tailwind-merge`, `class-variance-authority` |
| Theming       | `next-themes`                                                                     |
| UI primitives | Radix UI (`@radix-ui/react-tooltip`), Heroicons                                   |
| Motion        | Framer Motion                                                                     |
| Notifications | React Toastify                                                                    |
| AI            | OpenAI SDK (`openai`), route handler under `pages/api/ai`                         |

### Deployment

The **Dockerfile** targets a **standalone** Next.js build (`output: "standalone"` in `next.config.js`). **`.github/workflows/ci.yml`** is set up for **GitHub Pages** and uploads `./out`; that path implies a [static export](https://nextjs.org/docs/app/guides/static-exports)–style build, which does not include API routes—so the OpenAI `/api/ai` route would need another hosting strategy if you rely on static Pages. **Vercel** (or the standalone Docker image) fits the full app, including API routes.

## Prerequisites

- **Node.js** 18.x–24.x (Volta in `package.json` pins 22.11)
- **pnpm** 9+ (`packageManager` field)

## Getting started

1. Clone the repository and enter the project directory.

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Environment variables:

   - Copy the sample file to `.env.local`:

     ```bash
     cp .env-example .env.local
     ```

   - For the AI assistant, set **`OPENAI_API_KEY`** in `.env.local`. Without it, the chat API will not be able to call OpenAI.

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                               | Description                          |
| ------------------------------------- | ------------------------------------ |
| `pnpm dev`                            | Next.js dev server                   |
| `pnpm build`                          | Production build                     |
| `pnpm build:ci`                       | Production build (CI-oriented alias) |
| `pnpm start`                          | Production server on **port 8080**   |
| `pnpm lint`                           | ESLint                               |
| `pnpm lint:write`                     | Next.js lint with cache              |
| `pnpm format`                         | Prettier check                       |
| `pnpm format:write` / `pnpm prettier` | Prettier write                       |

`prepare` runs Husky install for git hooks; `lint-staged` runs on staged files per `package.json`.

## CI and deployment

- **`.github/workflows/ci.yml`** — On pushes/PRs to `main`: install with pnpm, ESLint, production build (`build:ci`), and `tsc --noEmit`. On pushes to `main` (and manual **workflow_dispatch**), **Test** must pass before **Build for Pages** and **Deploy to GitHub Pages** run. Pull requests only run **Test** (no deploy).

## Project structure

```
portfolio/
├── components/
│   ├── common/          # Cards, chat widget, spinner, quick links, etc.
│   ├── layout/          # Header, Layout, Container, SideNav, ThemeToggle, NavProgress
│   └── Provider/        # ThemeProvider
├── lib/
│   ├── views/           # Hero, Experience, Projects, OtherProjects, Education, …
│   ├── contants.ts      # Site copy and social data
│   └── utils.ts         # Helpers (e.g. AI system prompt)
├── pages/
│   ├── api/ai/          # OpenAI proxy route
│   ├── index.tsx        # Home sections
│   ├── _app.tsx         # Global providers, manifest, ChatWidget, Toaster
│   └── 404.tsx
├── public/              # Static assets, icons, manifest, files (e.g. resume)
└── styles/              # globals.css
```

## Contributing

This is a personal portfolio; suggestions and feedback are welcome.

## License

There is no `LICENSE` file in this repository. If you fork or republish the project, add a license that matches your intent.

---

Built with Next.js and Tailwind CSS.
