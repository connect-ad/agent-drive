import React from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../Button/IconButton.jsx';

const ICO = { neutral: 'info', ok: 'check', warn: 'alert', danger: 'alert' };

export function Toast({ tone = 'neutral', title, children, action, onDismiss, className = '', ...rest }) {
  return (
    <div className={['toast', 'toast--' + tone, className].filter(Boolean).join(' ')} role="status" aria-live="polite" {...rest}>
      <span className="toast__ico"><Icon name={ICO[tone]} size={15} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="toast__title">{title}</p>
        {children ? <p className="toast__text">{children}</p> : null}
        {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
      </div>
      {onDismiss ? <IconButton icon={<Icon name="x" size={13} />} label="Dismiss" onClick={onDismiss} /> : null}
    </div>
  );
}
