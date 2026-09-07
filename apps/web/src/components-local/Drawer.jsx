import React, { useEffect, useRef } from 'react';
import { IconButton, Icon } from '../components/index.js';

/**
 * Right-side drawer. NOT part of the AgentDisk design system — the library has
 * no Drawer (see docs/design/03 §7.2 "Specified but NOT built"), yet §8.10 File
 * Details requires one. Styled only with design-system tokens; should be
 * upstreamed into the design system rather than forked further.
 *
 * Spec: role=dialog, aria-modal, labelled by the title; traps focus and restores
 * it to the trigger on close; becomes a full-screen sheet below 768px (app.css).
 */
export function Drawer({ open = true, title, footer, onClose, children }) {
  const panel = useRef(null);
  const restoreTo = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    restoreTo.current = document.activeElement;
    const onKey = e => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    const first = panel.current && panel.current.querySelector(
      'input,select,textarea,button,[href],[tabindex]:not([tabindex="-1"])'
    );
    if (first) first.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      if (restoreTo.current && restoreTo.current.focus) restoreTo.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  const titleId = 'dw-title';

  return (
    <div className="dw">
      <div className="dw__scrim" onMouseDown={onClose} />
      <div className="dw__panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="dw__head">
          <h2 className="dw__title" id={titleId}>{title}</h2>
          <span style={{ marginLeft: 'auto' }}>
            <IconButton icon={<Icon name="x" size={15} />} label="Close" onClick={onClose} />
          </span>
        </header>
        <div className="dw__body">{children}</div>
        {footer ? <div className="dw__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
