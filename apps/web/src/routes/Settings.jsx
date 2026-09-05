import React, { useState } from 'react';
import {
  PageHead, Panel, Tabs, Input, Button, Icon, Badge, DataTable, IconButton,
  Modal, ConfirmModal, Alert, EmptyState, Toast
} from '../components/index.js';
import { MembersTab, PrivacyTab, BillingTab } from './SettingsTabs.jsx';

/**
 * Settings. MVP-0 tabs are General (8.21) and Security (8.23).
 * Members (8.22), Privacy (8.24) and Billing (8.25) are MVP-1 — declared here so
 * the tablist is stable, and filled in Step 4.
 *
 * URL: /w/{ws}/settings
 */

const WORKSPACE_NAME = 'acme-research';
const WORKSPACE_ID = 'ws_8Kq2xR4mN7pL';

const SESSIONS = [
  { id: 's1', device: 'Chrome on Windows', location: 'Shanghai, CN', lastActive: 'Active now', current: true },
  { id: 's2', device: 'Safari on macOS', location: 'Shanghai, CN', lastActive: '2 days ago', current: false },
  { id: 's3', device: 'Firefox on Linux', location: 'Singapore, SG', lastActive: '3 weeks ago', current: false }
];

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [name, setName] = useState(WORKSPACE_NAME);
  const [saved, setSaved] = useState(false);
  const [dialog, setDialog] = useState(null); // 'delete-ws' | 'revoke-all'
  const [confirmText, setConfirmText] = useState('');
  const [toast, setToast] = useState(null);

  const sessionColumns = [
    {
      key: 'device',
      header: 'Device',
      primary: true,
      render: r => (
        <span className="row" style={{ gap: 'var(--s-4)' }}>
          <span>{r.device}</span>
          {r.current ? <Badge tone="ok" dot>This device</Badge> : null}
        </span>
      )
    },
    { key: 'location', header: 'Location', width: 190, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.location}</span> },
    { key: 'lastActive', header: 'Last active', width: 160, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.lastActive}</span> },
    {
      key: 'act',
      header: '',
      width: 110,
      render: r => r.current
        ? null
        : <Button size="sm" variant="secondary" onClick={() => setToast('Session signed out')}>Sign out</Button>
    }
  ];

  return (
    <>
      <PageHead title="Settings" subtitle="Workspace configuration, security, and membership." />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'general', label: 'General' },
          { value: 'security', label: 'Security' },
          { value: 'members', label: 'Members' },
          { value: 'privacy', label: 'Privacy' },
          { value: 'billing', label: 'Billing' }
        ]}
      />

      {/* --- 8.21 General --- */}
      {tab === 'general' ? (
        <>
          <Panel
            title="Workspace"
            footer={
              <>
                <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>Save changes</Button>
                {saved ? <span className="saved">Saved</span> : null}
              </>
            }
          >
            <Input
              label="Workspace name"
              value={name}
              onChange={e => setName(e.target.value)}
              hint="Cosmetic only. Renaming never changes URLs or API paths."
            />
            <Input
              label="Workspace ID"
              mono
              value={WORKSPACE_ID}
              disabled
              hint="This is what dashboard URLs and the API use to address the workspace, so renaming can never break a bookmark, a script, or an MCP config."
            />
          </Panel>

          <section aria-label="Danger zone">
            <Panel title="Danger zone" className="danger-zone">
              <Alert tone="danger" title="Delete this workspace">
                This permanently deletes all files, agents, and API keys in <strong>{WORKSPACE_NAME}</strong>. This cannot be undone.
              </Alert>
              <div>
                <Button variant="danger" onClick={() => { setConfirmText(''); setDialog('delete-ws'); }}>
                  Delete workspace
                </Button>
              </div>
            </Panel>
          </section>
        </>
      ) : null}

      {/* --- 8.23 Security --- */}
      {tab === 'security' ? (
        <>
          <Panel title="Password" footer={<Button>Change password</Button>}>
            <Input label="Current password" type="password" required />
            <Input label="New password" type="password" required hint="At least 12 characters. A passphrase beats complexity rules." />
            <Input label="Confirm new password" type="password" required />
          </Panel>

          <Panel
            flush
            title="Active sessions"
            actions={<Button size="sm" variant="danger-outline" onClick={() => setDialog('revoke-all')}>Sign out all other sessions</Button>}
          >
            <DataTable columns={sessionColumns} rows={SESSIONS} rowKey="id" />
          </Panel>

          <Panel title="Single sign-on">
            <EmptyState
              compact
              icon={<Icon name="shield" size={19} />}
              title="SSO is available on the Team plan"
              actions={<Button size="sm" variant="secondary" disabled>Configure SSO</Button>}
            >
              SAML and OIDC arrive with Team-tier workspaces in MVP-1.
            </EmptyState>
          </Panel>
        </>
      ) : null}

      {/* --- 8.22 / 8.24 / 8.25 --- */}
      {tab === 'members' ? <MembersTab /> : null}
      {tab === 'privacy' ? <PrivacyTab soleOwnerOf={0} /> : null}
      {tab === 'billing' ? <BillingTab /> : null}

      <Modal
        open={dialog === 'delete-ws'}
        title={`Delete ${WORKSPACE_NAME}?`}
        tone="danger"
        mark={<Icon name="alert" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="danger" disabled={confirmText !== WORKSPACE_NAME} onClick={() => setDialog(null)}>
              Delete workspace
            </Button>
          </>
        }
      >
        <Alert tone="danger" title="This destroys everything in the workspace">
          All files, agents, and API keys are permanently removed. Agents using its keys lose access immediately.
        </Alert>
        <Input
          label="Confirm"
          mono
          placeholder={`Type ${WORKSPACE_NAME} to confirm`}
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
        />
      </Modal>

      <ConfirmModal
        open={dialog === 'revoke-all'}
        title="Sign out all other sessions?"
        description="This will sign you out everywhere except this device."
        confirmLabel="Sign out others"
        onClose={() => setDialog(null)}
        onConfirm={() => { setDialog(null); setToast('Other sessions signed out'); }}
      />

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}
