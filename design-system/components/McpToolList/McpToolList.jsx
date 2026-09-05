import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

export function McpToolList({ tools = [], className = '', ...rest }) {
  return (
    <ul className={className} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }} {...rest}>
      {tools.map((t, i) => (
        <li key={t.name} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 16px',
          borderTop: i === 0 ? 0 : '1px solid var(--line)',
          background: t.enabled === false ? 'var(--surface-2)' : 'transparent'
        }}>
          <span aria-hidden="true" style={{ marginTop: 1, flex: 'none', color: t.enabled === false ? 'var(--ink-4)' : 'var(--ok)' }}>
            <Icon name={t.enabled === false ? 'lock' : 'check'} size={14} />
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <code className="ad-mono" style={{ color: t.enabled === false ? 'var(--ink-3)' : 'var(--ink)', fontWeight: 500 }}>{t.name}</code>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-2)', marginTop: 2, textWrap: 'pretty' }}>{t.description}</span>
            {t.enabled === false ? (
              <span style={{ display: 'block', fontSize: 12, color: 'var(--warn)', marginTop: 4 }}>
                Unavailable to this agent. Requires <code className="inline">{t.scope}</code>.
              </span>
            ) : null}
          </span>
          <span className="badge badge--mono" style={{ flex: 'none', marginTop: 1 }}>{t.scope}</span>
        </li>
      ))}
    </ul>
  );
}

export const mcpTools = [
  { name: 'list_files',    scope: 'files:read',   description: 'List files and folders in a path, with size, MIME type and version count.' },
  { name: 'get_file',      scope: 'files:read',   description: 'Fetch a file\u2019s contents, or a time-limited download URL for large objects.' },
  { name: 'get_metadata',  scope: 'files:read',   description: 'Return metadata for one object without transferring its body.' },
  { name: 'search_files',  scope: 'files:read',   description: 'Search filenames, paths and extracted text within the agent\u2019s workspace.' },
  { name: 'create_file',   scope: 'files:write',  description: 'Write a new file. Fails if the path already exists.' },
  { name: 'update_file',   scope: 'files:write',  description: 'Overwrite an existing file and record a new version.' },
  { name: 'create_folder', scope: 'files:write',  description: 'Create a folder at the given path.' },
  { name: 'move_file',     scope: 'files:write',  description: 'Move or rename an object within the workspace.' },
  { name: 'copy_file',     scope: 'files:write',  description: 'Copy an object to a new path in the same workspace.' },
  { name: 'delete_file',   scope: 'files:delete', description: 'Move an object to the trash. Recoverable for 30 days.' }
];
