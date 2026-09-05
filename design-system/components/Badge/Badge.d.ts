import type { ReactNode } from 'react';
export interface BadgeProps {
  /** ok = active/healthy. warn = expiring/degraded. danger = revoked/failed. accent = agent-scoped. */
  tone?: 'neutral'|'accent'|'ok'|'warn'|'danger'|'solid';
  /** Status dot. Always pair with a word — never colour alone. */
  dot?: boolean;
  pulse?: boolean;
  /** Mono for scopes, key prefixes, MIME types. */
  mono?: boolean;
  size?: 'md'|'lg';
  children?: ReactNode;
  className?: string;
}
export declare function Badge(props: BadgeProps): JSX.Element;
