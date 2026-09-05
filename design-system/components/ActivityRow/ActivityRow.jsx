import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

const ACTION = {
  'file.upload':    { icon: 'upload',   label: 'uploaded' },
  'file.download':  { icon: 'download', label: 'downloaded' },
  'file.delete':    { icon: 'trash',    label: 'deleted' },
  'file.move':      { icon: 'link',     label: 'moved' },
  'folder.create':  { icon: 'folder',   label: 'created folder' },
  'key.create':     { icon: 'key',      label: 'created API key' },
  'key.revoke':     { icon: 'lock',     label: 'revoked API key' },
  'agent.create':   { icon: 'agent',    label: 'created agent' },
  'mcp.call':       { icon: 'terminal', label: 'called' },
  'auth.denied':    { icon: 'shield',   label: 'was denied access to' }
};

export function ActivityRow({ action, actor, actorType = 'user', resource, time, status = 'ok', detail, className = '', ...rest }) {
  const a = ACTION[action] || { icon: 'activity', label: action };
  const denied = status === 'denied' || status === 'error';
  return (
    <div className={className} style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', borderBottom: '1px solid var(--line)'
    }} {...rest}>
      <span aria-hidden="true" style={{
        width: 24, height: 24, flex: 'none', marginTop: 1, borderRadius: 'var(--r-1)', display: 'grid', placeItems: 'center',
        border: '1px solid ' + (denied ? 'var(--danger-line)' : 'var(--line)'),
        background: denied ? 'var(--danger-soft)' : 'var(--surface-2)',
        color: denied ? 'var(--danger)' : 'var(--ink-3)'
      }}><Icon name={denied ? 'shield' : a.icon} size={13} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', textWrap: 'pretty' }}>
          <span style={{
            fontWeight: 500, color: 'var(--ink)',
            fontFamily: actorType === 'agent' ? 'var(--font-mono)' : undefined,
            fontSize: actorType === 'agent' ? 12 : undefined
          }}>{actor}</span>
          {' '}{a.label}{' '}
          {resource ? <code className="inline">{resource}</code> : null}
        </p>
        {detail ? <p className="ad-meta" style={{ marginTop: 3 }}>{detail}</p> : null}
      </div>
      <span className="ad-mono-sm" style={{ flex: 'none', color: 'var(--ink-4)', marginTop: 2 }}>{time}</span>
    </div>
  );
}
