'use client'
import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { Analytics, Props } from './index'

const Ctx = createContext<Analytics | null>(null)

export function AnalyticsProvider({ analytics, children }: { analytics: Analytics; children?: ReactNode }) {
  useEffect(() => analytics.load(), [analytics])
  return <Ctx.Provider value={analytics}>{children}</Ctx.Provider>
}

export function useAnalytics(): Analytics {
  const a = useContext(Ctx)
  if (!a) throw new Error('useAnalytics must be used inside <AnalyticsProvider>')
  return a
}

/** Fire a pageview whenever `path` changes. Pass your router's current pathname; null/undefined = not ready yet, skip. */
export function usePageview(path: string | null | undefined, props?: Props) {
  const a = useAnalytics()
  useEffect(() => {
    if (!path) return
    a.page({
      page_path: path,
      page_location: location.href,
      page_title: document.title,
      page_referrer: document.referrer || undefined,
      ...props,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])
}
