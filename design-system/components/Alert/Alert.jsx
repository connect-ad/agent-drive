import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

const ICO = { neutral: 'info', accent: 'info', ok: 'check', warn: 'alert', danger: 'alert' };

export function Alert({ tone = 'neutral', title, children, actions, icon, className = '', ...rest }) {
  return (
    <div className={['alert', tone !== 'neutral' ? 'alert--' + tone : '', className].filter(Boolean).join(' ')}
      role={tone === 'danger' ? 'alert' : 'status'} {...rest}>
      <span className="alert__ico">{icon || <Icon name={ICO[tone]} size={16} />}</span>
      <div className="alert__body">
        {title ? <p className="alert__title">{title}</p> : null}
        {children ? <div className="alert__text">{children}</div> : null}
        {actions ? <div className="alert__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
