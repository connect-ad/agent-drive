import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHead, Panel, Tabs, DataTable, Button, Icon, Badge, Switch, Alert,
  ApiKeyDisplay, ActivityRow, ConfirmModal, EmptyState, Toast, StatTile
} from '../components/index.js';

/**
 * 8.15 Agent Details — MVP-0
 * URL: /w/{ws}/agents/{agentId}
 * Tabs: Overview · Keys · Activity (Activity is MVP-1, shown disabled-empty here).
 * Disabling an agent invalidates all its keys immediately, stated explicitly in
 * the confirm rather than failing silently later.
 */

// Key listing has no endpoint yet.
const KEYS = [];

// Per-agent activity has no endpoint yet.
const ACTIVITY = [];

export default function AgentDetails() {
  const { ws, agentId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [enabled, setEnabled] = useState(true);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [toast, setToast] = useState(null);

  const name = 'Research assistant';

  const keyColumns = [
    { key: 'name', header: 'Name', primary: true },
    { key: 'key', header: 'Key', width: 200, render: r => <ApiKeyDisplay lastFour={r.lastFour} /> },
    { key: 'scope', header: 'Scope', width: 230, render: r => <Badge mono>{r.scope}</Badge> },
    { key: 'lastUsed', header: 'Last used', width: 150, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.lastUsed}</span> },
    { key: 'expires', header: 'Expires', width: 130, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.expires}</span> }
  ];

  return (
    <>
      <PageHead
        title={name}
        subtitle={agentId}
        meta={
          enabled
            ? <Badge tone="ok" dot pulse>Active</Badge>
            : <Badge tone="danger" dot>Disabled</Badge>
        }
        actions={
          <>
            <Switch
              label={enabled ? 'Enabled' : 'Disabled'}
              checked={enabled}
              onChange={() => (enabled ? setConfirmDisable(true) : setEnabled(true))}
            />
            <Button variant="secondary" onClick={() => navigate(`/w/${ws}/agents`)}>Back to agents</Button>
          </>
        }
      />

      {!enabled ? (
        <Alert tone="danger" title="This agent is disabled">
          Its API keys will not authenticate. Re-enable it to restore access.
        </Alert>
      ) : null}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'keys', label: 'Keys', count: KEYS.length },
          { value: 'activity', label: 'Activity' }
        ]}
      />

      {tab === 'overview' ? (
        <>
          <div className="grid-stats">
            <StatTile label="Requests, 7d" icon={<Icon name="bolt" size={13} />} value="1,284" sub="Across 2 keys" />
            <StatTile label="Files written" icon={<Icon name="file" size={13} />} value="312" sub="Since 14 Jan 2026" />
            <StatTile label="Permission" icon={<Icon name="shield" size={13} />} value="Read + write" sub="No delete scope" />
            <StatTile label="Transport" icon={<Icon name="terminal" size={13} />} value="MCP" sub="Last handshake 4m ago" />
          </div>
          <Panel flush title="Recent activity">
            {ACTIVITY.map((a, i) => <ActivityRow key={i} {...a} />)}
          </Panel>
        </>
      ) : null}

      {tab === 'keys' ? (
        <Panel
          flush
          title="API keys"
          actions={<Button size="sm" onClick={() => navigate(`/w/${ws}/keys`)}>Create key</Button>}
        >
          <DataTable columns={keyColumns} rows={KEYS} rowKey="id" />
        </Panel>
      ) : null}

      {tab === 'activity' ? (
        <Panel>
          <EmptyState
            compact
            icon={<Icon name="activity" size={19} />}
            title="Per-agent audit log arrives in MVP-1"
            actions={<Button size="sm" variant="secondary" onClick={() => navigate(`/w/${ws}/activity`)}>Open workspace activity</Button>}
          >
            Until then, filter the workspace activity log by this agent.
          </EmptyState>
        </Panel>
      ) : null}

      <ConfirmModal
        open={confirmDisable}
        title={`Disable ${name}?`}
        description="All of its API keys will stop working immediately."
        confirmLabel="Disable agent"
        onClose={() => setConfirmDisable(false)}
        onConfirm={() => { setEnabled(false); setConfirmDisable(false); setToast('Agent disabled'); }}
      />

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}
