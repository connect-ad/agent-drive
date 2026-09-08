import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/index.js';

/**
 * The account menu in the sidebar footer.
 *
 * It replaced a real `<button>` that did nothing at all. That button carried the
 * same chevron as the workspace switcher directly above it, so it read as the
 * one place personal (rather than workspace) settings would live — and clicking
 * it produced no menu, no navigation, and no feedback of any kind. Sign out
 * existed only as a link in the far corner of the top bar, which is not where
 * anybody looks for it.
 *
 * Same reasoning as WorkspaceSwitcher, and deliberately the same shape: not part
 * of the design system, because the library's `Menu` does not carry the trigger,
 * and styled only with `.wsx__*` tokens so the two controls in this footer are
 * indistinguishable from one another. Both should be upstreamed together.
 *
 * The menu opens *upward* — it sits at the bottom of the viewport, and the
 * shared `.wsx__menu` drops downward off-screen from here.
 *
 * Actions arrive as props rather than from `useAuth()` so this stays a piece of
 * UI with one job; `App.jsx` decides what signing out means.
 */
export default function AccountMenu({ name, email, profileHref, onNavigate, onSignOut }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);

  // Escape closes and hands focus back — the one dismissal that owes you the
  // trigger, because you never left it. A click elsewhere is a click *at*
  // something, so focus stays where it landed. Matched to WorkspaceSwitcher.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      if (trigger.current) trigger.current.focus();
    };
    const onPointer = e => {
      if (root.current && !root.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const label = name || email || 'Signed in';

  return (
    <div className="wsx" ref={root}>
      <button
        type="button"
        className="shell__user"
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="avatar" aria-hidden="true">{label.slice(0, 1).toUpperCase()}</span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="ad-truncate" style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{label}</span>
          <span className="ad-truncate" style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{email}</span>
        </span>
        <Icon name="chevronUpDown" size={14} />
      </button>

      {open ? (
        <div className="wsx__menu wsx__menu--up" role="menu" aria-label="Account">
          <button
            type="button"
            role="menuitem"
            className="wsx__item"
            onClick={() => { setOpen(false); onNavigate(profileHref); }}
          >
            <span className="wsx__lead" aria-hidden="true"><Icon name="users" size={14} /></span>
            <span className="wsx__label">Profile</span>
          </button>

          <div className="wsx__sep" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="wsx__item"
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            <span className="wsx__lead" aria-hidden="true"><Icon name="logout" size={14} /></span>
            <span className="wsx__label">Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
