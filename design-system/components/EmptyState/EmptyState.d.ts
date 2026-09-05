import type { ReactNode } from 'react';
export interface EmptyStateProps {
  icon?: ReactNode;
  /** A statement about this workspace, not "No data". */
  title: string;
  /** One sentence telling the user the next action. */
  children?: ReactNode;
  actions?: ReactNode;
  tone?: 'neutral'|'danger';
  compact?: boolean;
  className?: string;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
