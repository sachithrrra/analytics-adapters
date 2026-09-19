import type { PlausibleConfig } from '@plausible-analytics/tracker'
import type { Adapter, Props } from './index'

export type PlausibleOptions = Omit<PlausibleConfig, 'autoCapturePageviews'> & {
  /** Load the tracker when the browser is idle (default). `false` loads immediately. */
  defer?: boolean
}

// Plausible only accepts string props.
const strings = (p: Props) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]))

/** Wraps the official `@plausible-analytics/tracker`; install it alongside this package. */
export function plausible({ defer = true, ...config }: PlausibleOptions): Adapter {
  let ready: Promise<typeof import('@plausible-analytics/tracker')>
  // track() throws before init(), so every call waits on `ready`; promise order keeps events in sequence.
  const call = (name: string, opts?: Record<string, unknown>) => void ready.then((m) => m.track(name, opts ?? {}))

  return {
    load() {
      ready = new Promise((resolve) => {
        const idle = defer && (window as any).requestIdleCallback
        idle ? idle(resolve, { timeout: 2000 }) : resolve(undefined)
      })
        .then(() => import('@plausible-analytics/tracker'))
        .then((m) => {
          // autoCapturePageviews:false so page() is the single pageview source (no SPA double count).
          m.init({ ...config, autoCapturePageviews: false })
          return m
        })
    },
    track: (name, props) => call(name, props && { props: strings(props) }),
    page(props) {
      const { page_location, page_path, page_title, page_referrer, ...rest }: Props = props ?? {}
      call('pageview', {
        url: page_location ?? page_path,
        props: Object.keys(rest).length ? strings(rest) : undefined,
      })
    },
  }
}
