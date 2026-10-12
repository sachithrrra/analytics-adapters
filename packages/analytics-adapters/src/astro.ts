import { createAnalytics, type Analytics } from './index'
import { google, type GoogleOptions } from './google'
import { plausible, type PlausibleOptions } from './plausible'

/**
 * Pageview now, and after every `<ClientRouter />` navigation. Call once from a `<script>` in your layout.
 * Without ClientRouter each page load runs the script again, so it's one pageview per load either way.
 */
export function trackPageviews(analytics: Analytics): Analytics {
  const send = () =>
    analytics.page({
      page_path: location.pathname + location.search,
      page_location: location.href,
      page_title: document.title,
      page_referrer: document.referrer || undefined,
    })
  send()
  // after-swap fires only on client navigations (not the first load), so nothing double-counts.
  document.addEventListener('astro:after-swap', send)
  return analytics
}

/** Zero-config: `googleAnalytics({ id: 'G-XYZ' })` in a layout `<script>`. Returns the instance for `track()`. */
export const googleAnalytics = (opts: GoogleOptions) => trackPageviews(createAnalytics(google(opts)))

/** Zero-config: `plausibleAnalytics({ domain: 'example.com' })` in a layout `<script>`. */
export const plausibleAnalytics = (opts: PlausibleOptions) => trackPageviews(createAnalytics(plausible(opts)))
