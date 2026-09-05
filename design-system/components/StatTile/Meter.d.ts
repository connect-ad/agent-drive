export interface MeterProps {
  value: number;
  max?: number;
  /** Omit to auto-escalate: warn at 80%, danger at 95%. */
  tone?: 'ok'|'warn'|'danger';
  label?: string;
  className?: string;
}
export declare function Meter(props: MeterProps): JSX.Element;
