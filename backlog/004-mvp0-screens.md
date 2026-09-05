# 004 · Build the MVP-0 screens

**Status:** Done — 2026-09-05

All 24 MVP-0 screens from doc 03 PART 8: landing, pricing, the five auth
screens, dashboard, file browser (absorbing the details drawer, new-folder modal
and upload flow), agents + create + details, API keys + create, usage, settings
general + security, profile, and 404 / 403 / 500.

Every screen takes a `state` prop (`loading`, `empty`, `no-results`,
`quota-danger`, `uploading`, …) so each state the spec names stays reachable
before the API exists. **Delete the prop when wiring real data (see 009).**

Security behaviour is built in rather than decorative: generic login failure with
a lockout countdown, non-committal forgot-password, reveal-once secrets with
mandatory acknowledgment, and typed confirmation for bulk deletes over 5 items.
