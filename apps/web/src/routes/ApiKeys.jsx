import React, { useState } from 'react';
import {
  PageHead, Panel, DataTable, Button, IconButton, Icon, Input, Select, Badge,
  Checkbox, Modal, ConfirmModal, EmptyState, ApiKeyDisplay, Alert, Toast
} from '../components/index.js';

/**
 * 8.16 API Keys (workspace-level) — MVP-0, incl. 8.17 Create API Key.
 * URL: /w/{ws}/keys
 *
 * The reveal-once state is the security-critical one: the full secret is shown
 * exactly once, the modal cannot be dismissed by accident (no X, no scrim click),
 * and it requires an explicit acknowledgment. ApiKeyDisplay enforces the
 * show-once/masked split; this screen only decides when each mode applies.
 */

const KEYS = [
  { id: 'k1', name: 'prod-research-bot', agent: 'research-assistant', lastFour: '5uJ0', ops: 'Read+Write', path: '/research/*', created: '14 Jan 2026', lastUsed: '4 minutes ago', expires: 'Never', revoked: false },
  { id: 'k2', name: 'staging-bot', agent: 'research-assistant', lastFour: '2xM8', ops: 'Read', path: 'Full access', created: '2 Feb 2026', lastUsed: '6 days ago', expires: '1 Mar 2027', revoked: false },
  { id: 'k3', name: 'old-crawler', agent: 'old-crawler', lastFour: '9tQ1', ops: 'Read', path: 'Full access', created: '4 Dec 2025', lastUsed: '2 Feb 2026', expires: 'Never', revoked: true }
];

const NEW_SECRET = 'ad_live_7fQ2xK9mR4pL8vN3wY6zB1sT5uJ0hG';

export default function ApiKeys({ state = 'populated' }) {
  const loading = state === 'loading';
  const empty = state === 'empty';

  const [dialog, setDialog] = useState(null); // 'create' | 'reveal' | 'revoke'
  const [target, setTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [ops, setOps] = useState({ read: true, write: false, delete: false, list: true });

  const rows = loading || empty ? [] : KEYS;

  const columns = [
    { key: 'name', header: 'Name', primary: true },
    { key: 'agent', header: 'Agent', width: 190, render: r => <Badge tone="accent" mono>{r.agent}</Badge> },
    { key: 'key', header: 'Key', width: 200, render: r => <ApiKeyDisplay lastFour={r.lastFour} /> },
    {
      key: 'scope',
      header: 'Scope',
      width: 240,
      render: r => <Badge mono>{`${r.ops} · ${r.path}`}</Badge>
    },
    { key: 'lastUsed', header: 'Last used', width: 150, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.lastUsed}</span> },
    { key: 'expires', header: 'Expires', width: 130, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.expires}</span> },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      render: r => r.revoked
        ? <Badge tone="danger" dot>Revoked</Badge>
        : <Badge tone="ok" dot>Active</Badge>
    },
    {
      key: 'act',
      header: '',
      width: 44,
      render: r => (
        <span onClick={e => e.stopPropagation()}>
          <IconButton
            tone="danger"
            icon={<Icon name="lock" size={14} />}
            label={`Revoke ${r.name}`}
            disabled={r.revoked}
            onClick={() => { setTarget(r); setDialog('revoke'); }}
          />
        </span>
      )
    }
  ];

  return (
    <>
      <PageHead
        title="API keys"
        subtitle="Credentials agents present to reach this workspace. Each key carries its own scope."
        actions={<Button icon={<Icon name="plus" size={14} />} onClick={() => setDialog('create')}>Create key</Button>}
      />

      <Panel flush title="Keys">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          skeletonRows={3}
          empty={
            <EmptyState
              icon={<Icon name="key" size={19} />}
              title="No API keys yet"
              actions={<Button size="sm" onClick={() => setDialog('create')}>Create your first key</Button>}
            >
              A key is what lets an agent authenticate. Without one, an agent is inert.
            </EmptyState>
          }
        />
      </Panel>

      {/* --- 8.17 Create API key --- */}
      <Modal
        open={dialog === 'create'}
        title="Create API key"
        tone="accent"
        size="md"
        mark={<Icon name="key" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => setDialog('reveal')}>Create key</Button>
          </>
        }
      >
        <Input label="Name" required placeholder="prod-research-bot" />
        <Select
          label="Agent"
          required
          options={[
            { value: 'research-assistant', label: 'research-assistant' },
            { value: 'report-writer', label: 'report-writer' },
            { value: 'ingest-worker', label: 'ingest-worker' }
          ]}
        />
        <div>
          <p className="ad-label" style={{ marginBottom: 'var(--s-4)' }}>Permissions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            <Checkbox label="Read" description="List and download files." checked={ops.read} onChange={() => setOps(o => ({ ...o, read: !o.read }))} />
            <Checkbox label="Write" description="Upload and overwrite files." checked={ops.write} onChange={() => setOps(o => ({ ...o, write: !o.write }))} />
            <Checkbox label="Delete" description="Permanently remove files. Grant sparingly." checked={ops.delete} onChange={() => setOps(o => ({ ...o, delete: !o.delete }))} />
            <Checkbox label="List" description="Enumerate folder contents." checked={ops.list} onChange={() => setOps(o => ({ ...o, list: !o.list }))} />
          </div>
        </div>
        <Input label="Restrict to path" optional mono placeholder="/projects/demo/*" hint="Leave empty for full workspace access." />
        <Select
          label="Expires"
          options={[
            { value: 'never', label: 'Never' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
            { value: 'custom', label: 'Custom' }
          ]}
        />
      </Modal>

      {/* --- reveal-once: no onClose, so it cannot be dismissed by accident --- */}
      <Modal
        open={dialog === 'reveal'}
        title="Your API key"
        tone="accent"
        size="md"
        mark={<Icon name="key" size={16} />}
        footer={
          <Button onClick={() => { setDialog(null); setToast('Key created'); }}>
            I&rsquo;ve copied my key
          </Button>
        }
      >
        <Alert tone="warn" title="Copy this now — you won't be able to see it again">
          We store only a hash of this key. If you lose it, revoke it and create a new one.
        </Alert>
        <ApiKeyDisplay revealed secret={NEW_SECRET} />
      </Modal>

      <ConfirmModal
        open={dialog === 'revoke'}
        title={`Revoke ${target ? target.name : 'this key'}?`}
        description="Any agent using this key will immediately lose access."
        confirmLabel="Revoke key"
        onClose={() => setDialog(null)}
        onConfirm={() => { setDialog(null); setToast('Key revoked'); }}
      />

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)}>
            {toast === 'Key revoked' ? 'Any client using it lost access immediately.' : null}
          </Toast>
        </div>
      ) : null}
    </>
  );
}
