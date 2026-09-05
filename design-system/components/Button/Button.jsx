import React from 'react';

export function Button({
  variant = 'primary', size = 'md', icon, iconRight, loading = false,
  full = false, as: Tag = 'button', className = '', children, disabled, ...rest
}) {
  const cls = ['btn', 'btn--' + variant, 'btn--' + size, full ? 'btn--full' : '', loading ? 'is-loading' : '', className]
    .filter(Boolean).join(' ');
  return (
    <Tag className={cls} disabled={Tag === 'button' ? (disabled || loading) : undefined}
      aria-disabled={disabled || loading || undefined} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="btn__spin" /> : null}
      {icon ? <span className="btn__ico">{icon}</span> : null}
      <span className="btn__label">{children}</span>
      {iconRight ? <span className="btn__ico">{iconRight}</span> : null}
    </Tag>
  );
}
