import React from 'react';

export function Meter({ value = 0, max = 1, tone, label, className = '', ...rest }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const auto = pct >= 0.95 ? 'danger' : pct >= 0.8 ? 'warn' : '';
  const t = tone || auto;
  return (
    <div className={['meter', className].filter(Boolean).join(' ')} role="progressbar"
      aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label} {...rest}>
      <div className={['meter__fill', t ? 'meter__fill--' + t : ''].filter(Boolean).join(' ')} style={{ width: (pct * 100).toFixed(1) + '%' }} />
    </div>
  );
}
