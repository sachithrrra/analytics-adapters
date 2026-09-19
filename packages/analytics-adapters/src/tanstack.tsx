import { useLocation } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { createAnalytics, type Analytics } from './index'
import { google, type GoogleOptions } from './google'
import { plausible, type PlausibleOptions } from './plausible'
import { AnalyticsProvider, usePageview } from './react'

function Pageview() {
  const { pathname, searchStr } = useLocation()
  usePageview(pathname + searchStr)
  return null
}

/** Drop into routes/__root.tsx. Loads the provider and tracks every router navigation. */
export function Analytics({ analytics, children }: { analytics: Analytics; children?: ReactNode }) {
  return (
    <AnalyticsProvider analytics={analytics}>
      <Pageview />
      {children}
    </AnalyticsProvider>
  )
}

export { useAnalytics } from './react'

/** Zero-config: `<GoogleAnalytics id="G-XYZ" />` in the root layout. */
export function GoogleAnalytics({ children, ...opts }: GoogleOptions & { children?: ReactNode }) {
  const [analytics] = useState(() => createAnalytics(google(opts)))
  return <Analytics analytics={analytics}>{children}</Analytics>
}

/** Zero-config: `<PlausibleAnalytics domain="example.com" />` in the root layout. */
export function PlausibleAnalytics({ children, ...opts }: PlausibleOptions & { children?: ReactNode }) {
  const [analytics] = useState(() => createAnalytics(plausible(opts)))
  return <Analytics analytics={analytics}>{children}</Analytics>
}
