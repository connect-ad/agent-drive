import React from 'react';

export function EmptyState({ icon, title, children, actions, tone = 'neutral', compact = false, className = '', ...rest }) {
  return (
    <div className={['empty', className].filter(Boolean).join(' ')}
      style={compact ? { padding: '40px 20px' } : undefined} {...rest}>
      {icon ? <div className={['empty__mark', tone === 'danger' ? 'empty__mark--danger' : ''].filter(Boolean).join(' ')}>{icon}</div> : null}
      <div>
        <p className="empty__title">{title}</p>
        {children ? <p className="empty__text" style={{ marginTop: 6 }}>{children}</p> : null}
      </div>
      {actions ? <div className="empty__actions">{actions}</div> : null}
    </div>
  );
}
