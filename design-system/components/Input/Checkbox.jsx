import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

export function Checkbox({ label, description, radio = false, className = '', ...rest }) {
  return (
    <label className={['check', className].filter(Boolean).join(' ')}>
      <input type={radio ? 'radio' : 'checkbox'} {...rest} />
      <span className={['check__box', radio ? 'check__box--radio' : ''].filter(Boolean).join(' ')} aria-hidden="true">
        {radio ? <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} /> : <Icon name="check" size={11} strokeWidth={2.6} />}
      </span>
      <span className="check__body">
        <span className="check__title">{label}</span>
        {description ? <span className="check__desc" style={{ display: 'block' }}>{description}</span> : null}
      </span>
    </label>
  );
}
