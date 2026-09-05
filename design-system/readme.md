# AgentDrive Design System

Design language for **AgentDrive** — persistent, agent-accessible cloud storage for AI agents.

The interface has one job: make it obvious what an agent can reach, with which credential, under which permission, and what it did. Everything else is subordinate to that.

## Visual direction

Infrastructure-grade, not consumer-grade. A light cool-neutral ground, hairline rules instead of shadows, small radii (3–8px), dense 13–14px type, and exactly one accent — deep indigo — reserved for primary actions, the active nav item, and anything an agent touched. A single dark surface exists for code and config; the app itself is never dark.

- **Public Sans** for anything a person wrote.
- **JetBrains Mono** for anything a machine reads or a user must copy exactly: keys, paths, scopes, endpoints, MIME types, agent slugs, event names.
- Colour never carries meaning alone — every status pairs a tone with a word.

## Rules that matter

1. **Agents and humans are visually distinct.** Agent actors render in mono; human actors in sans. Objects an agent wrote carry the `agent` chip.
2. **Least privilege is the default.** Every permission control opens on read-only, with the literal scopes printed on each option.
3. **Secrets appear once.** `ApiKeyDisplay` has a revealed mode for the create response and a masked mode for everywhere else. There is no path back to a full key.
4. **Processing is not complete.** Upload states distinguish stored-and-downloadable from indexed-and-searchable.
5. **Never expose internals.** No stack traces, no object keys, no raw tenant IDs in any surface — errors say what happened and what to do next.
6. **Loading is shaped like the content.** Skeletons in the real layout; no centred spinners on pages that will hold a table.

## Foundations

- `styles.css` — 98 tokens: colour, type scale, 4px space scale, radius, elevation, motion, layout.
- **Colour**, **Typography**, **Space, radius, elevation**, **Icons** — see the Foundations cards.

## Components

Primitives

- `Icon` — 45 single-path stroke glyphs
- `Button`, `IconButton`
- `Input`, `Select`, `Checkbox`, `Switch`
- `Badge`
- `Skeleton`

Structure

- `AppShell` — sidebar nav, workspace switcher, sticky top bar, mobile drawer
- `PageHead`
- `Panel`
- `DataTable`
- `StatTile`, `Meter`
- `Tabs`, `Breadcrumb`
- `Menu`

Feedback

- `Alert`
- `Toast`
- `Modal`, `ConfirmModal`
- `EmptyState`

Developer

- `CodeBlock`

AgentDrive-specific

- `FileCell` — file identity with agent provenance
- `AgentCard` — agent identity, permission and credential health
- `ApiKeyDisplay` — show-once secret, then masked
- `PermissionSelector` — scope presets, least privilege first
- `UploadDropzone`, `UploadItem` — direct-to-storage upload with a real processing state
- `McpToolList` — the ten MVP MCP tools, each with its required scope
- `ActivityRow` — audit events, agent and human actors distinguished

## Status

Foundations and the component library are in place. Screen templates (dashboard, file browser, agents, keys, MCP connection, activity, usage, settings, auth, landing) are next.
