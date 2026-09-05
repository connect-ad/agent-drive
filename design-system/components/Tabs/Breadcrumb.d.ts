export interface CrumbItem { label: string; href?: string; onSelect?: (e: any) => void }
export interface BreadcrumbProps {
  /** First item is the workspace root. Last is rendered as current, not a link. */
  items: CrumbItem[];
  className?: string;
}
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
