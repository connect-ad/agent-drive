import type { ReactNode } from 'react';
export interface SelectOption { value: string; label: string }
export interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  options?: (string | SelectOption)[];
  required?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
  onChange?: (e: any) => void;
}
export declare function Select(props: SelectProps): JSX.Element;
