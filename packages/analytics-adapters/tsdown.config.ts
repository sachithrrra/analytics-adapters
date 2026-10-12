import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/google.ts', 'src/plausible.ts', 'src/react.tsx', 'src/next.tsx', 'src/tanstack.tsx', 'src/astro.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  // Public types reference the ambient `Gtag` namespace; consumers need the directive to resolve it.
  banner: { dts: '/// <reference types="gtag.js" />' },
  external: ['react', 'next/navigation', '@tanstack/react-router', '@plausible-analytics/tracker'],
})
