import React, { useId } from 'react';
import { Icon } from '../Icon/Icon.jsx';

export function Select({ label, hint, error, options = [], required = false, id, className = '', disabled, children, ...rest }) {
  const auto = useId();
  const selId = id || auto;
  const cls = ['field', error ? 'is-error' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {label ? <label className="field__label" htmlFor={selId}>{label}{required ? <span className="field__req">*</span> : null}</label> : null}
      <div className="select">
        <select id={selId} className="select__el" disabled={disabled} aria-invalid={error ? true : undefined} {...rest}>
          {children || options.map(o => {
            const v = typeof o === 'string' ? o : o.value;
            const l = typeof o === 'string' ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <span className="select__chev"><Icon name="chevronDown" size={14} /></span>
      </div>
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}
