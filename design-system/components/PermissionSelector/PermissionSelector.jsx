import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

const PRESETS = [
  { id: 'read', label: 'Read only', desc: 'List and download files. Cannot change anything.', scopes: ['files:read'] },
  { id: 'write', label: 'Read and write', desc: 'List, download, upload and overwrite files.', scopes: ['files:read', 'files:write'] },
  { id: 'full', label: 'Full access', desc: 'Read, write and permanently delete files.', scopes: ['files:read', 'files:write', 'files:delete'] }
];

export function PermissionSelector({ value = 'read', onChange, name = 'permission', presets = PRESETS, disabled = false, className = '', ...rest }) {
  return (
    <div className={className} role="radiogroup" aria-label="Agent permissions"
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }} {...rest}>
      {presets.map(p => {
        const on = p.id === value;
        return (
          <label key={p.id} style={{
            display: 'flex', gap: 12, padding: '12px 14px', cursor: disabled ? 'not-allowed' : 'pointer',
            border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line-2)'),
            background: on ? 'var(--accent-soft)' : 'var(--surface)',
            borderRadius: 'var(--r-2)', boxShadow: on ? 'var(--ring)' : 'none',
            transition: 'border-color var(--d-1) var(--ease), background var(--d-1) var(--ease)', opacity: disabled ? 0.6 : 1
          }}>
            <input type="radio" name={name} value={p.id} checked={on} disabled={disabled}
              onChange={() => onChange && onChange(p.id)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
            <span aria-hidden="true" style={{
              width: 16, height: 16, marginTop: 2, flex: 'none', borderRadius: 999, display: 'grid', placeItems: 'center',
              border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line-3)'), background: on ? 'var(--accent)' : 'var(--surface)'
            }}>{on ? <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--on-accent)' }} /> : null}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{p.label}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{p.desc}</span>
              <span style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {p.scopes.map(s => (
                  <span key={s} className="badge badge--mono">{s}</span>
                ))}
              </span>
            </span>
            {p.id === 'full' ? <Icon name="alert" size={14} style={{ flex: 'none', color: 'var(--warn)', marginTop: 2 }} title="Includes permanent deletion" /> : null}
          </label>
        );
      })}
    </div>
  );
}

export const permissionPresets = PRESETS;
