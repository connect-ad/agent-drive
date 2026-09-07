import React, { useState } from 'react';
import {
  PageHead, Panel, DataTable, Button, IconButton, Icon, Input, Badge, Checkbox,
  Modal, ConfirmModal, EmptyState, ApiKeyDisplay, Alert, Toast, CodeBlock
} from '../components/index.js';

/**
 * 8.18a Webhooks — MVP-1
 * URL: /w/{ws}/webhooks
 *
 * The signing-secret reveal deliberately reuses 8.16's reveal-once pattern
 * (ApiKeyDisplay + explicit acknowledgment, no dismiss-by-accident) rather than
 * reinventing it.
 *
 * Failure detail never renders request/response headers — those can carry
 * secrets (doc 06 PART 16.18). Status code + truncated body only.
 */

const EVENTS = ['file.created', 'file.updated', 'file.deleted', 'transform.completed'];

const HOOKS = [
  { id: 'w1', url: 'https://acme.io/webhooks/agentdisk', events: ['file.created', 'file.updated'], status: 'active', last: '4 minutes ago', ok: true },
  { id: 'w2', url: 'https://ops.acme.io/hooks/ingest', events: ['file.created'], status: 'failing', last: '2 hours ago', ok: false, failures: 4 }
];

const FAILURES = `503 Service Unavailable
upstream connect error or disconnect/reset before headers

502 Bad Gateway
<html><head><title>502 Bad Gateway</title></head><body>…

503 Service Unavailable
upstream connect error or disconnect/reset before headers`;

const SECRET = 'whsec_4Kq2xR7mN9pL3vB8wY6zT1sJ0hG5uF2d';

export default function Webhooks({ state = 'populated' }) {
  const loading = state === 'loading';
  const empty = state === 'empty';

  const [dialog, setDialog] = useState(null); // 'create' | 'reveal' | 'delete'
  const [target, setTarget] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);
  const [picked, setPicked] = useState({ 'file.created': true });

  const rows = loading || empty ? [] : HOOKS;

  const columns = [
    { key: 'url', header: 'Endpoint', primary: true, render: r => <span className="ad-mono-sm">{r.url}</span> },
    {
      key: 'events',
      header: 'Events',
      width: 280,
      render: r => (
        <span style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          {r.events.map(e => <Badge key={e} mono>{e}</Badge>)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 150,
      render: r => r.ok
        ? <Badge tone="ok" dot>Active</Badge>
        : <Badge tone="danger" dot>Failing</Badge>
    },
    { key: 'last', header: 'Last delivery', width: 160, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.last}</span> },
    {
      key: 'act',
      header: '',
      width: 84,
      render: r => (
        <span onClick={e => e.stopPropagation()} className="row" style={{ gap: 0 }}>
          <IconButton icon={<Icon name="bolt" size={14} />} label={`Send test event to ${r.url}`} onClick={() => setToast('Test event sent')} />
          <IconButton tone="danger" icon={<Icon name="trash" size={14} />} label={`Delete ${r.url}`} onClick={() => { setTarget(r); setDialog('delete'); }} />
        </span>
      )
    }
  ];

  return (
    <>
      <PageHead
        title="Webhooks"
        subtitle="Outbound notifications when objects in this workspace change."
        actions={<Button icon={<Icon name="plus" size={14} />} onClick={() => setDialog('create')}>Add endpoint</Button>}
      />

      <Panel flush title="Endpoints">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          skeletonRows={2}
          empty={
            <EmptyState
              icon={<Icon name="link" size={19} />}
              title="No webhooks yet"
              actions={<Button size="sm" onClick={() => setDialog('create')}>Add endpoint</Button>}
            >
              Get notified when files change — useful for triggering downstream automation.
            </EmptyState>
          }
          onRowClick={r => (r.ok ? undefined : setExpanded(expanded === r.id ? null : r.id))}
        />
      </Panel>

      {/* Inline failure expansion for a failing endpoint. */}
      {rows.filter(r => !r.ok).map(r => (
        <Panel
          key={r.id}
          title={`Failing — last ${r.failures} deliveries didn't succeed`}
          subtitle={r.url}
          actions={
            <>
              <Button
                size="sm"
                variant="secondary"
                aria-expanded={expanded === r.id}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                {expanded === r.id ? 'Hide recent failures' : 'View recent failures'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setDialog('reveal')}>Rotate secret</Button>
              <Button size="sm" variant="danger-outline" onClick={() => { setTarget(r); setDialog('delete'); }}>
                Delete endpoint
              </Button>
            </>
          }
        >
          {expanded === r.id ? (
            <>
              <Alert tone="warn" title="Deliveries are retried with backoff, then dead-lettered">
                Response bodies are truncated and headers are never shown — they can carry secrets.
              </Alert>
              <CodeBlock filename="Recent delivery failures" code={FAILURES} copyable={false} />
            </>
          ) : null}
        </Panel>
      ))}

      {/* --- create --- */}
      <Modal
        open={dialog === 'create'}
        title="Add webhook endpoint"
        tone="accent"
        size="md"
        mark={<Icon name="link" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => setDialog('reveal')}>Add endpoint</Button>
          </>
        }
      >
        <Input
          label="URL"
          required
          mono
          type="url"
          placeholder="https://your-service.com/webhooks/agentdisk"
          hint="HTTPS only. We re-validate the destination server-side before sending anything."
        />
        <div>
          <p className="ad-label" style={{ marginBottom: 'var(--s-4)' }}>Events</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {EVENTS.map(e => (
              <Checkbox
                key={e}
                label={e}
                description={e === 'transform.completed' ? 'Fires when text extraction finishes. V2.' : undefined}
                checked={!!picked[e]}
                onChange={() => setPicked(p => ({ ...p, [e]: !p[e] }))}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* --- reveal-once signing secret: same pattern as 8.16 --- */}
      <Modal
        open={dialog === 'reveal'}
        title="Your signing secret"
        tone="accent"
        size="md"
        mark={<Icon name="lock" size={16} />}
        footer={
          <Button onClick={() => { setDialog(null); setToast('Webhook endpoint added'); }}>
            I&rsquo;ve copied my secret
          </Button>
        }
      >
        <Alert tone="warn" title="Copy this now — you won't be able to see it again">
          Use it to verify that deliveries actually came from AgentDisk.
        </Alert>
        <ApiKeyDisplay revealed secret={SECRET} />
      </Modal>

      <ConfirmModal
        open={dialog === 'delete'}
        title="Delete this webhook endpoint?"
        description={`AgentDisk will stop sending events to ${target ? target.url : 'this endpoint'}.`}
        confirmLabel="Delete"
        onClose={() => setDialog(null)}
        onConfirm={() => { setDialog(null); setToast('Endpoint deleted'); }}
      />

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}
