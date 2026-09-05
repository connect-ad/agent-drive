export interface ActivityRowProps {
  /** Event type, e.g. 'file.upload', 'mcp.call', 'auth.denied'. */
  action: string;
  /** Human name or agent slug. */
  actor: string;
  /** agent renders the actor in mono — humans and agents must be visually distinct. */
  actorType?: 'user'|'agent';
  /** Path or key name. Never a raw secret or internal object key. */
  resource?: string;
  time: string;
  status?: 'ok'|'denied'|'error';
  detail?: string;
  className?: string;
}
export declare function ActivityRow(props: ActivityRowProps): JSX.Element;
