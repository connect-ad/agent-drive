import React from 'react';
import { Icon } from '../Icon/Icon.jsx';
import { Meter } from '../StatTile/Meter.jsx';
import { IconButton } from '../Button/IconButton.jsx';

const STATE = {
  queued:     { label: 'Queued',     tone: 'neutral', icon: 'clock' },
  uploading:  { label: 'Uploading',  tone: 'accent',  icon: 'upload' },
  processing: { label: 'Processing', tone: 'accent',  icon: 'refresh' },
  complete:   { label: 'Complete',   tone: 'ok',      icon: 'check' },
  failed:     { label: 'Failed',     tone: 'danger',  icon: 'alert' },
  cancelled:  { label: 'Cancelled',  tone: 'neutral', icon: 'x' }
};

export function UploadItem({ name, size, status = 'uploading', progress = 0, error, onRetry, onCancel, className = '', ...rest }) {
  const s = STATE[status] || STATE.uploading;
  return (
    <div className={className} style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px',
      borderBottom: '1px solid var(--line)'
    }} {...rest}>
      <span aria-hidden="true" style={{ marginTop: 2, flex: 'none', color: s.tone === 'danger' ? 'var(--danger)' : s.tone === 'ok' ? 'var(--ok)' : 'var(--ink-3)' }}>
        <Icon name={s.icon} size={15} />
      </span>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="ad-truncate" style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>{name}</span>
          <span className="ad-mono-sm" style={{ color: 'var(--ink-3)', flex: 'none' }}>{size}</span>
        </div>
        {status === 'uploading' || status === 'processing' ? (
          <>
            <Meter value={status === 'processing' ? 1 : progress} max={1} tone="ok" label={s.label} />
            <span className="ad-meta">{status === 'processing' ? 'Extracting text and metadata. The file is already stored.' : s.label + ' \u00b7 ' + Math.round(progress * 100) + '%'}</span>
          </>
        ) : (
          <span className="ad-meta" style={{ color: status === 'failed' ? 'var(--danger)' : undefined }}>
            {status === 'failed' ? (error || 'Upload failed. Check your connection and try again.') : s.label}
          </span>
        )}
      </div>
      <div className="row" style={{ gap: 2, flex: 'none' }}>
        {status === 'failed' && onRetry ? <IconButton icon={<Icon name="refresh" size={14} />} label={'Retry ' + name} onClick={onRetry} /> : null}
        {(status === 'uploading' || status === 'queued') && onCancel ? <IconButton icon={<Icon name="x" size={14} />} label={'Cancel ' + name} onClick={onCancel} /> : null}
      </div>
    </div>
  );
}
