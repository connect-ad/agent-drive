export interface AgentCardProps {
  name: string;
  /** Machine identifier, shown in mono under the name. */
  slug?: string;
  /** no_key and key_expired are the two states that need user action. */
  status?: 'active'|'idle'|'no_key'|'key_expired'|'revoked';
  permission?: string;
  workspace?: string;
  lastActive?: string;
  requests?: number;
  transport?: string;
  onOpen?: () => void;
  className?: string;
}
export declare function AgentCard(props: AgentCardProps): JSX.Element;
