# analytics-adapters

[![npm](https://img.shields.io/npm/v/analytics-adapters)](https://www.npmjs.com/package/analytics-adapters)
[![size](https://img.shields.io/bundlephobia/minzip/analytics-adapters)](https://bundlephobia.com/package/analytics-adapters)
[![license](https://img.shields.io/npm/l/analytics-adapters)](./LICENSE)

One analytics API. Swap the provider, keep your calls.

**Providers:** Google Analytics 4, Plausible, custom.
**Frameworks:** Next.js, TanStack Start/Router, Astro, any React router.

```sh
pnpm add analytics-adapters
```

Docs: [`packages/analytics-adapters`](./packages/analytics-adapters#readme)

## Repo

| path | |
| --- | --- |
| [`packages/analytics-adapters`](./packages/analytics-adapters) | published package |
| [`apps/example-next`](./apps/example-next) | Next.js demo |
| [`apps/example-tanstack`](./apps/example-tanstack) | TanStack Start demo |
| [`recipes`](./recipes) | how-tos, e.g. [GA4 bot spam](./recipes/ga4-bot-spam.md) |

```sh
pnpm install
pnpm test        # builds, runs vitest
pnpm typecheck
```

Release: `pnpm changeset` → `pnpm changeset version` → `pnpm release`.

## License

[MIT](./LICENSE)
