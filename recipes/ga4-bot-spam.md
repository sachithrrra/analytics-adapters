# Recipe: GA4 bot spam

Spam bots (the China / Singapore / Lanzhou wave, 0s engagement) show up in GA4 two ways:

1. **Bots that load your site** and run your tag. Stop them in the browser with `skip`.
2. **Ghost hits** sent straight to GA's collect endpoint without ever loading the site. No client code can stop these. Tag every real hit with `traffic_type: 'external'` and have GA4 keep only those.

Geo- or ASN-blocking in Cloudflare doesn't fix this: ghost hits never touch your server, and the bots that do load the site rotate through proxies.

## 1. Bot check

`skip` takes any `() => boolean`, so the detection is yours. This one is a starting point; add signals as new bots show up in GA's **screen resolution** report (Explore → Tech details → Screen resolution, look for 0s engagement).

```ts
// lib/is-bot.ts
// Fixed sizes seen from GA4 spam bots, plus any square screen (no real device is square).
// Real 4K monitors at 100% scaling report 3840x2160 too; drop it if that traffic matters.
const BOT_SCREEN = /^(1280x1200|3840x2160|1024x10000|1500x1000|(\d+)x\2)$/

export const isBot = () =>
  navigator.webdriver || BOT_SCREEN.test(`${screen.width}x${screen.height}`)
```

`skip` runs once in the browser, before anything is sent, so `screen` and `navigator` are safe to read even when the adapter is created on the server.

## 2. Wire it up

The same two options work everywhere: `skip` for the bot check, `config` to tag real hits.

**Next.js / TanStack Start**

```tsx
import { GoogleAnalytics } from 'analytics-adapters/next' // or 'analytics-adapters/tanstack'
import { isBot } from '@/lib/is-bot'

<GoogleAnalytics id="G-XXXXXXX" skip={isBot} config={{ traffic_type: 'external' }}>
  {children}
</GoogleAnalytics>
```

**Astro**

```astro
<script>
  import { googleAnalytics } from 'analytics-adapters/astro'
  import { isBot } from '../lib/is-bot'

  googleAnalytics({ id: 'G-XXXXXXX', skip: isBot, config: { traffic_type: 'external' } })
</script>
```

**Core API**

```ts
import { createAnalytics } from 'analytics-adapters'
import { google } from 'analytics-adapters/google'

const analytics = createAnalytics(google({ id: 'G-XXXXXXX', skip: isBot, config: { traffic_type: 'external' } }))
```

When `skip` returns `true`, nothing is sent for that page load: no script, no `page()`, no `track()`. `get()` resolves `undefined`.

## 3. GA4 data filter (once per property)

This is the step that removes ghost hits. Without it, `traffic_type` does nothing.

Admin → Data collection and modification → **Data filters** → Create filter → **Internal traffic**

- Filter operation: **Include only**
- Parameter value: `external`
- Filter state: **Testing** first. After a day, compare in Explore (dimension *Test data filter name*), then switch to **Active**.

Filters only apply from when they're activated. They don't clean past data.

If anything else sends hits to the same property (GTM, Measurement Protocol, a second site), it needs `traffic_type: 'external'` too, or the filter drops it.

## Verify

Open GA4 **Realtime** in one tab and your site in another. Your visit should appear. To test the bot path, use DevTools device emulation at 1280x1200 and reload: nothing should arrive.
