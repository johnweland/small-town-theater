This is a [Next.js](https://nextjs.org) starter for the Small Town Theater site.

## Quick start

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Start building from [`app/(site)/page.tsx`](app/(site)/page.tsx) and the shared layout in [`app/layout.tsx`](app/layout.tsx).

## Scripts

```bash
npm run dev        # local development
npm run lint       # eslint
npm run test       # unit tests
npm run test:unit  # vitest
npm run test:e2e   # playwright with an auto-started dev server
npm run build      # production build
npm run check      # lint + unit tests + build
```

## Git workflow

- Create a branch for each change.
- Open a pull request into `main`.
- GitHub Actions runs lint, unit tests, build, and e2e checks on non-draft PRs.

## Testing notes

- Unit tests live in `tests/unit`.
- End-to-end tests live in `tests/e2e`.
- Playwright launches the app for you, so `npm run test:e2e` works without a separate terminal.

## Next.js docs

This repo uses Next.js 16, so check the local framework docs in `node_modules/next/dist/docs/` before relying on older examples or habits.

Useful references:

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Playwright docs](https://playwright.dev/docs/intro)
- [Vitest docs](https://vitest.dev/guide/)
