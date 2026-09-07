import React, { useState, useMemo } from 'react';
import {
  PageHead, Panel, Select, Input, Button, Icon, Badge, ActivityRow,
  EmptyState, Skeleton, CodeBlock
} from '../components/index.js';

/**
 * 8.20 Activity / Audit Log — MVP-1
 * URL: /w/{ws}/activity
 *
 * Rows expand inline (never navigate) to show raw event detail for support and
 * security work. Per Principle 5 the expansion still shows no raw tenant IDs or
 * object keys — request id, IP and client string only.
 *
 * States: loading | populated | empty-filtered | empty-none
 */

const EVENTS = [
  { id: 'e1', action: 'file.upload', actor: 'research-assistant', actorType: 'agent', resource: '/research/2026-q1/market-sizing.pdf', time: '12m', status: 'ok', ip: '203.0.113.42', client: 'agentdisk-python/0.4.1', req: 'req_8Kq2xR4mN7' },
  { id: 'e2', action: 'mcp.call', actor: 'research-assistant', actorType: 'agent', resource: 'search_files', time: '14m', status: 'ok', detail: 'Query: competitor pricing · 8 results', ip: '203.0.113.42', client: 'claude-desktop/1.9.0 (mcp)', req: 'req_3fL9wQ2bV6' },
  { id: 'e3', action: 'auth.denied', actor: 'report-writer', actorType: 'agent', resource: 'delete_file', time: '1h', status: 'denied', detail: 'Missing scope files:delete · rejected before reaching storage', ip: '198.51.100.7', client: 'agentdisk-node/0.3.0', req: 'req_5xT1yH8kD3' },
  { id: 'e4', action: 'key.create', actor: 'Dana Okafor', actorType: 'user', resource: 'report-writer key', time: '3h', status: 'ok', ip: '203.0.113.9', client: 'Chrome/141 on Windows', req: 'req_9bN4jK6pW2' },
  { id: 'e5', action: 'file.delete', actor: 'Dana Okafor', actorType: 'user', resource: '/archive/old-deck.pdf', time: 'Yesterday', status: 'ok', detail: 'Recoverable until 4 April 2026', ip: '203.0.113.9', client: 'Chrome/141 on Windows', req: 'req_2mC7vB5nS8' }
];

export default function ActivityLog({ state = 'populated' }) {
  const loading = state === 'loading';
  const none = state === 'empty-none';

  const [actor, setActor] = useState('all');
  const [action, setAction] = useState('all');
  const [query, setQuery] = useState(state === 'empty-filtered' ? 'nothing-matches-this' : '');
  const [open, setOpen] = useState(null);

  const rows = useMemo(() => {
    if (loading || none) return [];
    return EVENTS.filter(e => {
      if (actor !== 'all' && e.actorType !== actor) return false;
      if (action !== 'all' && e.action.split('.')[0] !== action) return false;
      const q = query.trim().toLowerCase();
      if (q && !(e.resource + e.actor + e.action).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [actor, action, query, loading, none]);

  const filtered = actor !== 'all' || action !== 'all' || query.trim().length > 0;
  const clearFilters = () => { setActor('all'); setAction('all'); setQuery(''); };

  return (
    <>
      <PageHead
        title="Activity"
        subtitle="Every action taken in this workspace, by a person or an agent."
        actions={<Button variant="secondary" icon={<Icon name="download" size={14} />}>Export CSV</Button>}
      />

      <div className="toolbar">
        <Select
          value={actor}
          onChange={e => setActor(e.target.value)}
          options={[
            { value: 'all', label: 'Actor: All' },
            { value: 'user', label: 'Actor: People' },
            { value: 'agent', label: 'Actor: Agents' }
          ]}
        />
        <Select
          value={action}
          onChange={e => setAction(e.target.value)}
          options={[
            { value: 'all', label: 'Action: All' },
            { value: 'file', label: 'Action: Files' },
            { value: 'folder', label: 'Action: Folders' },
            { value: 'key', label: 'Action: Keys' },
            { value: 'agent', label: 'Action: Agents' },
            { value: 'mcp', label: 'Action: MCP calls' },
            { value: 'auth', label: 'Action: Auth' }
          ]}
        />
        <Input
          leadingIcon={<Icon name="search" size={14} style={{ color: 'var(--ink-4)' }} />}
          placeholder="Actor, action or resource"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="toolbar__spacer" />
        <Select
          defaultValue="7d"
          options={[
            { value: '24h', label: 'Last 24 hours' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: 'custom', label: 'Custom range' }
          ]}
        />
      </div>

      <Panel flush title="Events">
        {loading ? (
          <div style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="row" style={{ gap: 'var(--s-5)' }}>
                <Skeleton width={24} height={24} radius={4} />
                <div style={{ flex: 1 }}><Skeleton lines={2} height={9} /></div>
                <Skeleton width={52} height={9} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={<Icon name="search" size={19} />}
              title="No events match your filters."
              actions={<Button size="sm" variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState icon={<Icon name="activity" size={19} />} title="No activity yet">
              Actions your team and agents take will show up here.
            </EmptyState>
          )
        ) : (
          rows.map(e => (
            <div key={e.id}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={open === e.id}
                onClick={() => setOpen(open === e.id ? null : e.id)}
                onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setOpen(open === e.id ? null : e.id); } }}
                style={{ cursor: 'pointer' }}
              >
                <ActivityRow {...e} />
              </div>
              {open === e.id ? (
                <div style={{ padding: 'var(--s-5) var(--s-6)', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                  <div className="row" style={{ gap: 'var(--s-4)', marginBottom: 'var(--s-4)' }}>
                    <Badge tone={e.status === 'denied' ? 'danger' : 'ok'} dot>
                      {e.status === 'denied' ? 'Denied' : 'Allowed'}
                    </Badge>
                    <span className="ad-mono-sm" style={{ color: 'var(--ink-3)' }}>{e.req}</span>
                  </div>
                  <dl className="dl">
                    <dt>Request ID</dt><dd className="ad-mono-sm">{e.req}</dd>
                    <dt>Source IP</dt><dd className="ad-mono-sm">{e.ip}</dd>
                    <dt>Client</dt><dd className="ad-mono-sm">{e.client}</dd>
                    <dt>Resource</dt><dd className="ad-mono-sm">{e.resource}</dd>
                  </dl>
                </div>
              ) : null}
            </div>
          ))
        )}
      </Panel>
    </>
  );
}
