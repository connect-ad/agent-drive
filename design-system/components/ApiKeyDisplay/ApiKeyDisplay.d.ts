export interface ApiKeyDisplayProps {
  /** Full secret. Pass ONLY on the create-response screen; never fetch it again. */
  secret?: string;
  /** Last four characters, the only part persisted for display. */
  lastFour?: string;
  prefix?: string;
  /** true = show-once panel with copy. false = permanent masked form. */
  revealed?: boolean;
  onAcknowledge?: () => void;
  className?: string;
}
export declare function ApiKeyDisplay(props: ApiKeyDisplayProps): JSX.Element;
