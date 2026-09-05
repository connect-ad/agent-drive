export interface McpTool {
  name: string;
  /** Scope required to call it — displayed on every row so permission is never implicit. */
  scope: string;
  description: string;
  /** false renders the row locked with the missing scope named. */
  enabled?: boolean;
}
export interface McpToolListProps {
  tools: McpTool[];
  className?: string;
}
export declare function McpToolList(props: McpToolListProps): JSX.Element;
/** The ten MVP MCP tools with their required scopes. */
export declare const mcpTools: McpTool[];
