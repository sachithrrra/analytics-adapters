# analytics-adapters

[![npm](https://img.shields.io/npm/v/analytics-adapters)](https://www.npmjs.com/package/analytics-adapters)
[![size](https://img.shields.io/bundlephobia/minzip/analytics-adapters)](https://bundlephobia.com/package/analytics-adapters)
[![license](https://img.shields.io/npm/l/analytics-adapters)](./LICENSE)

One analytics API. Swap the provider, keep your calls.

```sh
pnpm add analytics-adapters
```

## Next.js Google Analytics

```tsx
// app/layout.tsx
import { GoogleAnalytics } from 'analytics-adapters/next'

<GoogleAnalytics id="G-XXXXXXX">{children}</GoogleAnalytics>
```

## TanStack Start Google Analytics

```tsx
// routes/__root.tsx
import { GoogleAnalytics } from 'analytics-adapters/tanstack'

<GoogleAnalytics id="G-XXXXXXX">{children}</GoogleAnalytics>
```

Full docs: [`packages/analytics-adapters`](./packages/analytics-adapters#readme)

- `page` / `track` / `identify` / `consent` / `get` — swap providers without touching call sites
- Router-driven pageviews, `send_page_view: false`; no double counts, search-param navigations included
- Script loads on `requestIdleCallback`; events queue in `dataLayer` until then
- Next.js (App + Pages Router), TanStack Start/Router, or any router via `analytics-adapters/react`
- ~1 kB gzipped

## Repo layout

| path | |
| --- | --- |
| [`packages/analytics-adapters`](./packages/analytics-adapters) | the published package |
| [`apps/example-next`](./apps/example-next) | Next.js demo |
| [`apps/example-tanstack`](./apps/example-tanstack) | TanStack Start demo |

## Development

```sh
pnpm install
pnpm test        # builds the package, runs vitest
pnpm typecheck   # all workspaces
pnpm build
```

Releases use [changesets](https://github.com/changesets/changesets): `pnpm changeset` → `pnpm changeset version` → `pnpm release`.

## License

[MIT](./LICENSE)
