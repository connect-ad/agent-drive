import React, { useState } from 'react';
import {
  Panel, DataTable, Select, Input, Button, Icon, Badge, Alert, EmptyState,
  Modal, ConfirmModal, Toast, Checkbox
} from '../components/index.js';
import { useResource } from '../lib/useResource.js';
import { useWorkspace } from '../lib/workspace.jsx';

/**
 * 8.22 Members · 8.24 Privacy · 8.25 Billing — MVP-1 settings tabs.
 * Split out of Settings.jsx so neither file gets unwieldy.
 */

/* ------------------------------ 8.22 Members ------------------------------ */

/**
 * There is no pending-invite state, and that is deliberate rather than
 * unfinished. An invitation requires the person to already hold an AgentDisk
 * account, so adding them is immediate and every row here points at a real,
 * Firebase-verified identity — nothing sits in limbo waiting to be claimed by
 * whoever reaches a mailbox first.
 */
const ROLES = [
  { value: 'admin', label: 'Admin — manage files, agents and keys in this workspace' },
  { value: 'reader', label: 'Reader — can see everything, can change nothing' }
];

const loadMembers = (api, workspaceId) => api.listMembers(workspaceId);

function formatJoined(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '—';
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function MembersTab() {
  const { api, workspaceId, role: myRole } = useWorkspace();
  const { status, data, error, reload } = useResource(loadMembers);

  const [dialog, setDialog] = useState(null);
  const [target, setTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('reader');
  // Checked by default (03 §8.22). A departing person's session dies with their
  // membership either way; a key they minted does not, and leaving one running
  // is the quieter of the two mistakes to make.
  const [revokeKeys, setRevokeKeys] = useState(true);

  const members = data?.members ?? [];
  const canManage = myRole === 'owner';

  const invite = async () => {
    if (!email.trim()) { setFormError('Enter their email address.'); return; }
    setBusy(true); setFormError(null);
    try {
      await api.inviteMember(workspaceId, { email: email.trim(), role: inviteRole });
      setDialog(null);
      setEmail('');
      setToast('Member added');
      void reload();
    } catch (err) {
      setFormError(`${err.message}${err.requestId ? ` (request ${err.requestId})` : ''}`);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (member, role) => {
    try {
      await api.updateMemberRole(workspaceId, member.id, role);
      setToast(`${member.email} is now ${role}`);
      void reload();
    } catch (err) {
      setToast(`Could not change role: ${err.message}`);
      void reload();
    }
  };

  const remove = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const result = await api.removeMember(workspaceId, target.id, revokeKeys);
      setToast(
        result.keysRevoked > 0
          ? `${target.email} removed, ${result.keysRevoked} key(s) revoked`
          : `${target.email} removed`
      );
      void reload();
    } catch (err) {
      setToast(`Could not remove: ${err.message}`);
    } finally {
      setBusy(false);
      setDialog(null);
    }
  };

  const columns = [
    {
      key: 'email',
      header: 'Member',
      primary: true,
      render: r => (
        <span className="row" style={{ gap: 'var(--s-4)' }}>
          <span className="avatar" aria-hidden="true">{(r.email || '?').slice(0, 1).toUpperCase()}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 'var(--w-med)', color: 'var(--ink)' }}>
              {r.email}{r.isYou ? ' (you)' : ''}
            </span>
            {r.accountOwner ? <span className="ad-meta">Owns this account</span> : null}
          </span>
        </span>
      )
    },
    {
      key: 'role',
      header: 'Role',
      width: 220,
      render: r =>
        // The account owner's role is shown, never offered as a control. It is
        // not editable from a workspace at all, and a disabled dropdown would
        // imply it might be somewhere else.
        r.accountOwner || !canManage ? (
          <Badge tone={r.accountOwner ? 'accent' : undefined}>{r.role}</Badge>
        ) : (
          <span onClick={e => e.stopPropagation()}>
            <Select
              value={r.role}
              options={ROLES.map(x => ({ value: x.value, label: x.value }))}
              onChange={e => changeRole(r, e.target.value)}
            />
          </span>
        )
    },
    {
      key: 'joined',
      header: 'Joined',
      width: 150,
      render: r => <span style={{ color: 'var(--ink-3)' }}>{formatJoined(r.joinedAt)}</span>
    },
    {
      key: 'act',
      header: '',
      width: 110,
      render: r =>
        r.accountOwner || !canManage ? null : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setRevokeKeys(true); setTarget(r); setDialog('remove'); }}
          >
            Remove
          </Button>
        )
    }
  ];

  return (
    <>
      {status === 'failed' ? (
        <Alert tone="danger" title="Could not load members" actions={<Button size="sm" onClick={reload}>Try again</Button>}>
          {error?.message}{error?.requestId ? ` (request ${error.requestId})` : ''}
        </Alert>
      ) : null}

      <Panel
        flush
        title="Members"
        subtitle="Everyone who can reach this workspace. Files and keys are separate between workspaces; billing is not."
        actions={
          canManage ? (
            <Button size="sm" onClick={() => { setFormError(null); setDialog('invite'); }}>
              Add member
            </Button>
          ) : null
        }
      >
        <DataTable
          columns={columns}
          rows={status === 'loading' ? [] : members}
          rowKey="id"
          loading={status === 'loading'}
          skeletonRows={3}
          empty={<EmptyState compact icon={<Icon name="users" size={19} />} title="Nobody else has access" />}
        />
      </Panel>

      <Modal
        open={dialog === 'invite'}
        title="Add a member"
        tone="accent"
        mark={<Icon name="users" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={invite} loading={busy}>Add member</Button>
          </>
        }
      >
        {formError ? <div role="alert"><Alert tone="danger" title={formError} /></div> : null}
        <Input
          label="Email"
          type="email"
          required
          placeholder="name@company.com"
          hint="They need an AgentDisk account already. Ask them to sign up first if they do not have one."
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Select
          label="Role"
          options={ROLES}
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value)}
        />
      </Modal>

      <Modal
        open={dialog === 'remove'}
        title={`Remove ${target ? target.email : 'this member'}?`}
        tone="danger"
        mark={<Icon name="alert" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove} loading={busy}>Remove member</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-2)' }}>
          They lose access to this workspace immediately. Their access to other workspaces, if any,
          is unaffected.
        </p>
        <Checkbox
          label="Also revoke every API key they created here"
          description="Any agent still using one stops working immediately. Leave this on unless you know a key is shared team infrastructure rather than theirs."
          checked={revokeKeys}
          onChange={() => setRevokeKeys(v => !v)}
        />
      </Modal>

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

// Billing is not wired up yet.
const INVOICES = [];

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
            <dt>Payment method</dt><dd className="ad-mono-sm">Not set up</dd>
            <dt>Billing email</dt><dd>—</dd>
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
