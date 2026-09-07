import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Icon, Alert, Meter, EmptyState } from '../components/index.js';

/**
 * 8.3 Signup · 8.4 Email Verification · 8.5 Forgot Password ·
 * 8.6 Reset Password · 8.7 Login — all MVP-0.
 *
 * Security behaviour that the copy exists to enforce (doc 06 / PART 16):
 *  - Login failure is generic. Never "wrong password" vs "no such account".
 *  - Forgot-password shows an identical success whether or not the account
 *    exists — no account enumeration.
 *  - Repeated login failure locks out with a visible countdown.
 * OAuth buttons are hidden rather than disabled until MVP-1, so there is no
 * dead-looking control.
 */

function AuthShell({ title, subtitle, children, footer, legal }) {
  return (
    <div className="auth">
      <div className="auth__inner">
        <div className="auth__brand">
          <span className="auth__logo" aria-hidden="true">A</span>
          <span className="auth__wordmark">AgentDisk</span>
        </div>
        <div className="auth__card">
          <div>
            <h1 className="auth__h1">{title}</h1>
            {subtitle ? <p className="auth__sub" style={{ marginTop: 'var(--s-2)' }}>{subtitle}</p> : null}
          </div>
          {children}
        </div>
        {legal ? <p className="auth__legal">{legal}</p> : null}
        {footer ? <p className="auth__foot">{footer}</p> : null}
      </div>
    </div>
  );
}

/* ------------------------------- 8.3 Signup ------------------------------- */

function strengthOf(pw) {
  if (!pw) return { score: 0, label: '' };
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s += 1;
  return { score: s, label: s <= 1 ? 'Weak' : s === 2 ? 'Good' : 'Strong' };
}

export function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const st = strengthOf(pw);

  const submit = e => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('Please enter a valid email address.'); return; }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setErr(null); setBusy(true);
    setTimeout(() => { setBusy(false); navigate('/verify-email'); }, 600);
  };

  return (
    <AuthShell
      title="Create your workspace"
      legal={<>By continuing, you agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</>}
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      {err ? <div role="alert"><Alert tone="danger" title={err} /></div> : null}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <Input
            label="Password"
            type="password"
            required
            value={pw}
            onChange={e => setPw(e.target.value)}
            hint="At least 8 characters, with a number or symbol."
          />
          {pw ? (
            <>
              <Meter value={st.score} max={3} label={`Password strength: ${st.label}`} />
              {/* Text equivalent, announced politely — never colour/bar alone. */}
              <span className="ad-meta" aria-live="polite">{st.label}</span>
            </>
          ) : null}
        </div>
        <Button type="submit" full loading={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
      </form>
    </AuthShell>
  );
}

/* --------------------------- 8.4 Email verification --------------------------- */

export function VerifyEmail({ expired = false }) {
  const [cooldown, setCooldown] = useState(0);
  const email = 'dana@acme.io';

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (expired) {
    return (
      <AuthShell title="Link expired">
        <Alert tone="warn" title="This link has expired">
          Verification links are valid for 24 hours.
        </Alert>
        <Button full onClick={() => setCooldown(60)}>Send a new link</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Check your inbox"
      subtitle={<>We sent a verification link to <strong>{email}</strong>. Click it to activate your workspace.</>}
      footer={<>Wrong email? <Link to="/signup">Start over</Link></>}
    >
      <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--s-6) 0' }}>
        <span style={{
          width: 40, height: 40, borderRadius: 'var(--r-3)', display: 'grid', placeItems: 'center',
          border: '1px solid var(--accent-line)', background: 'var(--accent-soft)', color: 'var(--accent-ink)'
        }}>
          <Icon name="link" size={19} />
        </span>
      </div>
      <Button variant="secondary" full disabled={cooldown > 0} onClick={() => setCooldown(60)}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
      </Button>
      {/* Announced at most occasionally, not every tick — avoids screen-reader spam. */}
      <span className="ad-meta" aria-live="polite" style={{ textAlign: 'center' }}>
        {cooldown > 0 && cooldown % 10 === 0 ? `Resend available in ${cooldown} seconds` : ''}
      </span>
    </AuthShell>
  );
}

/* --------------------------- 8.5 Forgot password --------------------------- */

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <AuthShell title="Reset your password" footer={<Link to="/login">Back to sign in</Link>}>
        {/* Deliberately non-committal: identical whether or not the account exists. */}
        <div role="status">
          <Alert tone="ok" title="Check your inbox">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
          </Alert>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send a reset link."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form
        onSubmit={e => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); setSent(true); }, 600); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}
      >
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <Button type="submit" full loading={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
      </form>
    </AuthShell>
  );
}

/* --------------------------- 8.6 Reset password --------------------------- */

export function ResetPassword({ tokenValid = true }) {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== pw;

  if (!tokenValid) {
    return (
      <AuthShell title="Set a new password">
        <Alert tone="danger" title="This reset link is invalid or has expired." />
        <Button full as={Link} to="/forgot-password">Request a new link</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" footer={<Link to="/login">Back to sign in</Link>}>
      <form
        onSubmit={e => { e.preventDefault(); if (mismatch || !pw) return; setBusy(true); setTimeout(() => navigate('/login'), 600); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}
      >
        <Input label="New password" type="password" required value={pw} onChange={e => setPw(e.target.value)}
          hint="At least 8 characters, with a number or symbol." />
        <Input
          label="Confirm new password"
          type="password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          error={mismatch ? "Those passwords don't match." : undefined}
        />
        <Button type="submit" full loading={busy} disabled={mismatch}>Update password</Button>
      </form>
    </AuthShell>
  );
}

/* ------------------------------- 8.7 Login ------------------------------- */

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [lockFor, setLockFor] = useState(0);

  useEffect(() => {
    if (lockFor <= 0) return undefined;
    const t = setTimeout(() => setLockFor(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockFor]);

  const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const submit = e => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const n = attempts + 1;
      setAttempts(n);
      // 5 failures in the window -> temporary lockout with a visible countdown.
      if (n >= 5) { setLockFor(900); setErr(null); } else { setErr('generic'); }
    }, 500);
  };

  return (
    <AuthShell title="Sign in" footer={<>New here? <Link to="/signup">Create your workspace</Link></>}>
      {lockFor > 0 ? (
        <div role="alert" aria-live="polite">
          <Alert tone="danger" title="Too many attempts">
            Try again in {mmss(lockFor)}, or <Link to="/forgot-password">reset your password</Link>.
          </Alert>
        </div>
      ) : null}
      {err ? (
        <div role="alert">
          {/* Generic on purpose — never distinguishes bad password from unknown account. */}
          <Alert tone="danger" title="That email or password isn't right.">
            <Link to="/forgot-password">Forgot password?</Link>
          </Alert>
        </div>
      ) : null}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={lockFor > 0} />
        <Input label="Password" type="password" required value={pw} onChange={e => setPw(e.target.value)} disabled={lockFor > 0} />
        <Button type="submit" full loading={busy} disabled={lockFor > 0}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <p className="auth__foot"><Link to="/forgot-password">Forgot password?</Link></p>
    </AuthShell>
  );
}
