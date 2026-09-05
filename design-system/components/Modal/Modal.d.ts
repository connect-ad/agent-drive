import type { ReactNode } from 'react';
export interface ModalProps {
  open?: boolean;
  /** Phrase as a question for confirmations: "Revoke this API key?" */
  title: string;
  /** Says what will actually happen. Never "Are you sure?". */
  description?: string;
  mark?: ReactNode;
  tone?: 'neutral'|'accent'|'danger';
  size?: 'sm'|'md'|'lg';
  footer?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}
export declare function Modal(props: ModalProps): JSX.Element;
