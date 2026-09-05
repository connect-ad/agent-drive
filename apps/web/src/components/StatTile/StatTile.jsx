import React from 'react';
import { Meter } from './Meter.jsx';

export function StatTile({ label, value, unit, sub, icon, meter, meterMax = 1, meterTone, loading = false, className = '', ...rest }) {
  return (
    <div className={['stat', className].filter(Boolean).join(' ')} {...rest}>
      <span className="stat__label">{icon}{label}</span>
      {loading
        ? <span className="skel" style={{ height: 24, width: '55%' }} />
        : <span className="stat__val">{value}{unit ? <span className="stat__unit">{unit}</span> : null}</span>}
      {meter != null ? <Meter value={meter} max={meterMax} tone={meterTone} label={label} /> : null}
      {sub ? <span className="stat__sub">{sub}</span> : null}
    </div>
  );
}
