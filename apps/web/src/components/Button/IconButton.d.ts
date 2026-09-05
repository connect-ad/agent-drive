import type { ReactNode } from 'react';
export interface IconButtonProps {
  icon: ReactNode;
  /** Required — becomes both aria-label and the native tooltip. */
  label: string;
  tone?: 'default'|'danger';
  bordered?: boolean;
  size?: 'sm'|'lg';
  disabled?: boolean;
  className?: string;
  onClick?: (e: any) => void;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
