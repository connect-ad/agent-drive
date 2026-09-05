import React from 'react';

export function Switch({ label, className = '', ...rest }) {
  return (
    <label className={['switch', className].filter(Boolean).join(' ')}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="switch__track" aria-hidden="true"><span className="switch__knob" /></span>
      {label ? <span style={{ fontSize: 13 }}>{label}</span> : null}
    </label>
  );
}
