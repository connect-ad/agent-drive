import type { ReactNode } from 'react';
export interface ToastProps {
  tone?: 'neutral'|'ok'|'warn'|'danger';
  /** Past tense, states the outcome: "Key revoked". */
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}
export declare function Toast(props: ToastProps): JSX.Element;
