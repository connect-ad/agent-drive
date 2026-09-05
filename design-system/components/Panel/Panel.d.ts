import type { ReactNode } from 'react';
export interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  /** Removes body padding — use when the body is a table or list. */
  flush?: boolean;
  children?: ReactNode;
  className?: string;
}
export declare function Panel(props: PanelProps): JSX.Element;
