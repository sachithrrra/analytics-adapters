export type Props = Record<string, unknown>

/** Google Consent Mode v2 keys; other providers map what they support. */
export type Consent = Partial<
  Record<'analytics_storage' | 'ad_storage' | 'ad_user_data' | 'ad_personalization', 'granted' | 'denied'>
>

export type Adapter = {
  /** Inject the provider script. Called once per adapter by `createAnalytics`. */
  load(): void
  page(props?: Props): void
  track(name: string, props?: Props): void
  identify?(id: string, traits?: Props): void
  consent?(state: Consent): void
  /** Read a provider value, e.g. `client_id`. Resolves `undefined` if unsupported or blocked. */
  get?(field: Field): Promise<string | undefined>
}

export type Field = 'client_id' | 'session_id' | 'gclid' | 'campaign_name' | (string & {})

export type Analytics = Required<Adapter>

/** Fan out to one or more adapters. Every call is a no-op outside the browser. */
export function createAnalytics(adapters: Adapter | Adapter[]): Analytics {
  const list = Array.isArray(adapters) ? adapters : [adapters]
  const loaded = new WeakSet<Adapter>()
  const each = (fn: (a: Adapter) => void) => {
    if (typeof window === 'undefined') return
    for (const a of list) {
      // Auto-load so calls made before load() (e.g. child effects) queue behind the provider's config.
      if (!loaded.has(a)) (loaded.add(a), a.load())
      fn(a)
    }
  }
  return {
    load: () => each(() => {}),
    page: (props) => each((a) => a.page(props)),
    track: (name, props) => each((a) => a.track(name, props)),
    identify: (id, traits) => each((a) => a.identify?.(id, traits)),
    consent: (state) => each((a) => a.consent?.(state)),
    get: (field) =>
      new Promise((resolve) => {
        // First adapter that supports it wins; resolves undefined on the server or if none do.
        let hit = false
        each((a) => hit || !a.get || ((hit = true), a.get(field).then(resolve)))
        if (!hit) resolve(undefined)
      }),
  }
}
