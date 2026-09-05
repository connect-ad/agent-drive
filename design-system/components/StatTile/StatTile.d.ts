import type { ReactNode } from 'react';
export interface StatTileProps {
  label: string;
  value?: ReactNode;
  /** Small trailing unit: GB, req, %. */
  unit?: string;
  /** Context line — a quota ceiling or period, not a vanity delta. */
  sub?: string;
  icon?: ReactNode;
  /** Adds a usage bar. Omit for counts that have no ceiling. */
  meter?: number;
  meterMax?: number;
  meterTone?: 'ok'|'warn'|'danger';
  loading?: boolean;
  className?: string;
}
export declare function StatTile(props: StatTileProps): JSX.Element;
