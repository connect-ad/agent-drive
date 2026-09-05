# 002 · Reconcile brand drift between spec and build

**Status:** Done — 2026-09-05

The written spec and the built system disagreed:

| | Spec said | As built |
|---|---|---|
| Accent | forest green `#2F6F4F` | indigo `oklch(0.475 0.168 262)` |
| Sans | Space Grotesk + Inter | Public Sans |

**Resolution: the code won.** Docs 03 §7.2 and 04 were rewritten to the as-built
values. The 96 verified design-system files were not touched.

Doc 04 was also repurposed — it used to say "build this design system first"; it
now says the system exists, here is how to bind to it, do not rebuild it.

Three gaps were recorded in doc 03 §7.2 at the same time: **Drawer** (missing
entirely — see 006), **Tooltip** (`.tip` styling only, no behaviour), and
**dark mode** (deliberately descoped: "the app itself is never dark").
