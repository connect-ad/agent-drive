/**
 * Tests for the dashboard.
 *
 * Separate from vite.config.js so the build config stays the build config:
 * nothing here is loaded when `npm run build` runs.
 *
 * jsdom rather than happy-dom because what is under test is focus — which
 * element `document.activeElement` is after a render — and jsdom implements
 * focus and blur semantics more faithfully.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['test/**/*.test.jsx']
  }
});
