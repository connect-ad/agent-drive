# 007 · Browser-verify the screens

**Status:** Open

The 31 screens are **build-verified and spec-checked, not screenshot-verified.**
They were never rendered in a browser during the build.

`npm run build` passing proves the modules resolve and the JSX compiles. It does
not prove anything renders correctly: a clipped heading, a collapsed flex row, an
overlapping drawer, or a blank panel would all compile cleanly.

**To close:** run `npm run dev`, walk every route, and check each `state` variant
(`loading`, `empty`, `no-results`, `quota-danger`, `uploading`, lockout,
reveal-once). Fix what the eye catches, then record the pass here.

Highest-risk screens, because they have the most layout going on: File Browser
(table + drawer + bulk bar + drag overlay), AppShell at mobile widths, and the
Landing hero's two-column grid.
