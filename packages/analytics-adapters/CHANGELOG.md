# analytics-adapters

## 1.3.0

### Minor Changes

- e45fe3f: Google adapter: `config` option adds `gtag('config')` params to every hit (e.g. `{ traffic_type: 'external' }`), and `skip` (a browser-side predicate, e.g. bot detection) sends nothing for that page load when it returns `true`. `identify()` no longer sends an extra `page_view`.

## 1.2.0

### Minor Changes

- New `analytics-adapters/astro` entry: `googleAnalytics(opts)`, `plausibleAnalytics(opts)`, and `trackPageviews(analytics)`. Sends a pageview on load and after every `<ClientRouter />` navigation.

## 1.1.0

### Minor Changes

- ### Plausible adapter

  - New `analytics-adapters/plausible` entry: `plausible(options)` wraps the official `@plausible-analytics/tracker` (new optional peer dependency — install it alongside). Options are the tracker's `PlausibleConfig` plus `defer` (default `true`, loads on `requestIdleCallback`; calls made earlier queue in order). `autoCapturePageviews` is forced off so `page()` is the only pageview source; event props are stringified as Plausible requires.
  - `<PlausibleAnalytics domain="…">` zero-config component in `analytics-adapters/next` and `analytics-adapters/tanstack`.

  ### Google adapter types

  - Uses `@types/gtag.js` (added as a dependency) for the `gtag` call signatures. Emitted declarations carry `/// <reference types="gtag.js" />` so it resolves in consumers.
  - `Consent` is now `Gtag.ConsentParams`: adds `functionality_storage`, `personalization_storage`, `security_storage`, `wait_for_update`, `region`. Existing usages remain valid.
  - `get()` resolves `undefined` instead of an object when gtag returns a non-string value.
