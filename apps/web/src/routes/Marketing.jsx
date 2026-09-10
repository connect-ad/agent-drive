import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, Badge, CodeBlock, Tabs, Switch, Panel } from '../components/index.js';
import { useAuth } from '../lib/auth.jsx';

/**
 * 8.1 Landing · 8.2 Pricing — MVP-0.
 * Static marketing. The only stateful bits are the hero code tabs and the
 * billing toggle, which is inert until Stripe ships and says so plainly rather
 * than pretending to work.
 */

const SNIPPETS = {
  curl: `# Give an agent a scoped key, then let it write
curl -X POST https://api.agentdisk.io/v1/files \\
  -H "Authorization: Bearer $AGENTDISK_KEY" \\
  -d '{"path":"memory/2026-03-05.md","size":812}'

# => 201 Created
# { "id": "file_8Kq2xR", "path": "memory/2026-03-05.md",
#   "status": "processing", "agent": "research-assistant" }`,
  mcp: `{
  "mcpServers": {
    "agentdisk": {
      "url": "https://mcp.agentdisk.io/v1",
      "headers": { "Authorization": "Bearer ad_live_..." }
    }
  }
}`,
  python: `from agentdisk import Client

drive = Client(api_key=os.environ["AGENTDISK_KEY"])
drive.files.create("memory/2026-03-05.md", body=notes)

for f in drive.files.search("competitor pricing"):
    print(f.path, f.size)`,
  ts: `import { AgentDisk } from "@agentdisk/sdk";

const drive = new AgentDisk({ apiKey: process.env.AGENTDISK_KEY });
await drive.files.create("memory/2026-03-05.md", { body: notes });

const hits = await drive.files.search("competitor pricing");`
};

const FEATURES = [
  { icon: 'bolt', title: 'REST that reads like a filesystem', body: 'Files, folders and metadata over plain HTTP. No SDK required, no bespoke object model to learn.' },
  { icon: 'terminal', title: 'MCP-native, not bolted on', body: 'Ten MCP tools from MVP-1, each carrying the scope it needs. Your agent connects with a config block, not a client library.' },
  { icon: 'shield', title: 'Scoped keys, least privilege', body: 'Every credential names its operations and its path prefix. Read-only is the default on every create form.' }
];

const STEPS = [
  { n: 1, title: 'Create a workspace', body: 'One workspace per project. It gets a stable ID that never changes, even if you rename it.' },
  { n: 2, title: 'Get a scoped API key', body: 'Choose read / write / delete / list and an optional path prefix. The key is shown exactly once.' },
  { n: 3, title: 'Your agent reads and writes files', body: 'Over REST or MCP. Everything it touches is attributed to it in the audit log.' }
];

const USE_CASES = [
  { title: 'Agent memory & journals', body: 'Give a long-running agent somewhere durable to keep notes between sessions.', replaces: 'Replaces: a Postgres table you did not want to own' },
  { title: 'Content pipelines', body: 'Drafts, revisions and assets moving between specialised agents.', replaces: 'Replaces: S3 plus glue code' },
  { title: 'Automation artifacts', body: 'Reports, exports and screenshots produced by scheduled runs.', replaces: 'Replaces: emailing yourself zip files' },
  { title: 'Human-in-the-loop approvals', body: 'An agent writes; a human opens the dashboard and sees exactly what changed.', replaces: 'Replaces: screenshots in Slack' },
  { title: 'Multi-agent access control', body: 'Separate sub-keys per agent, each restricted to its own path prefix.', replaces: 'Replaces: one shared root credential' },
  { title: 'Webhook-driven workflows', body: 'Fire downstream jobs the moment an object lands or finishes processing.', replaces: 'Replaces: polling on a timer' }
];

