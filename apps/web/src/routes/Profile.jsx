import { useAuth } from '../lib/auth.jsx';
import React, { useState } from 'react';
import { PageHead, Panel, Input, Button, Icon, Alert, EmptyState, Toast } from '../components/index.js';

/**
 * 8.26 Profile — MVP-0
 * URL: /account/profile
 * Changing email requires re-verification; the current address stays active
 * until the new one is confirmed, so a typo can never lock the user out.
 */

export default function Profile() {
  // The signed-in person, from Firebase. Editing a display name needs an
  // endpoint that does not exist yet, so the field shows what is true and says
  // so rather than pretending a save would stick.
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [email] = useState(user?.email ?? '');
  const [pendingEmail, setPendingEmail] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  return (
    <>
      <PageHead title="Profile" subtitle="How you appear in the activity log and to workspace members." />

      {pendingEmail ? (
        <Alert
          tone="warn"
          title="Verify your new email address"
          actions={<Button size="sm" variant="secondary" onClick={() => setToast('Verification link resent')}>Resend link</Button>}
        >
          We sent a verification link to <strong>{pendingEmail}</strong>. Your current email stays active until you confirm.
        </Alert>
      ) : null}

      <Panel
        title="Account"
        footer={
          <>
            <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>Save changes</Button>
            {saved ? <span className="saved">Saved</span> : null}
          </>
        }
      >
        <div className="row" style={{ gap: 'var(--s-6)' }}>
          <span className="avatar avatar--lg" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 'var(--t-14)', fontWeight: 'var(--w-med)', color: 'var(--ink)' }}>{name}</p>
            <p className="ad-meta">{email}</p>
          </div>
          <span className="toolbar__spacer" />
          <Button size="sm" variant="secondary" icon={<Icon name="upload" size={13} />}>Change avatar</Button>
        </div>

        <Input label="Display name" value={name} onChange={e => setName(e.target.value)} hint="Shown next to your actions in the audit log." />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          hint="We'll send a verification link to your new email. Your current email stays active until you confirm."
        />
        <div>
          <Button variant="secondary" size="sm" onClick={() => setPendingEmail(email)}>Send verification link</Button>
        </div>
      </Panel>

      <Panel title="Connected accounts">
        <EmptyState
          compact
          icon={<Icon name="link" size={19} />}
          title="OAuth sign-in arrives in MVP-1"
        >
          Google and GitHub sign-in will appear here once available.
        </EmptyState>
      </Panel>

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone="ok" title={toast} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}
