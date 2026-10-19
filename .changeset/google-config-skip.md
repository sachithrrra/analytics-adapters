---
"analytics-adapters": minor
---

Google adapter: `config` option adds `gtag('config')` params to every hit (e.g. `{ traffic_type: 'external' }`), and `skip` (a browser-side predicate, e.g. bot detection) sends nothing for that page load when it returns `true`. `identify()` no longer sends an extra `page_view`.
