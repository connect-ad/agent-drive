export interface PermissionPreset { id: string; label: string; desc: string; scopes: string[] }
export interface PermissionSelectorProps {
  /** Preset id. Default to 'read' on every create form — least privilege. */
  value?: string;
  onChange?: (id: string) => void;
  name?: string;
  presets?: PermissionPreset[];
  disabled?: boolean;
  className?: string;
}
export declare function PermissionSelector(props: PermissionSelectorProps): JSX.Element;
export declare const permissionPresets: PermissionPreset[];
