import React from 'react';

export function PageHead({ title, subtitle, actions, meta, className = '', ...rest }) {
  return (
    <div className={['page-head', className].filter(Boolean).join(' ')} {...rest}>
      <div className="page-head__body">
        <div className="row">
          <h1 className="page-head__title">{title}</h1>
          {meta}
        </div>
        {subtitle ? <p className="page-head__sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </div>
  );
}
