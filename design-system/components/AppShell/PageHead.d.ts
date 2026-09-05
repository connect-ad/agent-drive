import type { ReactNode } from 'react';
export interface PageHeadProps {
  title: string;
  /** One sentence. Explain the page's job to a first-time user, then stop. */
  subtitle?: string;
  actions?: ReactNode;
  /** Badges rendered inline after the title. */
  meta?: ReactNode;
  className?: string;
}
export declare function PageHead(props: PageHeadProps): JSX.Element;
