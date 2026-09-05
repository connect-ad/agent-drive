# 1 · Build

How to run, build, check and deploy this project. Everything here was observed
on the current tree, not copied from the specification.

---

## Toolchain

| | Version | Note |
|---|---|---|
| Node | v24.13.0 | Observed. No `.nvmrc` or `engines` field pins it. |
| npm | 11.6.2 | |
| Vite | 6.4.3 | `package.json` asks for `^6.0.7` |
| React | 18.3.1 | Pinned exactly — **not** `^`. Deliberate: the design system was compiled against it. |
| react-router-dom | ^6.26.2 | |

`apps/web/package.json` is `"type": "module"`. There is one workspace,
`@agentdrive/web`; the repo is not yet an npm workspaces monorepo, so run npm
from inside `apps/web`, not the root.

---

## Run it

```bash
cd apps/web
npm install       # first time only
npm run dev       # vite dev server
npm run build     # vite build -> dist/, with sourcemaps
npm run preview   # serve the built dist/
```

### Expected build output

Keep this as the regression baseline. A large deviation means something was
pulled in that shouldn't have been:

```
81 modules transformed
dist/index.html                   0.39 kB │ gzip:  0.26 kB
dist/assets/index-*.css          37.10 kB │ gzip:  6.91 kB
dist/assets/index-*.js          271.50 kB │ gzip: 83.18 kB │ map: 977.09 kB
built in ~570ms
```

`dist/` is ~1.3 MB, almost all of it the sourcemap. It is gitignored.

---

## Regenerate the component barrel

`apps/web/src/components/index.js` is **generated** from
`design-system/_ds_manifest.json`. Never hand-edit it. Regenerate after any
re-import of the design system.

The manifest's `components[]` gives 32 entries of `{name, sourcePath}` — that
is the module list, and it currently matches the barrel exactly, 32/32.

**The manifest is not sufficient on its own.** Three modules export named
symbols the manifest does not mention, and a naive manifest-driven generator
silently drops them:

| Module | Extra named export |
|---|---|
| `Icon/Icon.jsx` | `iconNames` |
| `McpToolList/McpToolList.jsx` | `mcpTools` |
| `PermissionSelector/PermissionSelector.jsx` | `permissionPresets` |

So: take the module list from the manifest, then read each source for
additional `export const` / `export function` names. 32 modules, 35 exports.

Verify the barrel still agrees with the manifest:

```bash
node -e "
const m=require('./design-system/_ds_manifest.json'), fs=require('fs');
const b=fs.readFileSync('apps/web/src/components/index.js','utf8');
const inBarrel=[...b.matchAll(/from '\.\/([^']+)'/g)].map(x=>x[1]);
const inManifest=m.components.map(c=>c.sourcePath.replace(/^components\//,''));
console.log('barrel',inBarrel.length,'manifest',inManifest.length);
console.log('missing:',inManifest.filter(p=>!inBarrel.includes(p)).join(', ')||'none');
console.log('extra:  ',inBarrel.filter(p=>!inManifest.includes(p)).join(', ')||'none');
"
```

---

## Check adherence

There is no lint script wired up. `design-system/_adherence.oxlintrc.json` is
the contract; these greps approximate it until oxlint is actually run.

**Know what the contract does and does not cover.** Its rules are oxlint
`no-restricted-syntax` selectors matching `Literal` nodes — so they see **JS and
JSX string literals only. CSS files are never linted.** A token violation in
`app.css` will not be caught by the config, only by review.

Run from `apps/web/src`:

```bash
# 1. Raw hex in hand-written code — must be 0
grep -rnoE "'[^']*#[0-9a-fA-F]{3,8}\b[^']*'" routes components-local App.jsx

# 2. Barrel bypass — must be 0
grep -rn "from '\.\./components/[A-Z]" routes components-local

# 3. px in JS/JSX literals — see calibration below
grep -rnoE "'[^']*[0-9]+px[^']*'" routes components-local App.jsx
```

Current state: **0 raw hex, 0 barrel bypass, 2 px literals.**

### Calibration on the px rule

The rule is `Literal[value=/\b\d+px\b/]` at `warn`. It over-matches, and the
design system trips it **25 times in its own components**, including the exact
idiom in question:

```jsx
borderBottom: '1px solid var(--line)'
```

A `1px` hairline has no token — the space scale starts at 4px and is for
spacing, not border width. So treat the rule as: **px must never carry spacing
or sizing.** Hairline borders matching upstream's idiom are fine. The two
current hits (`routes/ActivityLog.jsx`, `routes/Auth.jsx`) are both hairlines.

`app.css` additionally holds 6 px values the linter cannot see — container
max-widths (`400px`, `1120px`), a fixed `26px` badge, a `1px` rule and an `8px`
blur. All are layout constants with no corresponding token. Leave them; just
don't add spacing in px.

---

## Design-system integrity

`design-system/` is a **byte-verified mirror** of Claude Design project
`d311bfd0` — 96 files, read-only. `apps/web/src/components/` is a vendored copy
of its component sources.

To re-verify after any re-import, compare every local file's byte size against
`list_files` on the remote. Byte size is the only reliable proof: the MCP
channel HTML-escapes bodies, and a decode-order mistake or a literal `\uXXXX`
escape produces a file that looks right and is one or two bytes wrong. See
`.design-sync/NOTES.md` before attempting any transfer.

`.gitattributes` exempts `design-system/**` from EOL conversion. Without it a
re-clone on Windows would rewrite every line ending and void the verification.

---

## Test

**There is no test suite.** No runner, no test files, no `test` script.
Doc 09 specifies 21 security test cases; none are implemented. See
[backlog 010](../backlog/010-test-suite.md).

The screens are build-verified only — they have never been rendered in a
browser ([backlog 007](../backlog/007-browser-verify-screens.md)).

---

## Deploy

**Nothing is deployable yet.** There is no backend, no `wrangler.toml`, no
Cloudflare project, and no CI. The dashboard builds to a static `dist/` but
runs entirely on local mock data.

Doc 07 specifies the intended Cloudflare deployment (Pages for the SPA, Workers
+ D1 + R2 for the API) and doc 10 the CI/CD pipelines. Both are unimplemented —
[backlog 008](../backlog/008-backend.md) blocks all of it.

When that changes, this section is where the real commands go.
