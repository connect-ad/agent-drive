import React from 'react';

export function Menu({ items = [], className = '', ...rest }) {
  return (
    <div className={['menu', className].filter(Boolean).join(' ')} role="menu" {...rest}>
      {items.map((it, i) => {
        if (it.type === 'separator') return <div key={'s' + i} className="menu__sep" role="separator" />;
        if (it.type === 'label') return <div key={'l' + i} className="menu__label">{it.label}</div>;
        return (
          <button key={it.label + i} type="button" role="menuitem" disabled={it.disabled}
            className={['menu__item', it.danger ? 'menu__item--danger' : ''].filter(Boolean).join(' ')}
            onClick={it.onSelect}>
            {it.icon}<span>{it.label}</span>{it.shortcut ? <span className="menu__kbd">{it.shortcut}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
