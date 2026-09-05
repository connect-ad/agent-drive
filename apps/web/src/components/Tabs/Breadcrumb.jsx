import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

export function Breadcrumb({ items = [], className = '', ...rest }) {
  return (
    <nav className={['crumbs', className].filter(Boolean).join(' ')} aria-label="Folder path" {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={it.label + i}>
            {last
              ? <span className="crumbs__item" aria-current="page">{it.label}</span>
              : <a className="crumbs__item" href={it.href || '#'} onClick={it.onSelect}>{it.label}</a>}
            {last ? null : <span className="crumbs__sep" aria-hidden="true"><Icon name="chevronRight" size={12} /></span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