export function Nav() {
  const { user } = useAuth();
  return (
    <nav className="mk__nav">
      <span className="row" style={{ gap: 'var(--s-4)' }}>
        <span className="auth__logo" aria-hidden="true">A</span>
        <span className="auth__wordmark">AgentDisk</span>
      </span>
      <span className="mk__navlinks">
        <Link to="/docs">Docs</Link>
        <Link to="/pricing">Pricing</Link>
        {user ? (
          <Button size="sm" as={Link} to="/app">Open dashboard</Button>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Button size="sm" as={Link} to="/signup">Get started</Button>
          </>
        )}
      </span>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mk__foot">
      <div className="mk__wrap row" style={{ gap: 'var(--s-7)', flexWrap: 'wrap' }}>
        <span>© 2026 AgentDisk</span>
        <span className="toolbar__spacer" />
        <Link to="/docs">Docs</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}

export function Landing() {
  const [tab, setTab] = useState('curl');
  return (
    <div className="mk">
      <Nav />
      <div className="mk__wrap">
        <section className="mk__hero">
          <div>
            <h1 className="mk__h1">Persistent storage your agents can actually use.</h1>
            <p className="mk__lead">
              Files, folders, and metadata for AI agents — over REST and MCP. Scoped
              credentials, predictable pricing, zero servers to run.
            </p>
            <div className="mk__ctas">
              <Button size="lg" as={Link} to="/signup">Start building free</Button>
              <Button size="lg" variant="secondary" as={Link} to="/docs" iconRight={<Icon name="chevronRight" size={15} />}>
                Read the docs
              </Button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'curl', label: 'curl' },
                { value: 'mcp', label: 'MCP' },
                { value: 'python', label: 'Python' },
                { value: 'ts', label: 'TypeScript' }
              ]}
            />
            <CodeBlock code={SNIPPETS[tab]} filename={tab === 'mcp' ? 'claude_desktop_config.json' : undefined} />
          </div>
        </section>
      </div>

      <div className="mk__wrap">
        <section className="mk__section">
          <p className="mk__eyebrow">Built for agents</p>
          <h2 className="mk__h2">Not a consumer drive with an API bolted on.</h2>
          <div className="mk__grid3">
            {FEATURES.map(f => (
              <div className="mk__card" key={f.title}>
                <span style={{ color: 'var(--accent)' }}><Icon name={f.icon} size={19} /></span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mk__section">
          <p className="mk__eyebrow">How it works</p>
          <h2 className="mk__h2">Three steps, about four minutes.</h2>
          <div className="mk__grid3">
            {STEPS.map(s => (
              <div className="mk__card" key={s.n}>
                <div className="mk__step">
                  <span className="mk__stepno" aria-hidden="true">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p style={{ marginTop: 'var(--s-3)' }}>{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mk__section">
          <p className="mk__eyebrow">Use cases</p>
          <h2 className="mk__h2">What people actually build with it.</h2>
          <div className="mk__grid3">
            {USE_CASES.map(u => (
              <div className="mk__card" key={u.title}>
                <h3>{u.title}</h3>
                <p>{u.body}</p>
                <span className="mk__replaces">{u.replaces}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mk__band">
        <div className="mk__wrap">
          <h2 className="mk__h2">No credit card. No servers. Just an API key.</h2>
          <div className="mk__ctas" style={{ justifyContent: 'center' }}>
            <Button size="lg" as={Link} to="/signup">Create a free workspace</Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const PLANS = [
  {
    name: 'Free', price: '$0', per: 'forever', cta: 'Start free', popular: false,
    feats: ['1 GB storage', '1,000 files', '10,000 requests / month', '1 agent', 'REST API', 'Community support']
  },
  {
    name: 'Pro', price: '$20', per: 'per month', cta: 'Start free trial', popular: true,
    feats: ['10 GB storage', '10,000 files', '100,000 requests / month', 'Unlimited agents', 'REST + MCP', 'Webhooks', 'Email support']
  },
  {
    name: 'Team', price: '$80', per: 'per month', cta: 'Talk to us', popular: false,
    feats: ['100 GB storage', '100,000 files', '1M requests / month', 'Members & roles', 'SSO (coming soon)', 'Audit export', 'Priority support']
  }
];

const FAQ = [
  { q: 'What happens if I hit a limit?', a: "Writes against that metric start returning a 429 and the dashboard shows a limit banner. Nothing is deleted, nothing is charged — you either free up room or move up a plan." },
  { q: 'Can I change plans anytime?', a: 'Yes, up or down, effective immediately. Downgrading below your current usage keeps your data readable but blocks new writes until you are back under the cap.' },
  { q: 'Is there a free tier forever?', a: 'Yes. The Free plan is not a trial. It is hard-capped, so it can never generate a bill.' },
  { q: 'How is storage measured?', a: 'Bytes actually stored, measured hourly and averaged over the period. Deleted files stop counting once they leave the 30-day trash window.' },
  { q: 'Do you charge for egress?', a: 'Every plan includes a generous egress allowance. Past it you are rate-limited, not billed — hard caps mean no surprise invoices.' }
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="mk">
      <Nav />
      <div className="mk__wrap">
        <section className="mk__section" style={{ borderTop: 0 }}>
          <p className="mk__eyebrow">Simple, hard-capped pricing</p>
          <h2 className="mk__h2">You&rsquo;ll never get a surprise bill.</h2>
          <p className="mk__lead">
            Every plan has clear limits. Hit one, and you&rsquo;ll get a friendly
            heads-up — never an unexpected charge.
          </p>

          <div className="row" style={{ gap: 'var(--s-5)', marginTop: 'var(--s-8)' }}>
            <Switch label="Annual billing" checked={annual} onChange={() => setAnnual(a => !a)} />
            <Badge>2 months free</Badge>
            <span className="ad-meta">Annual billing available at launch.</span>
          </div>

          {/* Semantic group: these are alternatives, not decorative cards. */}
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="ad-label" style={{ marginTop: 'var(--s-8)' }}>Choose a plan</legend>
            <div className="mk__grid3">
              {PLANS.map(p => (
                <div className={['mk__plan', p.popular ? 'mk__plan--pop' : ''].filter(Boolean).join(' ')} key={p.name}>
                  <div className="row" style={{ gap: 'var(--s-4)' }}>
                    <h3 style={{ fontSize: 'var(--t-16)', fontWeight: 'var(--w-semi)', color: 'var(--ink)' }}>{p.name}</h3>
                    {p.popular ? <Badge tone="accent">Most popular</Badge> : null}
                  </div>
                  <div>
                    <span className="mk__price">{p.price}</span>
                    <span className="ad-meta" style={{ marginLeft: 'var(--s-3)' }}>{p.per}</span>
                  </div>
                  <Button full variant={p.popular ? 'primary' : 'secondary'} as={Link} to="/signup">{p.cta}</Button>
                  <ul className="mk__feats">
                    {p.feats.map(f => (
                      <li key={f}>
                        <span style={{ color: 'var(--ok)', flex: 'none', marginTop: 2 }}><Icon name="check" size={13} /></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="mk__section">
          <h2 className="mk__h2">Questions</h2>
          <div style={{ marginTop: 'var(--s-7)' }}>
            {FAQ.map(f => (
              <details className="mk__faq" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <section className="mk__band">
        <div className="mk__wrap">
          <h2 className="mk__h2">Start on Free. Move up only when you need to.</h2>
          <div className="mk__ctas" style={{ justifyContent: 'center' }}>
            <Button size="lg" as={Link} to="/signup">Create a free workspace</Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
