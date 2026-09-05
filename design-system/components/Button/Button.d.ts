import type { ReactNode, ElementType } from 'react';
export interface ButtonProps {
  /** primary = one per view. secondary = default. ghost = toolbar. danger = destructive commit. */
  variant?: 'primary'|'secondary'|'ghost'|'danger'|'danger-outline'|'link'|'dark';
  size?: 'sm'|'md'|'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  /** Shows a spinner and blocks input. Keep the label visible — never swap it for "Loading…". */
  loading?: boolean;
  full?: boolean;
  as?: ElementType;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: (e: any) => void;
  href?: string;
  type?: 'button'|'submit'|'reset';
}
export declare function Button(props: ButtonProps): JSX.Element;
