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
 * `align` decides which way it opens. It was written for the sidebar footer,
 * where the shared `.wsx__menu` would have dropped off the bottom of the
 * viewport, so "up" is still the default. The top bar passes "down".
 *
 * Actions arrive as props rather than from `useAuth()` so this stays a piece of
 * UI with one job; `App.jsx` decides what signing out means.
 */
export default function AccountMenu({ name, email, profileHref, onNavigate, onSignOut, align = "up" }) {
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
        className={align === "up" ? "shell__user" : "shell__user shell__user--bar"}
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        /*
         * Names the control, not just the person in it.
         *
         * In the sidebar this button sat under a heading and beside a workspace
         * switcher, and "Sign out" was additionally a button of its own in the
         * top bar, so nothing had to say what the card was for. In the top bar
         * it is a bare pill whose only text is the signed-in address, and sign
         * out now lives solely behind it — leaving the name as the address alone
         * gives a screen-reader user no reason to open it, and the regression
         * suite caught exactly that.
         *
         * The visible text is a substring of this label, which is what keeps
         * voice control working: "click kernelv5…" still matches.
         */
        aria-label={`Account menu for ${label}`}
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
        <div className={`wsx__menu ${align === "up" ? "wsx__menu--up" : "wsx__menu--right"}`} role="menu" aria-label="Account">
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
