'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useState, type ReactNode } from 'react'
import { createAnalytics, type Analytics } from './index'
import { google, type GoogleOptions } from './google'
import { plausible, type PlausibleOptions } from './plausible'
import { AnalyticsProvider, usePageview } from './react'

function Pageview() {
  // Pages Router: both return null on first render before the router is ready.
  const path = usePathname() as string | null
  const qs = useSearchParams()?.toString()
  usePageview(path ? (qs ? `${path}?${qs}` : path) : null)
  return null
}

/** Works in app/layout.tsx (App Router) and pages/_app.tsx (Pages Router). Tracks every client navigation. */
export function Analytics({ analytics, children }: { analytics: Analytics; children?: ReactNode }) {
  return (
    <AnalyticsProvider analytics={analytics}>
      {/* useSearchParams() needs a Suspense boundary or `next build` fails on static routes. */}
      <Suspense fallback={null}>
        <Pageview />
      </Suspense>
      {children}
    </AnalyticsProvider>
  )
}

/** Zero-config: `<GoogleAnalytics id="G-XYZ" />` in the root layout. */
export function GoogleAnalytics({ children, ...opts }: GoogleOptions & { children?: ReactNode }) {
  const [analytics] = useState(() => createAnalytics(google(opts)))
  return <Analytics analytics={analytics}>{children}</Analytics>
}

export { useAnalytics } from './react'

/** Zero-config: `<PlausibleAnalytics domain="example.com" />` in the root layout. */
export function PlausibleAnalytics({ children, ...opts }: PlausibleOptions & { children?: ReactNode }) {
  const [analytics] = useState(() => createAnalytics(plausible(opts)))
  return <Analytics analytics={analytics}>{children}</Analytics>
}
