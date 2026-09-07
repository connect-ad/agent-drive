import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PageHead, StatTile, Panel, DataTable, FileCell, Button, Icon,
  EmptyState, CodeBlock, Alert, Badge
} from '../components/index.js';

/**
 * 8.8 Dashboard / Overview — MVP-0
 * URL: /w/{workspaceId}
 *
 * Spec states: Loading (skeleton tiles + rows) -> Populated -> Empty workspace
 * (Quick-start panel replaces Recent Files) -> Quota warning (>=80% warn,
 * >=95% danger + inline Upgrade link).
 *
 * `state` is a prop purely so every specified state stays reachable and
 * reviewable before the API exists. Wire to real data by dropping the prop.
 */

const PLAN = 'Pro';
const STORAGE_LIMIT_GB = 10;
const REQUEST_LIMIT = 100000;

const RECENT_FILES = [
  { id: 1, name: 'market-sizing.pdf', meta: '/research/2026-q1', type: 'application/pdf', size: '4.2 MB', modified: '12 minutes ago', agent: true },
  { id: 2, name: 'competitors.json', meta: '/research/2026-q1', type: 'application/json', size: '88 KB', modified: '1 hour ago', agent: true },
  { id: 3, name: 'interviews', kind: 'folder', meta: '18 files', type: 'folder', size: '240 MB', modified: '2 hours ago' },
  { id: 4, name: 'pricing-notes.md', meta: '/research', type: 'text/markdown', size: '12 KB', modified: 'Yesterday, 18:40' },
  { id: 5, name: 'transcript-03.txt', meta: '/interviews', type: 'text/plain', size: '64 KB', modified: '3 Mar 2026', agent: true }
];

const QUICK_START = `curl -X POST https://api.agentdisk.io/v1/files \\
  -H "Authorization: Bearer ad_live_••••••••••••" \\
  -d '{"path":"notes.md","size":128}'`;

export default function Dashboard({ state = 'populated' }) {
  const { ws } = useParams();
  const root = `/w/${ws}`;
  const loading = state === 'loading';
  const empty = state === 'empty';

  // Storage figure drives the quota-warning state, so one number moves the whole UI.
  const usedGb = state === 'quota-danger' ? 9.7 : state === 'quota-warn' ? 8.4 : 4.1;
  const pct = Math.round((usedGb / STORAGE_LIMIT_GB) * 100);
  const requests = 48902;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      primary: true,
      render: r => <FileCell name={r.name} kind={r.kind} meta={r.meta} agentWritten={r.agent} />
    },
    { key: 'type', header: 'Type', width: 140, render: r => <span className="ad-mono-sm">{r.type}</span> },
    { key: 'size', header: 'Size', align: 'right', width: 96, mono: true },
    {
      key: 'modified',
      header: 'Modified',
      width: 160,
      render: r => <span style={{ color: 'var(--ink-3)' }}>{r.modified}</span>
    }
  ];

  return (
    <>
      <PageHead
        title="Dashboard"
        subtitle="Storage, agents and everything they did to your files."
        meta={<Badge tone="accent">{PLAN}</Badge>}
        actions={
          <>
            <Button variant="secondary" icon={<Icon name="upload" size={14} />}>Upload files</Button>
            <Button icon={<Icon name="agent" size={14} />}>Connect an agent</Button>
          </>
        }
      />

      {pct >= 95 && !empty && !loading ? (
        <Alert
          tone="danger"
          title={`You're at ${pct}% of your ${PLAN} plan storage`}
          actions={<Button size="sm" variant="secondary">Upgrade plan</Button>}
        >
          Uploads are refused at the limit. Free space by deleting files, or move to a larger plan.
        </Alert>
      ) : null}

      {/* Stat tiles are real links so they are keyboard-reachable (spec: Accessibility). */}
      <div className="grid-stats">
        <Link to={`${root}/usage`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatTile
            label="Storage used"
            icon={<Icon name="database" size={13} />}
            value={usedGb}
            unit="GB"
            meter={usedGb}
            meterMax={STORAGE_LIMIT_GB}
            sub={`of ${STORAGE_LIMIT_GB} GB on ${PLAN}`}
            loading={loading}
          />
        </Link>
        <Link to={`${root}/files`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatTile
            label="Files"
            icon={<Icon name="file" size={13} />}
            value={empty ? '0' : '12,481'}
            sub={empty ? 'Nothing stored yet' : '1,204 written by agents'}
            loading={loading}
          />
        </Link>
        <Link to={`${root}/agents`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatTile
            label="Agents"
            icon={<Icon name="agent" size={13} />}
            value={empty ? '0' : '3'}
            sub={empty ? 'No agents connected' : '1 credential expiring'}
            loading={loading}
          />
        </Link>
        <Link to={`${root}/usage`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatTile
            label="Requests this month"
            icon={<Icon name="bolt" size={13} />}
            value={empty ? '0' : requests.toLocaleString()}
            meter={empty ? 0 : requests}
            meterMax={REQUEST_LIMIT}
            sub={`of ${REQUEST_LIMIT.toLocaleString()} this month`}
            loading={loading}
          />
        </Link>
      </div>

      {empty ? (
        <Panel title="Quick start">
          <EmptyState
            icon={<Icon name="folder" size={19} />}
            title="Nothing here yet"
            actions={
              <>
                <Button icon={<Icon name="agent" size={13} />}>Create an agent</Button>
                <Button variant="secondary" icon={<Icon name="upload" size={13} />}>Upload a file</Button>
              </>
            }
          >
            Create your first agent and give it a key, or drop a file in below.
          </EmptyState>
          <CodeBlock filename="Upload your first file" code={QUICK_START} />
        </Panel>
      ) : (
        <Panel
          flush
          title="Recent files"
          actions={<Button size="sm" variant="link" as={Link} to={`${root}/files`}>View all</Button>}
        >
          <DataTable
            columns={columns}
            rows={loading ? [] : RECENT_FILES}
            loading={loading}
            skeletonRows={5}
            onRowClick={() => {}}
          />
        </Panel>
      )}
    </>
  );
}
