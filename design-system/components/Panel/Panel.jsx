import React from 'react';

export function Panel({ title, subtitle, actions, footer, flush = false, className = '', children, ...rest }) {
  return (
    <section className={['panel', className].filter(Boolean).join(' ')} {...rest}>
      {(title || actions) ? (
        <header className="panel__head">
          <div style={{ minWidth: 0 }}>
            {title ? <h2 className="panel__title">{title}</h2> : null}
            {subtitle ? <p className="panel__sub">{subtitle}</p> : null}
          </div>
          {actions ? <div className="panel__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className={['panel__body', flush ? 'panel__body--flush' : ''].filter(Boolean).join(' ')}>{children}</div>
      {footer ? <footer className="panel__foot">{footer}</footer> : null}
    </section>
  );
}
