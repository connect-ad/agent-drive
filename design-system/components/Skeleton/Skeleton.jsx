import React from 'react';

export function Skeleton({ width = '100%', height = 10, radius, lines = 1, gap = 8, className = '', ...rest }) {
  if (lines > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap }} {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="skel" style={{ height, width: i === lines - 1 ? '62%' : width, borderRadius: radius }} />
        ))}
      </div>
    );
  }
  return <span className={['skel', className].filter(Boolean).join(' ')} style={{ display: 'block', width, height, borderRadius: radius }} {...rest} />;
}
