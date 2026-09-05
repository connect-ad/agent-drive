import React, { useEffect, useRef } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../Button/IconButton.jsx';

export function Modal({ open = true, title, description, mark, tone = 'neutral', size = 'sm', footer, onClose, children, className = '', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    if (ref.current) {
      const f = ref.current.querySelector('input,select,textarea,button,[href],[tabindex]:not([tabindex="-1"])');
      if (f) f.focus();
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title}
        className={['modal', size !== 'sm' ? 'modal--' + size : '', className].filter(Boolean).join(' ')} {...rest}>
        <header className="modal__head">
          {mark ? <div className={['modal__mark', tone !== 'neutral' ? 'modal__mark--' + tone : ''].filter(Boolean).join(' ')}>{mark}</div> : null}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 className="modal__title">{title}</h2>
            {description ? <p className="modal__desc">{description}</p> : null}
          </div>
          {onClose ? <div className="modal__x"><IconButton icon={<Icon name="x" size={15} />} label="Close" onClick={onClose} /></div> : null}
        </header>
        {children ? <div className="modal__body">{children}</div> : null}
        {footer ? <div className="modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
