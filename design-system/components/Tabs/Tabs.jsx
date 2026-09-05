import React from 'react';

export function Tabs({ items = [], value, onChange, className = '', ...rest }) {
  return (
    <div className={['tabs', className].filter(Boolean).join(' ')} role="tablist" {...rest}>
      {items.map(t => (
        <button key={t.value} type="button" role="tab" aria-selected={t.value === value}
          className="tabs__item" onClick={() => onChange && onChange(t.value)}>
          {t.label}
          {t.count != null ? <span className="tabs__count">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
