export interface CheckboxProps {
  label: string;
  /** One line explaining the consequence of ticking it. */
  description?: string;
  /** Renders as a radio dot. Group with a shared name. */
  radio?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
  onChange?: (e: any) => void;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
