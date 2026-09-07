import React, { useState } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../Button/IconButton.jsx';

export function AppShell({
  nav = [], active, workspace, workspaceSlot, user, topbar, topbarActions, children, flush = false, onNavigate, className = '', ...rest
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={['shell', open ? 'is-open' : '', className].filter(Boolean).join(' ')} {...rest}>
      <nav className="shell__nav" aria-label="Primary">
        <div className="shell__brand">
          <span className="shell__logo" aria-hidden="true">A</span>
          <span className="shell__wordmark">AgentDisk</span>
        </div>
        {/* The card is a display of the current workspace and nothing more - the
            chevron is decoration. `workspaceSlot` lets a host put a real control
            in its place (AgentDisk puts the workspace switcher there) without
            this component having to own menu state. */}
        {workspaceSlot ? <div className="shell__ws">{workspaceSlot}</div> : workspace ? (
          <div className="shell__ws">
            <button type="button" className="shell__wsbtn">
              <span className="shell__wsmark" aria-hidden="true">{(workspace.name || 'W').slice(0, 1).toUpperCase()}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="shell__wsname" style={{ display: 'block' }}>{workspace.name}</span>
                <span className="shell__wsmeta">{workspace.meta}</span>
              </span>
              <Icon name="chevronUpDown" size={14} />
            </button>
          </div>
        ) : null}
        <div className="shell__scroll">
          {nav.map((group, gi) => (
            <div className="shell__group" key={group.label || gi}>
              {group.label ? <p className="shell__grouplabel">{group.label}</p> : null}
              {group.items.map(it => (
                <a key={it.id} href={it.href || '#'} className="shell__link"
                  aria-current={it.id === active ? 'page' : undefined}
                  onClick={onNavigate ? (e) => { e.preventDefault(); onNavigate(it.id); setOpen(false); } : undefined}>
                  <span className="shell__linkico"><Icon name={it.icon} size={15} /></span>
                  <span className="ad-truncate">{it.label}</span>
                  {it.badge != null ? <span className="shell__badge">{it.badge}</span> : null}
                </a>
              ))}
            </div>
          ))}
        </div>
        {user ? (
          <div className="shell__foot">
            <button type="button" className="shell__user">
              <span className="avatar" aria-hidden="true">{(user.name || 'U').slice(0, 1).toUpperCase()}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="ad-truncate" style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{user.name}</span>
                <span className="ad-truncate" style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{user.email}</span>
              </span>
              <Icon name="chevronUpDown" size={14} />
            </button>
          </div>
        ) : null}
      </nav>
      <div className="shell__main">
        <header className="shell__top">
          <IconButton className="shell__burger" icon={<Icon name={open ? 'x' : 'menu'} size={17} />}
            label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)} />
          {topbar}
          {topbarActions ? <div className="shell__topactions">{topbarActions}</div> : null}
        </header>
        <main className={['shell__page', flush ? 'shell__page--flush' : ''].filter(Boolean).join(' ')}>{children}</main>
      </div>
    </div>
  );
}
