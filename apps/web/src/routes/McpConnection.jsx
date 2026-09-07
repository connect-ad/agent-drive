import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PageHead, Panel, Tabs, CodeBlock, Badge, Button, Icon, Checkbox, Alert,
  McpToolList, mcpTools, ActivityRow, EmptyState
} from '../components/index.js';

/**
 * 8.18 MCP Connection — MVP-1
 * URL: /w/{ws}/mcp
 *
 * Security default that matters: the config snippet shows <YOUR_API_KEY> unless
 * the user explicitly opts in to embedding their real key, and the warning about
 * that is visible text — not a tooltip.
 *
 * States: no-key | connected-never-used | connected-active
 */

const ENDPOINT = 'https://mcp.agentdisk.io/v1';
// The snippet defaults to a placeholder, never a real-looking key (doc 03).
const REAL_KEY = '';
const PLACEHOLDER = '<YOUR_API_KEY>';

const CLIENTS = [
  { value: 'claude-desktop', label: 'Claude Desktop', file: 'claude_desktop_config.json' },
  { value: 'claude-code', label: 'Claude Code', file: '.mcp.json' },
  { value: 'cursor', label: 'Cursor', file: '.cursor/mcp.json' },
  { value: 'generic', label: 'Generic MCP client', file: 'mcp.json' }
];

// The MCP server is not built, so it has made no calls.
const RECENT = [];

export default function McpConnection({ state = 'connected-active' }) {
  const { ws } = useParams();
  const [client, setClient] = useState('claude-desktop');
  const [includeKey, setIncludeKey] = useState(false);

  const noKey = state === 'no-key';
  const active = state === 'connected-active';
  const current = CLIENTS.find(c => c.value === client);
  const key = includeKey && !noKey ? REAL_KEY : PLACEHOLDER;

  const config = `{
  "mcpServers": {
    "agentdisk": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer ${key}"
      }
    }
  }
}`;

  const toolColumns = mcpTools.map(t => ({ ...t, enabled: t.scope !== 'files:delete' }));

  return (
    <>
      <PageHead
        title="MCP connection"
        subtitle="Connect an agent over the Model Context Protocol."
        meta={
          noKey
            ? <Badge tone="warn" dot>Not connected</Badge>
            : active
              ? <Badge tone="ok" dot pulse>Connected</Badge>
              : <Badge dot>Connected, never used</Badge>
        }
      />

      {noKey ? (
        <Alert
          tone="warn"
          title="No MCP connection yet"
          actions={<Button size="sm" as={Link} to={`/w/${ws}/keys`}>Create an MCP-scoped key</Button>}
        >
          An agent needs a key before it can complete the MCP handshake.
        </Alert>
      ) : null}

      <Panel title="Connect your agent" subtitle="Paste this into your MCP client's config.">
        <Tabs value={client} onChange={setClient} items={CLIENTS.map(c => ({ value: c.value, label: c.label }))} />
        <CodeBlock filename={current.file} code={config} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <Checkbox
            label="Include my API key in this snippet"
            description="Your key will be visible in this snippet. Don't paste it anywhere public."
            checked={includeKey}
            disabled={noKey}
            onChange={() => setIncludeKey(v => !v)}
          />
          {includeKey ? (
            <Alert tone="warn" title="This snippet now contains a live credential">
              Anyone who sees it can act as this agent until the key is revoked.
            </Alert>
          ) : null}
        </div>
      </Panel>

      <Panel flush title="Available tools" subtitle="Every tool names the scope it requires.">
        <McpToolList tools={toolColumns} />
      </Panel>

      <Panel flush title="Recent MCP calls">
        {active
          ? RECENT.map((r, i) => <ActivityRow key={i} {...r} />)
          : (
            <EmptyState
              compact
              icon={<Icon name="terminal" size={19} />}
              title="No MCP calls yet"
            >
              Once your agent connects, you'll see activity here.
            </EmptyState>
          )}
      </Panel>
    </>
  );
}
