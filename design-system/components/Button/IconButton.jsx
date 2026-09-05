import React from 'react';

export function IconButton({ icon, label, tone = 'default', bordered = false, size = 'sm', className = '', ...rest }) {
  const cls = ['icon-btn', bordered ? 'icon-btn--bordered' : '', tone === 'danger' ? 'icon-btn--danger' : '',
    size === 'lg' ? 'icon-btn--lg' : '', className].filter(Boolean).join(' ');
  return <button type="button" className={cls} aria-label={label} title={label} {...rest}>{icon}</button>;
}
