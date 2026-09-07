import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, Input, Modal, Alert } from '../components/index.js';
import { useWorkspace } from '../lib/workspace.jsx';

/**
 * Create a workspace, and go to it.
 *
 * Lives in the topbar beside the switcher rather than buried in settings,
 * because the moment somebody wants a second workspace is the moment they are
 * looking at the first one and reaching for the switcher.
 *
 * Navigating into the new workspace on success is the whole point — creating a
 * container and then leaving you in the old one is the kind of small
 * disorientation that makes people click the button twice.
 */
export default function NewWorkspace() {
  const navigate = useNavigate();
  const { create } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!name.trim()) { setError('Give the workspace a name.'); return; }
    setBusy(true); setError(null);
    try {
      const workspace = await create(name.trim());
      setOpen(false);
      setName('');
      navigate(`/w/${workspace.id}`);
    } catch (err) {
      setError(`${err.message}${err.requestId ? ` (request ${err.requestId})` : ''}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        icon={<Icon name="plus" size={13} />}
        onClick={() => { setError(null); setOpen(true); }}
      >
        New workspace
      </Button>

      <Modal
        open={open}
        title="Create a workspace"
        tone="accent"
        mark={<Icon name="folder" size={16} />}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={busy}>Create workspace</Button>
          </>
        }
      >
        {error ? <div role="alert"><Alert tone="danger" title={error} /></div> : null}
        <Input
          label="Name"
          required
          placeholder="Client A"
          hint="Files, agents and keys are kept entirely separate between workspaces. Billing is not — every workspace you own is on the same account."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        />
      </Modal>
    </>
  );
}
