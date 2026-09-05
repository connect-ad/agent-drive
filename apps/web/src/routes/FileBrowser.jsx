import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  PageHead, Panel, DataTable, FileCell, Button, IconButton, Icon, Input, Select,
  Badge, Modal, ConfirmModal, Toast, EmptyState, UploadItem, Checkbox, CodeBlock
} from '../components/index.js';
import { Drawer } from '../components-local/Drawer.jsx';

/**
 * 8.9 File Browser (MVP-0) + 8.10 File Details drawer + 8.11 Create Folder modal
 * + 8.12 Upload flow. The spec folds 8.10-8.12 into this screen, so they live here.
 *
 * URL: /w/{ws}/files and /w/{ws}/files/{folderPath}
 *
 * `state` prop keeps every specified state reachable before the API exists:
 * populated | loading | empty | no-results | uploading
 */

const FILES = [
  { id: 'f1', name: 'interviews', kind: 'folder', meta: '18 files · 240 MB', type: 'folder', size: '—', modified: '2 hours ago', by: 'Dana Okafor', byAgent: false },
  { id: 'f2', name: 'raw-exports', kind: 'folder', meta: '4 files · 1.2 GB', type: 'folder', size: '—', modified: 'Yesterday', by: 'ingest-worker', byAgent: true },
  { id: 'f3', name: 'market-sizing.pdf', type: 'application/pdf', size: '4.2 MB', modified: '12 minutes ago', by: 'research-assistant', byAgent: true, checksum: '9f2c1a7b4e8d3f60a15c9b2e7d4a8f31c6b0e5d97a2f4c8b1e3d6a9f0c7b2e45', path: '/research/2026-q1/market-sizing.pdf' },
  { id: 'f4', name: 'competitors.json', type: 'application/json', size: '88 KB', modified: '1 hour ago', by: 'research-assistant', byAgent: true, checksum: '3a7f9c2e5b8d1e40f92c6a8b3d5e7f01a4c9b2e6d8f3a5c7b1e0d4f6a9c2b8e35', path: '/research/2026-q1/competitors.json' },
  { id: 'f5', name: 'pricing-notes.md', type: 'text/markdown', size: '12 KB', modified: '3 Mar 2026', by: 'Dana Okafor', byAgent: false, path: '/research/pricing-notes.md' },
  { id: 'f6', name: 'dump', ext: 'BIN', type: 'application/octet-stream', size: '820 MB', modified: '1 Mar 2026', by: 'Dana Okafor', byAgent: false, path: '/research/dump' }
];

const UPLOADS = [
  { name: 'transcript-04.mp3', size: '118 MB', status: 'uploading', progress: 0.62 },
  { name: 'appendix.pdf', size: '2.1 MB', status: 'processing' },
  { name: 'raw-export.zip', size: '6.1 GB', status: 'failed', error: 'Exceeds the 5 GB per-file limit on your plan.' }
];

