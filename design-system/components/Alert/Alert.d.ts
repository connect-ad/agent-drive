import type { ReactNode } from 'react';
export interface AlertProps {
  tone?: 'neutral'|'accent'|'ok'|'warn'|'danger';
  title?: string;
  /** Body copy. Say what happened and what to do next — no stack traces, no internal IDs. */
  children?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}
export declare function Alert(props: AlertProps): JSX.Element;
