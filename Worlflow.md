                    COWORK
                      │
                      │ Research
                      │ Product analysis
                      │ Architecture
                      │ UX specification
                      │ API specification
                      │ Security
                      │ Test cases
                      ▼
              ┌──────────────────┐
              │ HANDOFF PACKAGE  │
              │                  │
              │ /docs/product    │
              │ /docs/design     │
              │ /docs/architecture│
              │ /docs/api        │
              │ /docs/security   │
              │ /docs/testing    │
              └────────┬─────────┘
                       │
                       │ Claude Code reads
                       ▼
                 CLAUDE CODE
                       │
              ┌────────┴────────┐
              │                 │
           PLAN             IMPLEMENT
              │                 │
              ▼                 ▼
          TODO/STATE       Code + Tests
                                │
                                ▼
                         Cloudflare/R2/D1
                                │
                                ▼
                           QA / Fix / Deploy