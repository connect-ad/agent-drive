export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  /** Multi-line paragraph placeholder; the last line is shortened. */
  lines?: number;
  gap?: number;
  className?: string;
}
export declare function Skeleton(props: SkeletonProps): JSX.Element;
