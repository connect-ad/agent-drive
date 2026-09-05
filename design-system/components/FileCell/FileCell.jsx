import React from 'react';
import { Icon } from '../Icon/Icon.jsx';

const EXT_LABEL = {
  pdf: 'PDF', json: 'JSON', md: 'MD', txt: 'TXT', csv: 'CSV', png: 'PNG', jpg: 'JPG',
  jpeg: 'JPG', zip: 'ZIP', html: 'HTML', js: 'JS', ts: 'TS', py: 'PY', sql: 'SQL', yaml: 'YML', log: 'LOG'
};

export function FileCell({ name, kind = 'file', meta, ext, agentWritten = false, ...rest }) {
  const isFolder = kind === 'folder';
  const label = ext || (name && name.indexOf('.') > -1 ? name.split('.').pop().toLowerCase() : '');
  return (
    <span className="row" style={{ gap: 10 }} {...rest}>
      <span aria-hidden="true" style={{
        width: 26, height: 26, flex: 'none', borderRadius: 'var(--r-1)', display: 'grid', placeItems: 'center',
        border: '1px solid ' + (isFolder ? 'var(--accent-line)' : 'var(--line)'),
        background: isFolder ? 'var(--accent-soft)' : 'var(--surface-2)',
        color: isFolder ? 'var(--accent-ink)' : 'var(--ink-3)',
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: 0
      }}>
        {isFolder ? <Icon name="folder" size={14} /> : (EXT_LABEL[label] || <Icon name="file" size={14} />)}
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="ad-truncate" style={{ display: 'block', color: 'var(--ink)', fontWeight: 500 }}>{name}</span>
        {meta ? <span className="ad-truncate" style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{meta}</span> : null}
      </span>
      {agentWritten ? (
        <span title="Written by an agent" aria-label="Written by an agent" style={{
          flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, height: 18, padding: '0 5px',
          borderRadius: 'var(--r-1)', border: '1px solid var(--accent-line)', background: 'var(--accent-soft)',
          color: 'var(--accent-ink)', fontFamily: 'var(--font-mono)', fontSize: 10
        }}><Icon name="agent" size={10} />agent</span>
      ) : null}
    </span>
  );
}
