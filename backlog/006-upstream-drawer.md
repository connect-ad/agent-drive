# 006 · Upstream the Drawer into the design system

**Status:** Open

Screen 8.10 (File Details) requires a right-side drawer. The design system has
no `Drawer` component and no `.drawer` CSS — confirmed by checking both
`_ds_manifest.json` and `styles.css`.

To unblock 8.9/8.10, one was built at
[`apps/web/src/components-local/Drawer.jsx`](../apps/web/src/components-local/Drawer.jsx),
deliberately in a separate folder so it is never confused with the vendored
design system. It uses design-system tokens only, is `role="dialog"`
`aria-modal`, traps focus, restores focus to the trigger on close, and becomes a
full-screen sheet below 768px.

**The problem:** it exists only in this app. The Claude Design agent cannot use
it, so any screen that agent designs will not have a drawer available.

**To close:** add `Drawer` to the Claude Design project `agent-storage-mcp`,
re-import via the design-sync flow, then delete `components-local/Drawer.jsx` and
switch the import in `FileBrowser.jsx` to the barrel.

Also open from the same audit: **Tooltip** has styling (`.tip`) but no
positioning/trigger component.
