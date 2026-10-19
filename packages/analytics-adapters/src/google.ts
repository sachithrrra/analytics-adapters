/// <reference types="gtag.js" />
import type { Adapter, Consent } from './index'

const GET_TIMEOUT = 3000

export type GoogleOptions = {
  /** GA4 measurement ID, e.g. `G-XXXXXXX`. */
  id: string
  /** CSP nonce applied to the injected script tag. */
  nonce?: string
  /** Consent Mode defaults, pushed before config. Update later with `analytics.consent()`. */
  consent?: Consent
  /** Inject the script when the browser is idle (default). `false` injects immediately. */
  defer?: boolean
  /** Extra `gtag('config')` params sent with every hit, e.g. `{ traffic_type: 'external' }`. */
  config?: Gtag.ConfigParams & Gtag.CustomParams
  /** Runs once in the browser before load; return `true` to send nothing this page load (e.g. bot detection). */
  skip?: () => boolean
}

export function google({ id, nonce, consent, defer = true, config, skip }: GoogleOptions): Adapter {
  // send_page_view:false on every config call so page() is the single source of pageviews (no double count on SPA nav).
  const base = { ...config, send_page_view: false }
  let off = false
  // gtag must push `arguments`, not an array: GA reads it as an Arguments object.
  const gtag: Gtag.Gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    if (!off) (window as any).dataLayer.push(arguments)
  }

  const track: Adapter['track'] = (name, props) => gtag('event', name, props)

  return {
    load() {
      // Checked here, not in google(): the adapter may be created on the server where there's no screen.
      if (skip?.()) return void (off = true)
      ;(window as any).dataLayer ||= []
      if (consent) gtag('consent', 'default', consent)
      gtag('js', new Date())
      gtag('config', id, base)
      // Events queue in dataLayer, so the script itself can wait for idle without losing anything.
      const inject = () => {
        const s = document.createElement('script')
        s.async = true
        s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
        if (nonce) s.nonce = nonce
        document.head.appendChild(s)
      }
      const idle = defer && (window as any).requestIdleCallback
      idle ? idle(inject, { timeout: 2000 }) : inject()
    },
    track,
    page: (props) => track('page_view', props),
    identify(userId, traits) {
      gtag('config', id, { ...base, user_id: userId, ...traits })
    },
    consent: (state) => gtag('consent', 'update', state),
    get: (field) =>
      new Promise((resolve) => {
        // gtag never calls back when the script is blocked (adblock/CSP); don't hang the caller.
        setTimeout(resolve, GET_TIMEOUT)
        gtag('get', id, field, (v) => resolve(typeof v === 'string' ? v : undefined))
      }),
  }
}
