# 003 · Scaffold `apps/web`

**Status:** Done — 2026-09-05

Vite 6 + React 18.3.1 + react-router-dom, following the structure doc 07 §18.6
prescribes.

- `src/components/` — vendored copy of the design system (64 `.jsx` / `.d.ts`).
  The `card.html` previews stay upstream in `design-system/`.
- `src/components/index.js` — **generated** barrel: 32 components plus
  `iconNames`, `mcpTools`, `permissionPresets`. Regenerate from
  `design-system/_ds_manifest.json`; never hand-edit.
  `_adherence.oxlintrc.json` forbids importing component internals, so every
  screen imports from this barrel only.
- `src/styles.css` — the design system's 98 tokens, imported once in `main.jsx`.

`npm install && npm run build` clean.
