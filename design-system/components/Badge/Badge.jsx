import React from 'react';

export function Badge({ tone = 'neutral', dot = false, pulse = false, mono = false, size = 'md', className = '', children, ...rest }) {
  const cls = ['badge', tone !== 'neutral' ? 'badge--' + tone : '', mono ? 'badge--mono' : '',
    size === 'lg' ? 'badge--lg' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot ? <span className={['badge__dot', pulse ? 'badge__dot--pulse' : ''].filter(Boolean).join(' ')} /> : null}
      {children}
    </span>
  );
}
