import { describe, expect, it, beforeEach } from 'vitest'
import { createAnalytics } from './index'
import { google } from './google'

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

  it('fans out to multiple adapters', () => {
    const calls: string[] = []
    const fake = (n: string) => ({ load: () => calls.push(n + ':load'), page: () => {}, track: () => calls.push(n + ':track') })
    const a = createAnalytics([fake('a'), fake('b')])
    a.load()
    a.track('x')
    expect(calls).toEqual(['a:load', 'b:load', 'a:track', 'b:track'])
  })
})
