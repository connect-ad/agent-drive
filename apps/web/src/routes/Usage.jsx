import React from 'react';
import { PageHead, Panel, Meter, Button, Icon, Badge, Alert, EmptyState } from '../components/index.js';

/**
 * 8.19 Usage — MVP-0 (numbers) / MVP-1 (time-series charts).
 * URL: /w/{ws}/usage
 *
 * States: normal | warning (>=80%) | critical (>=95%) | limit (100%).
 * The limit state mirrors the 429 the API would actually return, so the UI never
 * claims capacity the API would deny.
 */

const PLAN = 'Pro';
const RESET_DAYS = 12;

const METRICS = {
  normal:   [4.1, 3120, 22.4, 48902],
  warning:  [8.4, 8600, 41.2, 84300],
  critical: [9.7, 9700, 47.6, 96800],
  limit:    [10, 10000, 50, 100000]
};

const LIMITS = [
  { key: 'Storage', limit: 10, unit: 'GB', fmt: v => `${v} GB` },
  { key: 'Assets', limit: 10000, unit: '', fmt: v => v.toLocaleString() },
  { key: 'Egress this period', limit: 50, unit: 'GB', fmt: v => `${v} GB` },
  { key: 'Requests this period', limit: 100000, unit: '', fmt: v => v.toLocaleString() }
];

export default function Usage({ state = 'normal' }) {
  const values = METRICS[state] || METRICS.normal;
  const atLimit = LIMITS.filter((m, i) => values[i] >= m.limit);

  return (
    <>
      <PageHead
        title="Usage"
        subtitle={`Resets in ${RESET_DAYS} days.`}
        meta={<Badge tone="accent">{PLAN}</Badge>}
        actions={<Button variant="secondary">Upgrade plan</Button>}
      />

      {atLimit.length > 0 ? (
        <Alert
          tone="danger"
          title={`You've reached your ${atLimit[0].key.toLowerCase()} limit for the ${PLAN} plan.`}
          actions={<Button size="sm">Upgrade plan</Button>}
        >
          Further requests against this metric are refused with a 429 until the period resets.
        </Alert>
      ) : null}

      <Panel title="Plan" subtitle={`${PLAN} — resets in ${RESET_DAYS} days`} actions={<Button size="sm" variant="secondary">Compare plans</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-7)' }}>
          {LIMITS.map((m, i) => {
            const used = values[i];
            const pct = Math.round((used / m.limit) * 100);
            return (
              <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                <div className="row" style={{ gap: 'var(--s-4)' }}>
                  <span style={{ fontSize: 'var(--t-13)', fontWeight: 'var(--w-med)', color: 'var(--ink)', flex: 1 }}>
                    {m.key} — {m.fmt(used)} of {m.fmt(m.limit)}
                  </span>
                  {/* Text equivalent alongside the bar — never bar-only (spec: Accessibility). */}
                  <span className="ad-mono-sm" style={{ color: pct >= 95 ? 'var(--danger)' : pct >= 80 ? 'var(--warn)' : 'var(--ink-3)' }}>
                    {pct}%
                  </span>
                </div>
                <Meter value={used} max={m.limit} label={`${m.key}: ${pct}% used`} />
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="History">
        <EmptyState
          compact
          icon={<Icon name="chart" size={19} />}
          title="Daily usage charts arrive in MVP-1"
        >
          A 30-day time series per metric, at daily granularity.
        </EmptyState>
      </Panel>
    </>
  );
}
