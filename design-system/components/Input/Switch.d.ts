export interface SwitchProps {
  /** Switches apply immediately — label the on-state, e.g. "Allow agent writes". */
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (e: any) => void;
}
export declare function Switch(props: SwitchProps): JSX.Element;
