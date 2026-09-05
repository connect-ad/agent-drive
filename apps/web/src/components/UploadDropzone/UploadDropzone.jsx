import React, { useState } from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { Button } from '../Button/Button.jsx';

export function UploadDropzone({ maxSize = '5 GB', onFiles, compact = false, disabled = false, className = '', ...rest }) {
  const [over, setOver] = useState(false);
  return (
    <div className={className} onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (onFiles) onFiles(Array.from(e.dataTransfer.files || [])); }}
      style={{
        border: '1px dashed ' + (over ? 'var(--accent)' : 'var(--line-3)'),
        background: over ? 'var(--accent-soft)' : 'var(--surface-2)',
        borderRadius: 'var(--r-3)', padding: compact ? '20px' : '32px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center',
        transition: 'border-color var(--d-2) var(--ease), background var(--d-2) var(--ease)',
        opacity: disabled ? 0.5 : 1
      }} {...rest}>
      <span aria-hidden="true" style={{
        width: 34, height: 34, borderRadius: 'var(--r-2)', display: 'grid', placeItems: 'center',
        border: '1px solid ' + (over ? 'var(--accent-line)' : 'var(--line-2)'),
        background: 'var(--surface)', color: over ? 'var(--accent)' : 'var(--ink-3)'
      }}><Icon name="upload" size={17} /></span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Drop files here to upload</p>
        <p className="ad-meta" style={{ marginTop: 2 }}>Up to {maxSize} per file. Files upload straight to storage, never through our API.</p>
      </div>
      <Button variant="secondary" size="sm" disabled={disabled}>Choose files</Button>
    </div>
  );
}
