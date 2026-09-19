import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/google.ts', 'src/react.tsx', 'src/next.tsx', 'src/tanstack.tsx'],
  format: 'esm',
  dts: true,
  clean: true,
  external: ['react', 'next/navigation', '@tanstack/react-router'],
})
