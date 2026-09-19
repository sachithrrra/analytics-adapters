import { createFileRoute } from '@tanstack/react-router'
import { useAnalytics } from 'analytics-adapters/tanstack'

export const Route = createFileRoute('/about')({
  validateSearch: (s: Record<string, unknown>) => ({ x: Number(s.x ?? 0) }),
  component: About,
})

function About() {
  const a = useAnalytics()
  return <button onClick={() => a.track('clicked', { where: 'about' })}>track</button>
}
