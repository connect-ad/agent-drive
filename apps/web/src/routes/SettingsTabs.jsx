import React, { useState } from 'react';
import {
  Panel, DataTable, Select, Input, Button, Icon, Badge, Alert, EmptyState,
  Modal, ConfirmModal, Toast
} from '../components/index.js';

/**
 * 8.22 Members · 8.24 Privacy · 8.25 Billing — MVP-1 settings tabs.
 * Split out of Settings.jsx so neither file gets unwieldy.
 */

/* ------------------------------ 8.22 Members ------------------------------ */

const MEMBERS = [
  { id: 'm1', name: 'Dana Okafor', email: 'dana@acme.io', role: 'Owner', joined: '14 Jan 2026', you: true },
  { id: 'm2', name: 'Sam Iyer', email: 'sam@acme.io', role: 'Admin', joined: '2 Feb 2026' },
  { id: 'm3', name: 'Rin Takada', email: 'rin@acme.io', role: 'Member', joined: '18 Feb 2026' }
];

const INVITES = [
  { id: 'i1', email: 'jo@acme.io', role: 'Member', sent: '2 days ago' }
];

const ROLES = [
  { value: 'Owner', label: 'Owner — full control, including billing and deletion' },
  { value: 'Admin', label: 'Admin — manage files, agents and members' },
  { value: 'Member', label: "Member — can manage files and agents, can't manage billing or delete the workspace" }
];

export function MembersTab() {
  const [dialog, setDialog] = useState(null);
  const [target, setTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const owners = MEMBERS.filter(m => m.role === 'Owner').length;

  const columns = [
    {
      key: 'name',
      header: 'Member',
      primary: true,
      render: r => (
        <span className="row" style={{ gap: 'var(--s-4)' }}>
          <span className="avatar" aria-hidden="true">{r.name.slice(0, 1)}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 'var(--w-med)', color: 'var(--ink)' }}>
              {r.name}{r.you ? ' (you)' : ''}
            </span>
            <span className="ad-meta">{r.email}</span>
          </span>
        </span>
      )
    },
    {
      key: 'role',
      header: 'Role',
      width: 200,
      render: r => (
        <span onClick={e => e.stopPropagation()}>
          <Select
            defaultValue={r.role}
            options={ROLES.map(x => ({ value: x.value, label: x.value }))}
            onChange={() => setToast('Role updated')}
          />
        </span>
      )
    },
    { key: 'joined', header: 'Joined', width: 150, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.joined}</span> },
    {
      key: 'act',
      header: '',
      width: 110,
      render: r => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => { setTarget(r); setDialog(r.role === 'Owner' && owners === 1 ? 'last-owner' : 'remove'); }}
        >
          Remove
        </Button>
      )
    }
  ];

  const inviteColumns = [
    { key: 'email', header: 'Invited', primary: true },
    { key: 'role', header: 'Role', width: 140, render: r => <Badge>{r.role}</Badge> },
    { key: 'sent', header: 'Sent', width: 150, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.sent}</span> },
    { key: 'act', header: '', width: 110, render: () => <Button size="sm" variant="secondary" onClick={() => setToast('Invite revoked')}>Revoke</Button> }
  ];

  return (
    <>
      <Panel
        flush
        title="Members"
        actions={<Button size="sm" onClick={() => setDialog('invite')}>Invite member</Button>}
      >
        <DataTable columns={columns} rows={MEMBERS} rowKey="id" />
      </Panel>

      <Panel flush title="Pending invites">
        <DataTable
          columns={inviteColumns}
          rows={INVITES}
          rowKey="id"
          empty={<EmptyState compact icon={<Icon name="users" size={19} />} title="No pending invites" />}
        />
      </Panel>

      <Modal
        open={dialog === 'invite'}
        title="Invite member"
        tone="accent"
        mark={<Icon name="users" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => { setDialog(null); setToast('Invite sent'); }}>Send invite</Button>
          </>
        }
      >
        <Input label="Email" type="email" required placeholder="name@company.com" />
        <Select label="Role" options={ROLES} defaultValue="Member" />
      </Modal>

      {/* Blocked with an explanation, not a silently disabled button. */}
      <Modal
        open={dialog === 'last-owner'}
        title="Can't remove the last owner"
        tone="danger"
        mark={<Icon name="alert" size={16} />}
        onClose={() => setDialog(null)}
        footer={<Button variant="secondary" onClick={() => setDialog(null)}>Close</Button>}
      >
        <Alert tone="warn" title="A workspace needs at least one owner">
          Promote someone else first, then remove this member.
        </Alert>
      </Modal>

      <ConfirmModal
        open={dialog === 'remove'}
        title={`Remove ${target ? target.name : 'this member'}?`}
        description="Their session is revoked immediately. Files and agents they created stay in the workspace."
        confirmLabel="Remove member"
        onClose={() => setDialog(null)}
        onConfirm={() => { setDialog(null); setToast('Member removed'); }}
      />

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------ 8.24 Privacy ------------------------------ */

const SUBPROCESSORS = [
  { name: 'Cloudflare', purpose: 'Object storage (R2), database (D1), compute (Workers), CDN', region: 'Global edge' },
  { name: 'Stripe', purpose: 'Payment processing and invoicing', region: 'US / EU' },
  { name: 'Resend', purpose: 'Transactional email (verification, password reset)', region: 'US' }
];

