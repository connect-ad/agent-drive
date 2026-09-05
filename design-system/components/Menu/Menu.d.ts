import type { ReactNode } from 'react';
export interface MenuItem {
  type?: 'item'|'separator'|'label';
  label?: string;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}
export interface MenuProps {
  /** Destructive items go last, after a separator. */
  items: MenuItem[];
  className?: string;
}
export declare function Menu(props: MenuProps): JSX.Element;
