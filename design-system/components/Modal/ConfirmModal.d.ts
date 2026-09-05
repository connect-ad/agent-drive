import type { ReactNode } from 'react';
export interface ConfirmModalProps {
  open?: boolean;
  title: string;
  description?: string;
  /** Name the action: "Delete file", "Revoke key" — never "OK"/"Yes". */
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
  children?: ReactNode;
}
export declare function ConfirmModal(props: ConfirmModalProps): JSX.Element;
