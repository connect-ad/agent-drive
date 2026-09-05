import React, { useId } from 'react';

export function Input({
  label, hint, error, optional = false, required = false, prefix, suffix, leadingIcon,
  mono = false, size = 'md', multiline = false, id, className = '', disabled, ...rest
}) {
  const auto = useId();
  const inputId = id || auto;
  const hintId = hint ? inputId + '-hint' : undefined;
  const errId = error ? inputId + '-err' : undefined;
  const Tag = multiline ? 'textarea' : 'input';
  const cls = ['field', error ? 'is-error' : '', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ');
  const inputCls = ['field__input', mono ? 'field__input--mono' : '', size === 'lg' ? 'field__input--lg' : ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {label ? (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {required ? <span className="field__req" aria-hidden="true">*</span> : null}
          {optional ? <span className="field__opt">Optional</span> : null}
        </label>
      ) : null}
      <div className="field__wrap">
        {prefix ? <span className="field__affix">{prefix}</span> : null}
        {leadingIcon ? <span className="field__ico">{leadingIcon}</span> : null}
        <Tag id={inputId} className={inputCls} disabled={disabled} required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errId, hintId].filter(Boolean).join(' ') || undefined} {...rest} />
        {suffix ? <span className="field__affix field__affix--end">{suffix}</span> : null}
      </div>
      {error ? <p className="field__error" id={errId}>{error}</p> : hint ? <p className="field__hint" id={hintId}>{hint}</p> : null}
    </div>
  );
}
