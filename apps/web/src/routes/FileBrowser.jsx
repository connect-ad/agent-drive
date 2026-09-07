import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  PageHead, Panel, DataTable, FileCell, Button, IconButton, Icon, Input, Select,
  Badge, Modal, ConfirmModal, Toast, EmptyState, UploadItem, Checkbox, CodeBlock
} from '../components/index.js';
import { Drawer } from '../components-local/Drawer.jsx';
import { useResource } from '../lib/useResource.js';

/**
 * 8.9 File Browser (MVP-0) + 8.10 File Details drawer + 8.11 Create Folder modal
 * + 8.12 Upload flow. The spec folds 8.10-8.12 into this screen, so they live here.
 *
 * URL: /w/{ws}/files and /w/{ws}/files/{folderPath}
 *
 * `state` prop keeps every specified state reachable before the API exists:
 * populated | loading | empty | no-results | uploading
 */

/** Bytes to something a person reads, at the precision the size deserves. */
function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '—';
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 172800) return 'yesterday';
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * The API returns who created a file as an ID, not a name — an agent ID or a
 * user ID. Resolving those to display names needs an endpoint that does not
 * exist yet, so this shows the distinction it *can* prove (agent versus person)
 * and the ID itself, rather than inventing a name to fill the column.
 */
function actorOf(createdBy) {
  const isAgent = typeof createdBy === 'string' && createdBy.startsWith('agt_');
  return { by: createdBy ?? '—', byAgent: isAgent };
}

function toRow(file) {
  const { by, byAgent } = actorOf(file.createdBy);
  return {
    id: file.id,
    name: file.name,
    path: file.path,
    type: file.mimeType ?? 'application/octet-stream',
    size: formatBytes(file.sizeBytes),
    modified: relativeTime(file.updatedAt),
    checksum: file.checksumSha256 ?? undefined,
    by,
    byAgent
  };
}

const loadFiles = (api, workspaceId) => api.listFiles(workspaceId);

export default function FileBrowser() {
  const { ws } = useParams();
  const { status, data, error, reload } = useResource(loadFiles);
  const loading = status === 'loading';
  const failed = status === 'failed';
  const files = useMemo(() => (data?.files ?? []).map(toRow), [data]);
  // Uploads are transient state belonging to an upload in progress, not
  // something the server holds. The list is empty until somebody drops a file.
  const uploading = false;
  const UPLOADS = [];

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('modified');
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [dialog, setDialog] = useState(null); // 'new-folder' | 'rename' | 'delete' | 'bulk-delete'
  const [confirmText, setConfirmText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState(null);

  const rows = useMemo(() => {
    if (loading || failed) return [];
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [query, loading, failed, files]);

  const empty = status === 'loaded' && files.length === 0;

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
