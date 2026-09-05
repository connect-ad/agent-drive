import type { ReactNode } from 'react';
export interface Column {
  key: string;
  header: ReactNode;
  width?: string | number;
  align?: 'left'|'right';
  /** Mono + tabular for sizes, IDs, timestamps. */
  mono?: boolean;
  /** Darker, medium weight — one per row, the thing being named. */
  primary?: boolean;
  className?: string;
  render?: (row: any, index: number) => ReactNode;
}
export interface DataTableProps {
  columns: Column[];
  rows: any[];
  rowKey?: string;
  /** Renders shimmer rows in the real column layout — never a centred spinner. */
  loading?: boolean;
  skeletonRows?: number;
  /** Rendered instead of the table when rows is empty. Pass an EmptyState. */
  empty?: ReactNode;
  hover?: boolean;
  selectedKeys?: (string|number)[];
  onRowClick?: (row: any) => void;
  className?: string;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
