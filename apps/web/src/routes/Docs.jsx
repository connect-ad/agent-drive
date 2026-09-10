import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, CodeBlock, Badge } from '../components/index.js';
import { Nav, Footer } from './Marketing.jsx';

/**
 * A quickstart, not the documentation site.
 *
 * Doc 03 §8.31 lists a full docs site as an intentionally separate build,
 * generated from `openapi.yaml` so it cannot drift from the deployed API. This
 * page is not that. It exists because the marketing nav has linked to /docs
 * since the landing page was written and, until now, that link led nowhere.
 *
 * Everything below is restricted to what the API actually does today. Where a
 * surface is designed but unbuilt — the MCP server most of all — it is marked
 * as such rather than described in the present tense, because documentation
 * that promises endpoints which answer 404 is worse than no documentation.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://api-dev.agentdisk.io';

const UPLOAD = `curl -X POST ${API_BASE}/v1/files \\
  -H "Authorization: Bearer $AGENTDISK_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "path": "/reports/q1.pdf",
    "contentType": "application/pdf",
    "mode": "inline",
    "content": "<base64 bytes>"
  }'`;

const LIST = `curl ${API_BASE}/v1/files \\
  -H "Authorization: Bearer $AGENTDISK_KEY"`;

const WHOAMI = `curl ${API_BASE}/v1/whoami \\
  -H "Authorization: Bearer $AGENTDISK_KEY"`;

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      <h2 className="ad-h2">{title}</h2>
      {children}
    </section>
  );
}

function Row({ method, path, note }) {
  return (
    <tr>
      <td style={{ padding: 'var(--s-2) var(--s-4)', whiteSpace: 'nowrap' }}>
        <code>{method}</code>
      </td>
      <td style={{ padding: 'var(--s-2) var(--s-4)', whiteSpace: 'nowrap' }}>
        <code>{path}</code>
      </td>
      <td style={{ padding: 'var(--s-2) var(--s-4)', color: 'var(--ink-2)' }}>{note}</td>
    </tr>
  );
}

export default function Docs() {
  return (
    <div className="mk">
      <Nav />
      <main className="mk__wrap" style={{ maxWidth: '80ch', padding: 'var(--s-9) var(--s-6)' }}>
        <h1 className="mk__h1" style={{ marginBottom: 'var(--s-3)' }}>Quickstart</h1>
        <p className="mk__lede" style={{ marginBottom: 'var(--s-8)' }}>
          Storage your agents can use directly — scoped keys, a REST API, and a dashboard where a
          human can see everything an agent did.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-9)' }}>
          <Section id="base" title="Base URL">
            <CodeBlock language="text" code={API_BASE} />
            <p style={{ color: 'var(--ink-2)' }}>
              This is the development deployment. Every response is JSON, including errors, which
              carry a <code>code</code> and a <code>requestId</code> — quote the request ID if you
              ever need to ask us what happened.
            </p>
          </Section>

          <Section id="auth" title="Two kinds of credential">
            <p style={{ color: 'var(--ink-2)' }}>
              <strong>API keys</strong> are for agents. A key is bound to one workspace when it is
              minted and cannot reach another, ever — that binding is what makes handing a key to an
              autonomous process reasonable. Keys carry scopes, so a key that only needs to read
              cannot write.
            </p>
            <p style={{ color: 'var(--ink-2)' }}>
              <strong>Sign-in sessions</strong> are for people, and are what the dashboard uses.
              Because a person belongs to an account rather than to a single workspace, browser
              calls name the workspace they mean with a <code>?workspaceId=</code> parameter. Agents
              never do this — their key already says which workspace it belongs to.
            </p>
            <Alert tone="warn" title="Never put a key in a URL">
              Credentials go in the <code>Authorization</code> header. A key sent in a query string
              is rejected outright rather than ignored, because by the time we see it, it is already
              in server logs and your shell history — a loud failure is the only thing that gets it
              rotated.
            </Alert>
          </Section>

          <Section id="start" title="Getting a key">
            <ol style={{ color: 'var(--ink-2)', lineHeight: 1.8, paddingLeft: 'var(--s-6)' }}>
              <li><Link to="/signup">Create an account</Link> — a workspace is made for you.</li>
              <li>Open <strong>API keys</strong> in the sidebar and mint one.</li>
              <li>Copy it immediately. It is shown once and stored only as a hash.</li>
            </ol>
            <p style={{ color: 'var(--ink-2)' }}>
              Agents can also provision their own trial workspace without a human account, which is
              what <Link to="/sandbox">the sandbox</Link> demonstrates.
            </p>
          </Section>

          <Section id="first" title="Your first calls">
            <p style={{ color: 'var(--ink-2)' }}>Confirm the key works and see what it can do:</p>
            <CodeBlock language="bash" code={WHOAMI} />
            <p style={{ color: 'var(--ink-2)' }}>
              Upload a file. Files at or below 1&nbsp;MB can be sent inline; larger ones get a
              presigned URL so the bytes go straight to storage and never pass through us.
            </p>
            <CodeBlock language="bash" code={UPLOAD} />
            <CodeBlock language="bash" code={LIST} />
          </Section>

          <Section id="endpoints" title="What exists today">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--t-13)' }}>
                <tbody>
                  <Row method="GET" path="/v1/healthz" note="Public. No credential read." />
                  <Row method="GET" path="/v1/whoami" note="Who this credential is, and its limits." />
                  <Row method="GET" path="/v1/workspaces" note="Workspaces you can reach. Session only." />
                  <Row method="POST" path="/v1/workspaces" note="Create one, or provision a sandbox." />
                  <Row method="POST" path="/v1/files" note="Upload, inline or presigned." />
                  <Row method="POST" path="/v1/files/:id/complete" note="Finish a presigned upload." />
                  <Row method="GET" path="/v1/files" note="List, with cursor pagination." />
                  <Row method="GET" path="/v1/files/:id" note="Metadata for one file." />
                  <Row method="GET" path="/v1/files/:id/download" note="A short-lived download URL." />
                  <Row method="PATCH" path="/v1/files/:id" note="Rename, retag, move between folders." />
                  <Row method="POST" path="/v1/files/:id/move" note="Move. Checks both source and destination." />
                  <Row method="POST" path="/v1/files/:id/copy" note="Copy. Needs read on the source." />
                  <Row method="DELETE" path="/v1/files/:id" note="Soft delete, recoverable." />
                  <Row method="POST" path="/v1/files/:id/restore" note="Undo a soft delete." />
                  <Row method="POST" path="/v1/folders" note="Create a folder." />
                  <Row method="GET" path="/v1/folders" note="List folders." />
                  <Row method="DELETE" path="/v1/folders/:id" note="Delete; ?recursive=true for a subtree." />
                  <Row method="POST" path="/v1/me/logout-all" note="End your other sessions. Session only." />
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="mcp" title={<>MCP server <Badge tone="warn">Not yet</Badge></>}>
            <p style={{ color: 'var(--ink-2)' }}>
              The MCP surface is designed — ten tools over the same storage, the same scopes, the
              same isolation — but is not built yet, and <code>mcp-dev.agentdisk.io</code> does not
              answer tool calls today. It is listed here so nobody wires against it expecting it to
              work. The REST API above is the whole of what is live.
            </p>
          </Section>

          <Section id="errors" title="Errors">
            <CodeBlock
              language="json"
              code={`{
  "error": {
    "code": "FORBIDDEN",
    "message": "This workspace is unavailable.",
    "requestId": "req_01M1WS8YJC6NF0MXJ8TR0PZZZH"
  }
}`}
            />
            <p style={{ color: 'var(--ink-2)' }}>
              Authentication failures all return one identical body. An unknown key, a revoked key,
              an expired key and a key whose agent was disabled are deliberately
              indistinguishable — a response that told you which would tell an attacker which of
              their guesses was a real key.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