export function PrivacyTab({ soleOwnerOf = 0 }) {
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);

  const columns = [
    { key: 'name', header: 'Sub-processor', primary: true, width: 160 },
    { key: 'purpose', header: 'Purpose' },
    { key: 'region', header: 'Region', width: 160, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.region}</span> }
  ];

  return (
    <>
      <Panel title="What we store" subtitle="Rendered from the privacy policy, not just linked to it.">
        <dl className="dl">
          <dt>File contents</dt><dd>Stored in object storage in the region you chose. Encrypted at rest.</dd>
          <dt>File metadata</dt><dd>Path, size, MIME type, checksum, and which agent wrote it.</dd>
          <dt>Audit events</dt><dd>Actor, action, resource, source IP and client string. Retained 12 months.</dd>
          <dt>Account data</dt><dd>Email, display name, hashed password, session records.</dd>
          <dt>API keys</dt><dd>Stored only as a hash. We cannot recover a key you lose.</dd>
        </dl>
      </Panel>

      <Panel flush title="Sub-processors">
        <DataTable columns={columns} rows={SUBPROCESSORS} rowKey="name" />
      </Panel>

      <Panel title="Your data" footer={<Button variant="secondary" onClick={() => setDialog('export')}>Export my data</Button>}>
        <p className="ad-small ad-measure">
          An export includes your files, their metadata, and your audit history as a
          single archive.
        </p>
      </Panel>

      <section aria-label="Danger zone">
        <Panel title="Delete my account">
          <Alert tone="danger" title="This is separate from deleting a workspace">
            Deleting your account removes your profile, sessions and personal data.
          </Alert>
          {soleOwnerOf > 0 ? (
            <Alert tone="warn" title="Blocked">
              You&rsquo;re the only owner of {soleOwnerOf} workspace(s). Transfer ownership or delete those workspaces first.
            </Alert>
          ) : null}
          <div>
            <Button variant="danger" disabled={soleOwnerOf > 0} onClick={() => setDialog('delete-account')}>
              Delete my account
            </Button>
          </div>
        </Panel>
      </section>

      <Modal
        open={dialog === 'export'}
        title="Export requested"
        tone="accent"
        mark={<Icon name="download" size={16} />}
        onClose={() => setDialog(null)}
        footer={<Button onClick={() => setDialog(null)}>Got it</Button>}
      >
        <Alert tone="ok" title="We're preparing your export">
          We&rsquo;ll email you a download link within 24 hours.
        </Alert>
      </Modal>

      <ConfirmModal
        open={dialog === 'delete-account'}
        title="Delete your account?"
        description="This removes your profile, sessions and personal data. It cannot be undone."
        confirmLabel="Delete account"
        onClose={() => setDialog(null)}
        onConfirm={() => { setDialog(null); setToast('Account deletion scheduled'); }}
      />

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------ 8.25 Billing ------------------------------ */

const INVOICES = [
  { id: 'in1', date: '1 Mar 2026', amount: '$20.00', status: 'Paid', period: 'Mar 2026' },
  { id: 'in2', date: '1 Feb 2026', amount: '$20.00', status: 'Paid', period: 'Feb 2026' },
  { id: 'in3', date: '1 Jan 2026', amount: '$20.00', status: 'Paid', period: 'Jan 2026' }
];

export function BillingTab({ hasPaymentMethod = true, overLimitOnDowngrade = true }) {
  const [dialog, setDialog] = useState(null);

  const columns = [
    { key: 'date', header: 'Date', primary: true, width: 150 },
    { key: 'period', header: 'Period', width: 150 },
    { key: 'amount', header: 'Amount', align: 'right', width: 120, mono: true },
    { key: 'status', header: 'Status', width: 120, render: r => <Badge tone="ok" dot>{r.status}</Badge> },
    { key: 'act', header: '', width: 110, render: () => <Button size="sm" variant="secondary">Download</Button> }
  ];

  return (
    <>
      <Panel
        title="Current plan"
        subtitle="Pro — $20 per month"
        actions={<Badge tone="accent">Pro</Badge>}
        footer={
          <>
            <Button variant="secondary" iconRight={<Icon name="external" size={13} />}>Manage billing</Button>
            <Button variant="ghost" onClick={() => setDialog('downgrade')}>Change plan</Button>
          </>
        }
      >
        {!hasPaymentMethod ? (
          <Alert tone="warn" title="Add a payment method to upgrade" actions={<Button size="sm">Add payment method</Button>}>
            You can keep using the Free plan indefinitely without one.
          </Alert>
        ) : (
          <dl className="dl">
            <dt>Next invoice</dt><dd>1 Apr 2026 — $20.00</dd>
            <dt>Payment method</dt><dd className="ad-mono-sm">•••• 4242 · exp 09/28</dd>
            <dt>Billing email</dt><dd>dana@acme.io</dd>
          </dl>
        )}
      </Panel>

      <Panel flush title="Invoices">
        <DataTable columns={columns} rows={INVOICES} rowKey="id" />
      </Panel>

      <Modal
        open={dialog === 'downgrade'}
        title="Change plan"
        tone={overLimitOnDowngrade ? 'danger' : 'accent'}
        mark={<Icon name="billing" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant={overLimitOnDowngrade ? 'danger' : 'primary'} onClick={() => setDialog(null)}>
              Downgrade to Free
            </Button>
          </>
        }
      >
        {overLimitOnDowngrade ? (
          <Alert tone="warn" title="Your usage exceeds the Free plan's limits">
            You can downgrade, but new uploads will be blocked until you&rsquo;re back under the limit.
            Existing files stay readable.
          </Alert>
        ) : (
          <p className="ad-small">Your current usage fits within the Free plan.</p>
        )}
      </Modal>
    </>
  );
}
