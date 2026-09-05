import React from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { Badge } from '../Badge/Badge.jsx';

const STATUS = {
  active:      { tone: 'ok',      label: 'Active' },
  idle:        { tone: 'neutral', label: 'Idle' },
  no_key:      { tone: 'warn',    label: 'No credential' },
  key_expired: { tone: 'warn',    label: 'Credential expired' },
  revoked:     { tone: 'danger',  label: 'Revoked' }
};

export function AgentCard({
  name, slug, status = 'idle', permission = 'Read only', workspace, lastActive,
  requests, transport = 'MCP', onOpen, className = '', ...rest
}) {
  const s = STATUS[status] || STATUS.idle;
  return (
    <button type="button" onClick={onOpen} className={className} style={{
      display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', width: '100%',
      padding: 16, background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 'var(--r-3)', cursor: 'pointer', transition: 'border-color var(--d-1) var(--ease), box-shadow var(--d-1) var(--ease)'
    }} {...rest}>
      <div className="row" style={{ gap: 10, width: '100%' }}>
        <span aria-hidden="true" style={{
          width: 30, height: 30, flex: 'none', borderRadius: 'var(--r-2)', display: 'grid', placeItems: 'center',
          border: '1px solid var(--line-2)', background: 'var(--surface-2)', color: 'var(--ink-2)'
        }}><Icon name="agent" size={16} /></span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="ad-truncate" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.011em' }}>{name}</span>
          {slug ? <span className="ad-truncate ad-mono-sm" style={{ display: 'block', color: 'var(--ink-3)' }}>{slug}</span> : null}
        </span>
        <Badge tone={s.tone} dot pulse={status === 'active'}>{s.label}</Badge>
      </div>
      <dl className="dl" style={{ gridTemplateColumns: 'auto 1fr', gap: '6px 16px', width: '100%' }}>
        <dt>Permission</dt><dd>{permission}</dd>
        <dt>Transport</dt><dd><span className="ad-mono-sm">{transport}</span></dd>
        {workspace ? <><dt>Workspace</dt><dd className="ad-truncate">{workspace}</dd></> : null}
        <dt>Last active</dt><dd>{lastActive || 'Never'}</dd>
        {requests != null ? <><dt>Requests, 7d</dt><dd className="ad-num">{requests}</dd></> : null}
      </dl>
    </button>
  );
}
