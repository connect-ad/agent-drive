import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageHead, Panel, DataTable, Button, IconButton, Icon, Input, Badge,
  Modal, ConfirmModal, EmptyState, Alert, Toast
} from '../components/index.js';

/**
 * 8.13 Agent Management (list) — MVP-0, plus 8.14 Create Agent (modal).
 * URL: /w/{ws}/agents
 * States: loading | populated | empty
 */

// Agents have no endpoint yet; nothing to list.
const AGENTS = [];

// Status badge always pairs a tone with a word — never colour alone (spec: Accessibility).
const STATUS = {
  active: { tone: 'ok', label: 'Active' },
  key_expired: { tone: 'warn', label: 'Credential expired' },
  no_key: { tone: 'warn', label: 'No credential' },
  revoked: { tone: 'danger', label: 'Disabled' }
};

export default function Agents({ state = 'populated' }) {
  const { ws } = useParams();
  const navigate = useNavigate();
  const loading = state === 'loading';
  const empty = state === 'empty';

  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(null); // 'create' | 'delete'
  const [target, setTarget] = useState(null);
  const [created, setCreated] = useState(null);
  const [toast, setToast] = useState(null);

  const rows = loading || empty
    ? []
    : AGENTS.filter(a => a.name.toLowerCase().includes(query.trim().toLowerCase()));

  const columns = [
    {
      key: 'name',
      header: 'Agent',
      primary: true,
      render: r => (
        <span className="row" style={{ gap: 'var(--s-4)' }}>
          <Icon name="agent" size={15} style={{ color: 'var(--ink-3)' }} />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 'var(--w-med)', color: 'var(--ink)' }}>{r.name}</span>
            <span className="ad-mono-sm" style={{ color: 'var(--ink-3)' }}>{r.id}</span>
          </span>
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 190,
      render: r => <Badge tone={STATUS[r.status].tone} dot pulse={r.status === 'active'}>{STATUS[r.status].label}</Badge>
    },
    { key: 'keys', header: 'Keys', align: 'right', width: 80, mono: true },
    { key: 'lastActive', header: 'Last active', width: 160, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.lastActive}</span> },
    {
      key: 'act',
      header: '',
      width: 44,
      render: r => (
        <span onClick={e => e.stopPropagation()}>
          <IconButton
            icon={<Icon name="more" size={14} />}
            label={`Actions for ${r.name}`}
            onClick={() => { setTarget(r); setDialog('delete'); }}
          />
        </span>
      )
    }
  ];

  return (
    <>
      <PageHead
        title="Agents"
        subtitle="The identities your AI systems use to reach this workspace."
        actions={<Button icon={<Icon name="plus" size={14} />} onClick={() => setDialog('create')}>Create agent</Button>}
      />

      {created ? (
        <Alert
          tone="accent"
          title={`${created} created. Give it an API key to let it connect.`}
          actions={<Button size="sm" onClick={() => navigate(`/w/${ws}/keys`)}>Create API key</Button>}
        >
          An agent with zero keys is inert — it cannot authenticate until you issue one.
        </Alert>
      ) : null}

      {!loading && !empty ? (
        <div className="toolbar">
          <Input
            leadingIcon={<Icon name="search" size={14} style={{ color: 'var(--ink-4)' }} />}
            placeholder="Search agents"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      ) : null}

      <Panel flush title="Agents">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          skeletonRows={4}
          empty={
            <EmptyState
              icon={<Icon name="agent" size={19} />}
              title="No agents yet"
              actions={<Button size="sm" onClick={() => setDialog('create')}>Create an agent</Button>}
            >
              Agents are the identities your AI systems use to access storage.
            </EmptyState>
          }
          onRowClick={r => navigate(`/w/${ws}/agents/${r.id}`)}
        />
      </Panel>

      {/* --- 8.14 Create agent --- */}
      <Modal
        open={dialog === 'create'}
        title="Create an agent"
        tone="accent"
        mark={<Icon name="agent" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => { setCreated('research-bot'); setDialog(null); }}>Create agent</Button>
          </>
        }
      >
        <Input label="Name" required placeholder="e.g. research-bot" hint="Shown in the activity log next to everything this agent does." />
        <Input label="Description" optional multiline placeholder="What this agent is for, and which files it should touch." />
      </Modal>

      {/* --- delete: blocked when the agent still holds active keys --- */}
      {target && target.keys > 0 ? (
        <Modal
          open={dialog === 'delete'}
          title={`Delete ${target.name}?`}
          tone="danger"
          mark={<Icon name="alert" size={16} />}
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => { setDialog(null); setToast('Agent and keys deleted'); }}>
                Delete anyway
              </Button>
            </>
          }
        >
          <Alert tone="warn" title="This agent still has active credentials">
            This agent has {target.keys} active API key(s). Revoke them first, or delete anyway to revoke and delete together.
          </Alert>
        </Modal>
      ) : (
        <ConfirmModal
          open={dialog === 'delete'}
          title={`Delete ${target ? target.name : 'this agent'}?`}
          description="This can't be undone. The agent's audit history is retained."
          confirmLabel="Delete agent"
          onClose={() => setDialog(null)}
          onConfirm={() => { setDialog(null); setToast('Agent deleted'); }}
        />
      )}

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}