export default function FileBrowser({ state = 'populated' }) {
  const { ws } = useParams();
  const loading = state === 'loading';
  const empty = state === 'empty';
  const uploading = state === 'uploading';

  const [query, setQuery] = useState(state === 'no-results' ? 'quarterly' : '');
  const [sort, setSort] = useState('modified');
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [dialog, setDialog] = useState(null); // 'new-folder' | 'rename' | 'delete' | 'bulk-delete'
  const [confirmText, setConfirmText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState(null);

  const rows = useMemo(() => {
    if (loading || empty) return [];
    const q = query.trim().toLowerCase();
    if (!q) return FILES;
    return FILES.filter(f => f.name.toLowerCase().includes(q));
  }, [query, loading, empty]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () => setSelected(allSelected ? [] : rows.map(r => r.id));
  const toggleOne = id =>
    setSelected(s => (s.indexOf(id) === -1 ? s.concat(id) : s.filter(x => x !== id)));

  const columns = [
    {
      key: 'sel',
      width: 36,
      header: <Checkbox label="" checked={allSelected} onChange={toggleAll} />,
      render: r => (
        <span onClick={e => e.stopPropagation()}>
          <Checkbox label="" checked={selected.indexOf(r.id) !== -1} onChange={() => toggleOne(r.id)} />
        </span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      primary: true,
      render: r => <FileCell name={r.name} kind={r.kind} meta={r.meta} ext={r.ext} agentWritten={r.byAgent} />
    },
    { key: 'type', header: 'Type', width: 150, render: r => <span className="ad-mono-sm">{r.type}</span> },
    { key: 'size', header: 'Size', align: 'right', width: 96, mono: true },
    {
      key: 'by',
      header: 'Created by',
      width: 190,
      render: r =>
        r.byAgent
          ? <Badge tone="accent" mono>{r.by}</Badge>
          : <span style={{ color: 'var(--ink-2)' }}>{r.by}</span>
    },
    { key: 'modified', header: 'Modified', width: 150, render: r => <span style={{ color: 'var(--ink-3)' }}>{r.modified}</span> },
    {
      key: 'act',
      header: '',
      width: 44,
      render: () => (
        <span onClick={e => e.stopPropagation()}>
          <IconButton icon={<Icon name="more" size={14} />} label="Row actions" />
        </span>
      )
    }
  ];

  const emptyState = query.trim() ? (
    <EmptyState
      icon={<Icon name="search" size={19} />}
      title={`No files match “${query}”`}
      actions={<Button size="sm" variant="secondary" onClick={() => setQuery('')}>Clear search</Button>}
    >
      Search covers filenames, paths and extracted text in this workspace only.
    </EmptyState>
  ) : (
    <EmptyState
      icon={<Icon name="folder" size={19} />}
      title="This folder is empty"
      actions={<Button size="sm" icon={<Icon name="upload" size={13} />}>Upload files</Button>}
    >
      Drag files here, or upload them.
    </EmptyState>
  );

  return (
    <>
      <PageHead
        title="Files"
        subtitle="Everything in this workspace, and which agent put it there."
        actions={
          <>
            <Button variant="secondary" icon={<Icon name="folder" size={14} />} onClick={() => setDialog('new-folder')}>
              New folder
            </Button>
            <Button icon={<Icon name="upload" size={14} />}>Upload</Button>
          </>
        }
      />

      <div className="toolbar">
        <Input
          leadingIcon={<Icon name="search" size={14} style={{ color: 'var(--ink-4)' }} />}
          placeholder="Filename, path or contents"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="toolbar__spacer" />
        <Select
          value={sort}
          onChange={e => setSort(e.target.value)}
          options={[
            { value: 'modified', label: 'Sort: Last modified' },
            { value: 'name', label: 'Sort: Name' },
            { value: 'size', label: 'Sort: Size' }
          ]}
        />
      </div>

      {selected.length > 0 ? (
        <div className="bulkbar">
          <span style={{ fontSize: 'var(--t-13)', fontWeight: 'var(--w-med)' }}>
            {selected.length} selected
          </span>
          <span className="toolbar__spacer" />
          <Button size="sm" variant="secondary" icon={<Icon name="folder" size={13} />}>Move</Button>
          <Button size="sm" variant="secondary" icon={<Icon name="download" size={13} />}>Download as zip</Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Icon name="trash" size={13} />}
            onClick={() => { setConfirmText(''); setDialog(selected.length > 5 ? 'bulk-delete' : 'delete'); }}
          >
            Delete
          </Button>
        </div>
      ) : null}

      {uploading ? (
        <Panel flush title="Uploading" subtitle="Files go straight to storage, never through our API.">
          {UPLOADS.map(u => (
            <UploadItem key={u.name} {...u} onRetry={() => {}} onCancel={() => {}} />
          ))}
        </Panel>
      ) : null}

      {/* Drag-and-drop upload target. The Upload button is the keyboard-accessible
          equivalent (spec: Accessibility). */}
      <div
        style={{ position: 'relative' }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); setToast({ tone: 'ok', title: '3 files uploaded', body: 'Text extraction is running in the background.' }); }}
      >
        {dragging ? (
          <div className="dz-overlay">
            <span style={{ fontSize: 'var(--t-14)', fontWeight: 'var(--w-med)', color: 'var(--accent-ink)' }}>
              Drop to upload
            </span>
          </div>
        ) : null}
        <Panel flush title={query.trim() ? `Results for “${query}”` : 'All files'}>
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            skeletonRows={6}
            empty={emptyState}
            selectedKeys={selected}
            onRowClick={r => (r.kind === 'folder' ? undefined : setDetail(r))}
          />
        </Panel>
      </div>

      {/* --- 8.10 File Details drawer --- */}
      <Drawer
        open={!!detail}
        title={detail ? detail.name : ''}
        onClose={() => setDetail(null)}
        footer={
          <>
            <Button size="sm" icon={<Icon name="download" size={13} />}>Download</Button>
            <Button size="sm" variant="secondary" icon={<Icon name="link" size={13} />}>Copy signed link</Button>
            <Button size="sm" variant="ghost">Rename</Button>
            <Button size="sm" variant="danger-outline" onClick={() => setDialog('delete')}>Delete</Button>
          </>
        }
      >
        {detail ? (
          <>
            <EmptyState
              compact
              icon={<Icon name="file" size={19} />}
              title="Preview not available for this file type"
              actions={<Button size="sm" variant="secondary">Download</Button>}
            />
            <dl className="dl">
              <dt>Path</dt><dd className="ad-mono-sm">{detail.path || '—'}</dd>
              <dt>Size</dt><dd>{detail.size}</dd>
              <dt>Type</dt><dd className="ad-mono-sm">{detail.type}</dd>
              <dt>Checksum (SHA-256)</dt>
              <dd className="ad-mono-sm" style={{ overflowWrap: 'anywhere' }}>{detail.checksum || '—'}</dd>
              <dt>Created by</dt>
              <dd>
                {detail.byAgent
                  ? <Badge tone="accent" mono>{detail.by}</Badge>
                  : detail.by}
              </dd>
              <dt>Last modified</dt><dd>{detail.modified}</dd>
            </dl>
            <Input label="Caption" placeholder="Add a caption…" />
            <Input label="Tags" placeholder="Add tags…" hint="Comma-separated. Saved when you click away." />
          </>
        ) : null}
      </Drawer>

      {/* --- 8.11 New folder --- */}
      <Modal
        open={dialog === 'new-folder'}
        title="New folder"
        tone="accent"
        mark={<Icon name="folder" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => setDialog(null)}>Create folder</Button>
          </>
        }
      >
        <Input
          label="Folder name"
          placeholder="market-research"
          hint="Letters, numbers, dashes and underscores. This becomes part of the path agents use."
        />
      </Modal>

      {/* --- delete: single --- */}
      <ConfirmModal
        open={dialog === 'delete'}
        title={`Delete ${detail ? detail.name : `${selected.length} item(s)`}?`}
        description="This can't be undone. Deleted files are recoverable from trash for 30 days."
        confirmLabel="Delete"
        onClose={() => setDialog(null)}
        onConfirm={() => { setDialog(null); setSelected([]); setDetail(null); setToast({ tone: 'ok', title: 'Deleted' }); }}
      />

      {/* --- delete: bulk (>5) requires typing DELETE --- */}
      <Modal
        open={dialog === 'bulk-delete'}
        title={`Delete ${selected.length} items?`}
        tone="danger"
        mark={<Icon name="alert" size={16} />}
        onClose={() => setDialog(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'DELETE'}
              onClick={() => { setDialog(null); setSelected([]); setToast({ tone: 'ok', title: 'Deleted' }); }}
            >
              Delete
            </Button>
          </>
        }
      >
        <Input
          label="Type DELETE to confirm"
          value={confirmText}
          mono
          onChange={e => setConfirmText(e.target.value)}
        />
      </Modal>

      {toast ? (
        <div style={{ position: 'fixed', top: 'var(--s-7)', right: 'var(--s-7)', zIndex: 90 }}>
          <Toast tone={toast.tone} title={toast.title} onDismiss={() => setToast(null)}>
            {toast.body}
          </Toast>
        </div>
      ) : null}
    </>
  );
}
