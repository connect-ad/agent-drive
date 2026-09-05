import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Button, Icon } from '../components/index.js';

/**
 * 8.27 404 · 8.28 403 · 8.29 500 · 8.30 Maintenance (MVP-1).
 * Centred and minimal. Per Principle 5 these never expose internals — no stack
 * traces, no object keys, no raw tenant IDs. Each says what happened and what to
 * do next.
 */

function Centered({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--s-8)', background: 'var(--paper)' }}>
      <div style={{ maxWidth: '56ch', width: '100%' }}>{children}</div>
    </div>
  );
}

export function NotFound({ signedIn = true }) {
  return (
    <Centered>
      <EmptyState
        icon={<Icon name="search" size={19} />}
        title="404 — We couldn't find that page."
        actions={
          signedIn
            ? <Button as={Link} to="/">Go to dashboard</Button>
            : <Button as={Link} to="/">Go home</Button>
        }
      >
        The link may be outdated, or the resource may have been moved or deleted.
      </EmptyState>
    </Centered>
  );
}

export function Forbidden() {
  return (
    <Centered>
      <EmptyState
        tone="danger"
        icon={<Icon name="shield" size={19} />}
        title="403 — You don't have access to this."
        actions={<Button as={Link} to="/" variant="secondary">Back to dashboard</Button>}
      >
        You might not be a member of this workspace, or your role doesn't allow this action.
      </EmptyState>
    </Centered>
  );
}

export function ServerError({ onRetry }) {
  return (
    <Centered>
      <EmptyState
        tone="danger"
        icon={<Icon name="alert" size={19} />}
        title="Something went wrong on our end."
        actions={<Button onClick={onRetry}>Retry</Button>}
      >
        We've logged this and we're looking into it. Try again in a moment.
      </EmptyState>
    </Centered>
  );
}

export function Maintenance() {
  return (
    <Centered>
      <EmptyState
        icon={<Icon name="gear" size={19} />}
        title="We're doing quick maintenance."
      >
        AgentDrive will be back in a few minutes. Your data isn't affected.
      </EmptyState>
    </Centered>
  );
}
