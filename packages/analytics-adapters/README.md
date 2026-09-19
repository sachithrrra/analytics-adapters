# analytics-adapters

One analytics API. Swap the provider, keep your calls.

```sh
pnpm add analytics-adapters
```

```ts
// lib/analytics.ts
import { createAnalytics } from 'analytics-adapters'
import { google } from 'analytics-adapters/google'

export const analytics = createAnalytics(google({ id: 'G-XXXXXXX' }))

analytics.track('signup', { plan: 'pro' })
analytics.page({ page_path: '/pricing' })
analytics.identify('user_123')
```

Every call is a no-op on the server, so it's safe to import anywhere.

## Next.js Google Analytics

```tsx
// app/layout.tsx
import { GoogleAnalytics } from 'analytics-adapters/next'

<GoogleAnalytics id="G-XXXXXXX">{children}</GoogleAnalytics>
```

Pageviews track on every navigation. `useAnalytics()` works in any client component for custom events. Works in `pages/_app.tsx` too.

For multiple providers or a custom adapter, pass your own instance:

```tsx
// app/layout.tsx
import { Analytics } from 'analytics-adapters/next'
import { analytics } from '@/lib/analytics'

export default function RootLayout({ children }) {
  return (
    <html><body><Analytics analytics={analytics}>{children}</Analytics></body></html>
  )
}
```

`<Analytics>` is a client component; it wraps children in the provider and sends a `page_view` on every App Router navigation. Use `useAnalytics()` from the same subpath in client components.

## TanStack Start Google Analytics

```tsx
// routes/__root.tsx
import { GoogleAnalytics } from 'analytics-adapters/tanstack'

<GoogleAnalytics id="G-XXXXXXX">{children}</GoogleAnalytics>
```

Or with your own instance:

```tsx
import { Analytics } from 'analytics-adapters/tanstack'
import { analytics } from '~/lib/analytics'

<Analytics analytics={analytics}>{children}</Analytics>
```

## Plausible

Wraps the official [`@plausible-analytics/tracker`](https://www.npmjs.com/package/@plausible-analytics/tracker); install it alongside:

```sh
pnpm add @plausible-analytics/tracker
```

```ts
import { plausible } from 'analytics-adapters/plausible'

export const analytics = createAnalytics(plausible({ domain: 'example.com' }))
```

Or zero-config: `<PlausibleAnalytics domain="example.com">` from `analytics-adapters/next` or `analytics-adapters/tanstack`.

Options are the tracker's [`PlausibleConfig`](https://plausible.io/docs/script-extensions) (`endpoint` for self-hosted/proxy, `outboundLinks`, `fileDownloads`, `revenue`, …) plus `defer` (default `true`: load on `requestIdleCallback`; calls queue meanwhile). `autoCapturePageviews` is forced off so `page()` is the only pageview source. Props are stringified (Plausible only accepts strings). `identify`, `consent`, and `get` are no-ops — Plausible is cookieless.

## Any other React app

`analytics-adapters/react` exports the building blocks: `AnalyticsProvider`, `useAnalytics`, and `usePageview(path)` — pass whatever your router says the current path is.

## Google options

| option          | default       |                                  |
| --------------- | ------------- | -------------------------------- |
| `id`            | required      | GA4 measurement ID (`G-…`)       |
| `nonce`         |               | CSP nonce for the script tag     |
| `consent`       |               | Consent Mode defaults, e.g. `{ analytics_storage: 'denied' }` |
| `defer`         | `true`        | Inject the script on `requestIdleCallback`; events queue meanwhile |

Calls made before `load()` auto-load first, so nothing is ever dropped. Update consent later with `analytics.consent({ analytics_storage: 'granted' })`. Read values with `await analytics.get('client_id')` (resolves `undefined` after 3s if the script is blocked).

Auto pageviews are disabled (`send_page_view: false`); `usePageview` / `page()` is the single source of truth, so SPA navigations never double-count.

## Custom adapter

```ts
import type { Adapter } from 'analytics-adapters'

const logger: Adapter = {
  load() {},
  page: (p) => console.log('page', p),
  track: (n, p) => console.log(n, p),
}

createAnalytics([google({ id: 'G-X' }), logger]) // fans out to all
```
