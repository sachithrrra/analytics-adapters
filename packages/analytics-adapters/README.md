# analytics-adapters

One analytics API. Swap the provider, keep your calls. ~1 kB gzipped.

**Providers:** Google Analytics 4, Plausible, or your own.
**Frameworks:** Next.js (App + Pages Router), TanStack Start/Router, Astro, any React router.

```sh
pnpm add analytics-adapters
```

## Setup

**Next.js** — `app/layout.tsx` or `pages/_app.tsx`

```tsx
import { GoogleAnalytics } from 'analytics-adapters/next'

<GoogleAnalytics id="G-XXXXXXX">{children}</GoogleAnalytics>
```

**TanStack Start** — `routes/__root.tsx`

```tsx
import { GoogleAnalytics } from 'analytics-adapters/tanstack'

<GoogleAnalytics id="G-XXXXXXX">{children}</GoogleAnalytics>
```

Custom events in either: `useAnalytics().track('signup')`.

**Astro** — in your layout

```astro
<script>
  import { googleAnalytics } from 'analytics-adapters/astro'

  googleAnalytics({ id: 'G-XXXXXXX' })
</script>
```

Works with or without `<ClientRouter />`. The call returns the instance for `track()`.

**Other React routers** — `analytics-adapters/react`: `AnalyticsProvider`, `useAnalytics`, `usePageview(path)`.

Swap `GoogleAnalytics` / `googleAnalytics` for `PlausibleAnalytics` / `plausibleAnalytics({ domain })` to use Plausible.

## API

```ts
import { createAnalytics } from 'analytics-adapters'
import { google } from 'analytics-adapters/google'

const analytics = createAnalytics(google({ id: 'G-XXXXXXX' }))

analytics.page({ page_path: '/pricing' })
analytics.track('signup', { plan: 'pro' })
analytics.identify('user_123')
analytics.consent({ analytics_storage: 'granted' })
await analytics.get('client_id') // undefined after 3s if blocked
```

No-op on the server. Calls before load auto-load first, so nothing drops. Pass the instance to `<Analytics analytics={…}>` (Next/TanStack) or `trackPageviews(analytics)` (Astro).

Pageviews come only from the router (auto `page_view` is disabled), so navigations never double-count.

## Providers

**Google** — `google({ id, nonce?, consent?, defer?, config?, skip? })`. `consent` sets Consent Mode defaults. `defer` (default `true`) injects the script on `requestIdleCallback`. `config` adds `gtag('config')` params to every hit. `skip` runs once in the browser; return `true` to send nothing for that page load.

Recipe: [filtering GA4 bot spam](https://github.com/sachithrrra/analytics-adapters/blob/main/recipes/ga4-bot-spam.md) with `skip` + `config`.

**Plausible** — install `@plausible-analytics/tracker` alongside. `plausible({ domain, ...PlausibleConfig, defer? })`. Props are stringified; `identify`, `consent`, `get` are no-ops.

**Custom** — implement `Adapter`. Pass an array to fan out:

```ts
import type { Adapter } from 'analytics-adapters'

const logger: Adapter = { load() {}, page: console.log, track: console.log }

createAnalytics([google({ id: 'G-X' }), logger])
```
