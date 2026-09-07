import { useAuth, describeAuthError } from '../lib/auth.jsx';
import React, { useState } from 'react';
import { PageHead, Panel, Input, Button, Icon, Alert, EmptyState } from '../components/index.js';

/**
 * 8.26 Profile — MVP-0
 * URL: /account/profile
 * Changing email requires re-verification; the current address stays active
 * until the new one is confirmed, so a typo can never lock the user out.
 */

export default function Profile() {
  // Both fields are owned by Firebase, not by our API: the Worker reads the
  // display name off the token's `name` claim and syncs the address from the
  // token on the next request. So these edits are the whole change, and there
  // is no endpoint of ours missing behind them.
  const { user, updateDisplayName, requestEmailChange } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [pendingEmail, setPendingEmail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const currentEmail = user?.email ?? '';

  const save = async () => {
    setSaving(true); setError(null);
    try {
      await updateDisplayName(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSaving(false);
    }
  };

  const sendVerification = async () => {
    const next = email.trim();
    if (!next || next === currentEmail) {
      setError('Enter a different address to move this account to.');
      return;
    }
    setSending(true); setError(null);
    try {
      await requestEmailChange(next);
      setPendingEmail(next);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHead title="Profile" subtitle="How you appear in the activity log and to workspace members." />

      {error ? <div role="alert"><Alert tone="danger" title={error} /></div> : null}

      {pendingEmail ? (
        <Alert
          tone="warn"
          title="Verify your new email address"
          actions={
            <Button size="sm" variant="secondary" loading={sending} onClick={sendVerification}>
              Resend link
            </Button>
          }
        >
          We sent a verification link to <strong>{pendingEmail}</strong>. Your current email stays active until you confirm.
        </Alert>
      ) : null}

      <Panel
        title="Account"
        footer={
          <>
            <Button onClick={save} loading={saving}>Save changes</Button>
            {saved ? <span className="saved">Saved</span> : null}
          </>
        }
      >
        <div className="row" style={{ gap: 'var(--s-6)' }}>
          <span className="avatar avatar--lg" aria-hidden="true">{(name || currentEmail).slice(0, 1).toUpperCase()}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 'var(--t-14)', fontWeight: 'var(--w-med)', color: 'var(--ink)' }}>{name}</p>
            <p className="ad-meta">{currentEmail}</p>
          </div>
          <span className="toolbar__spacer" />
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
          <Button variant="secondary" size="sm" loading={sending} onClick={sendVerification}>
            Send verification link
          </Button>
        </div>
      </Panel>

      <Panel title="Connected accounts">
        <EmptyState
          compact
          icon={<Icon name="link" size={19} />}
          title="Sign-in methods live in your provider"
        >
          Google and GitHub accounts are linked at sign-in. Use the same method you signed up with.
        </EmptyState>
      </Panel>

    </>
  );
}
