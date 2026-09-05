import type { ReactNode } from 'react';
export interface CodeBlockProps {
  code: string;
  /** Shown in the header bar, e.g. "claude_desktop_config.json". */
  filename?: string;
  /** dark for config/terminal, light for inline reference snippets. */
  theme?: 'dark'|'light';
  copyable?: boolean;
  actions?: ReactNode;
  className?: string;
}
export declare function CodeBlock(props: CodeBlockProps): JSX.Element;
