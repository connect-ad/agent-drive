export interface UploadItemProps {
  name: string;
  size: string;
  /** processing means stored in R2 but text extraction is still queued — never show it as complete. */
  status?: 'queued'|'uploading'|'processing'|'complete'|'failed'|'cancelled';
  /** 0–1. Ignored unless status is uploading. */
  progress?: number;
  /** Human-readable reason. Shown instead of the generic failure line. */
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}
export declare function UploadItem(props: UploadItemProps): JSX.Element;
