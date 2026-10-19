import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createAnalytics } from './index'
import { google } from './google'

vi.mock('@plausible-analytics/tracker', () => ({ init: vi.fn(), track: vi.fn() }))
import { plausible } from './plausible'
import * as tracker from '@plausible-analytics/tracker'

const dl = () => (window as any).dataLayer as IArguments[]

describe('google adapter', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    delete (window as any).dataLayer
  })

  it('load is idempotent and disables auto page_view', () => {
    const a = createAnalytics(google({ id: 'G-X' }))
    a.load()
    a.load()
    expect(document.querySelectorAll('script').length).toBe(1)
    expect(document.querySelector('script')!.src).toContain('gtag/js?id=G-X')
    const config = dl().find((args) => args[0] === 'config')!
    expect(Array.from(config)).toEqual(['config', 'G-X', { send_page_view: false }])
  })

  it('track and page push events', () => {
    const a = createAnalytics(google({ id: 'G-X' }))
    a.load()
    a.track('signup', { plan: 'pro' })
    a.page({ page_path: '/x' })
    const events = dl().filter((args) => args[0] === 'event').map((a) => Array.from(a))
    expect(events).toEqual([
      ['event', 'signup', { plan: 'pro' }],
      ['event', 'page_view', { page_path: '/x' }],
    ])
  })

  it('auto-loads so events never precede config', () => {
    const a = createAnalytics(google({ id: 'G-X' }))
    a.page({ page_path: '/first' })
    const cmds = dl().map((args) => args[0])
    expect(cmds).toEqual(['js', 'config', 'event'])
  })

  it('consent: defaults before config, updates after', () => {
    const a = createAnalytics(google({ id: 'G-X', consent: { analytics_storage: 'denied' } }))
    a.consent({ analytics_storage: 'granted' })
    const consent = dl().filter((args) => args[0] === 'consent').map((a) => Array.from(a))
    expect(consent).toEqual([
      ['consent', 'default', { analytics_storage: 'denied' }],
      ['consent', 'update', { analytics_storage: 'granted' }],
    ])
    expect(dl().map((args) => args[0]).indexOf('consent')).toBe(0)
  })

  it('defer waits for idle; defer:false injects immediately', () => {
    let idle: (() => void) | undefined
    ;(window as any).requestIdleCallback = (cb: () => void) => (idle = cb)
    createAnalytics(google({ id: 'G-D' })).load()
    expect(document.querySelector('script')).toBeNull()
    idle!()
    expect(document.querySelector('script')!.src).toContain('G-D')
    createAnalytics(google({ id: 'G-E', defer: false })).load()
    expect(document.querySelectorAll('script').length).toBe(2)
    delete (window as any).requestIdleCallback
  })

  it('get resolves via gtag callback, undefined when unsupported', async () => {
    const a = createAnalytics(google({ id: 'G-X' }))
    const p = a.get('client_id')
    const call = dl().find((args) => args[0] === 'get')!
    expect(Array.from(call).slice(0, 3)).toEqual(['get', 'G-X', 'client_id'])
    call[3]('abc.123')
    expect(await p).toBe('abc.123')
    expect(await createAnalytics({ load() {}, page() {}, track() {} }).get('client_id')).toBeUndefined()
  })

  it('config params ride on every config call; identify never sends a page_view', () => {
    const a = createAnalytics(google({ id: 'G-X', config: { traffic_type: 'external' } }))
    a.identify('u1')
    const configs = dl().filter((args) => args[0] === 'config').map((a) => Array.from(a))
    expect(configs).toEqual([
      ['config', 'G-X', { traffic_type: 'external', send_page_view: false }],
      ['config', 'G-X', { traffic_type: 'external', send_page_view: false, user_id: 'u1' }],
    ])
  })

  it('skip sends nothing when true, works normally otherwise', () => {
    const a = createAnalytics(google({ id: 'G-B', skip: () => true }))
    a.page({ page_path: '/x' })
    a.track('signup')
    expect(document.querySelector('script')).toBeNull()
    expect((window as any).dataLayer).toBeUndefined()
    createAnalytics(google({ id: 'G-H', skip: () => false })).page({ page_path: '/x' })
    expect(dl().map((args) => args[0])).toEqual(['js', 'config', 'event'])
  })

  it('fans out to multiple adapters', () => {
    const calls: string[] = []
    const fake = (n: string) => ({ load: () => calls.push(n + ':load'), page: () => {}, track: () => calls.push(n + ':track') })
    const a = createAnalytics([fake('a'), fake('b')])
    a.load()
    a.track('x')
    expect(calls).toEqual(['a:load', 'b:load', 'a:track', 'b:track'])
  })
})

describe('plausible adapter', () => {
  const tick = () => new Promise((r) => setTimeout(r, 0))
  beforeEach(() => vi.clearAllMocks())

  it('inits without auto pageviews, orders and stringifies events', async () => {
    const a = createAnalytics(plausible({ domain: 'example.com', defer: false }))
    a.page({ page_path: '/x', page_location: 'https://example.com/x', page_title: 't', extra: 1 })
    a.track('signup', { plan: 'pro', n: 2 })
    a.track('bare')
    await tick()
    expect(tracker.init).toHaveBeenCalledWith({ domain: 'example.com', autoCapturePageviews: false })
    expect(vi.mocked(tracker.track).mock.calls).toEqual([
      ['pageview', { url: 'https://example.com/x', props: { extra: '1' } }],
      ['signup', { props: { plan: 'pro', n: '2' } }],
      ['bare', {}],
    ])
  })

  it('defer waits for idle', async () => {
    let idle: (() => void) | undefined
    ;(window as any).requestIdleCallback = (cb: () => void) => (idle = cb)
    createAnalytics(plausible({ domain: 'd' })).track('x')
    await tick()
    expect(tracker.init).not.toHaveBeenCalled()
    idle!()
    await tick()
    expect(tracker.track).toHaveBeenCalledWith('x', {})
    delete (window as any).requestIdleCallback
  })
})

describe('astro', () => {
  it('pageview on load and on each ClientRouter swap', async () => {
    const { trackPageviews } = await import('./astro')
    const page = vi.fn()
    trackPageviews({ page } as any)
    expect(page).toHaveBeenCalledTimes(1)
    history.pushState({}, '', '/next?q=1')
    document.dispatchEvent(new Event('astro:after-swap'))
    expect(page).toHaveBeenCalledTimes(2)
    expect(page.mock.calls[1][0].page_path).toBe('/next?q=1')
  })
})
