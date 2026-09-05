# AgentDrive — Serverless AI-Agent Storage Platform
## Complete Research, Design & Implementation Package — Index

This package is the full response to the brief: research AgentStorage (agentstorage.ai) and its competitive landscape, design a better, simpler, serverless-first alternative ("AgentDrive"), and produce implementation-ready specifications for both Claude Design and Claude Code. It follows the requested **PART 1–26** structure across 10 documents, plus this index. Every claim about AgentStorage or a competitor is tagged **FACT** (verified from a live primary source), **INFERENCE** (reasoned, not verified), or **PROPOSAL** (our own design decision) — see `01` for the full evidence base.

| # | File | Contents (PART numbers) |
|---|---|---|
| 1 | `01-research-and-opportunity.md` | Executive Summary · AgentStorage Analysis · Competitor Analysis (20 products) · Product Opportunity (PART 1–4) |
| 2 | `02-product-and-mvp-scope.md` | Personas · Core Abstraction / Entity Model · MVP-0 / MVP-1 / V2 Scope · Quotas · Billing sequencing (PART 5–6) |
| 3 | `03-ux-architecture-and-screens.md` | Design Principles · Design System · Navigation · Responsive/Accessibility Rules · Full Screen Spec, 27 screens (PART 7–8) |
| 4 | `04-claude-design-prompt.md` | **Standalone, copy-paste prompt for Claude Design** (PART 9) |
| 5 | `05-technical-architecture.md` | Architecture Diagram · D1 vs. Postgres Decision · Data Flows · Search Strategy · D1 Schema · R2 Object-Key Strategy · Full REST API · Full MCP Tool Spec + hosting decision (PART 10–14) |
| 6 | `06-security-privacy-legal.md` | Auth Design · API Key Model · Tenant Isolation · Full Security Control List (CSRF/CORS/XSS/SSRF/path traversal/etc.) · Cookie Policy · Draft Privacy Policy · Draft Terms of Service · Error Catalogue (PART 15–17) |
| 7 | `07-cloudflare-deployment-and-cost.md` | Environments · Wrangler Config · Deployment Steps · Domains/DNS · Observability · Project Structure · Full Cost Model by Growth Stage (PART 18–19) |
| 8 | `08-claude-code-prompt.md` | **Standalone, copy-paste hands-off build prompt for Claude Code** (PART 20) |
| 9 | `09-test-strategy-and-failure-modes.md` | Unit/Integration/E2E Strategy · 21 Security Test Cases · Performance Matrix · Failure-Mode Table · Consistency Model · Backup & Recovery (PART 21–23) |
| 10 | `10-cicd-docs-roadmap-and-recommendation.md` | CI/CD Pipelines · Documentation Plan · 12-Phase Roadmap · 8 ADRs · **Final Recommendation** (PART 24–26 + decision document) |

### How to use this package

- **To have Claude Design build the UI:** hand it `04-claude-design-prompt.md` directly. It's self-contained.
- **To have Claude Code build the product:** hand it `08-claude-code-prompt.md` directly, alongside the rest of this package in the repo (it references files `01`, `05`, `06`, `07`, `09` by name).
- **To review the product/business case:** read `01` → `02` → `10`'s Final Recommendation in that order.
- **To review security/legal before launch:** `06` — the Privacy Policy and Terms of Service are explicitly marked as first drafts requiring qualified legal review.

### One-paragraph summary

AgentStorage is a small, likely solo-built product (Convex + Vercel, no MCP support, no discoverable Terms/Privacy policy, several internal documentation inconsistencies) offering agent-first self-service file storage with hard-capped, transparent pricing — a sound instinct on pricing and on-boarding, undermined by real gaps in agent-native protocol support, folder/versioning capability, and trust signals. The wider 20-product competitive landscape shows the same pattern everywhere: storage products either bolt MCP on as an afterthought (or skip it — the official Anthropic MCP storage servers are archived, unmaintained) or charge a steep markup (5–130x raw object-storage cost) for a memory/RAG layer. AgentDrive is designed to occupy the gap: MCP-native from MVP-1 (not bolted on), general-purpose (files/folders/metadata, not memory- or RAG-only), and built on Cloudflare Workers + R2 + D1 so it costs $5–20/month at the validation stage and scales by usage, never by a rewrite.
