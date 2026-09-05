export interface UploadDropzoneProps {
  /** Human-readable per-file ceiling from the plan quota. */
  maxSize?: string;
  onFiles?: (files: File[]) => void;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}
export declare function UploadDropzone(props: UploadDropzoneProps): JSX.Element;
