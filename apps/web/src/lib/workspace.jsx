/**
 * The API client and the current workspace, made available to every screen.
 *
 * Kept beside the auth context rather than inside it because they answer
 * different questions — auth answers "who is this", this answers "which
 * workspace are they looking at, and how do I call the API as them". Screens
 * almost always need the second and rarely the first.
 *
 * The workspace list is fetched once on sign-in rather than per screen. It is
 * small, it changes only when somebody creates or is invited to a workspace,
 * and refetching it on every navigation would put a round trip in front of
 * every click for a value that has not moved.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth.jsx';
import { createApiClient } from './api.js';

const WorkspaceContext = createContext(null);

/** Remembered so a reload returns to the workspace you were looking at. */
const LAST_WORKSPACE_KEY = 'agentdisk.workspace';

function readLastWorkspace() {
  try {
    return window.localStorage.getItem(LAST_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

function rememberWorkspace(id) {
  try {
    if (id) window.localStorage.setItem(LAST_WORKSPACE_KEY, id);
  } catch {
    /* Private mode. The switcher just defaults to the first each time. */
  }
}

export function WorkspaceProvider({ children }) {
  const { user, getToken } = useAuth();
  const api = useMemo(() => createApiClient(getToken), [getToken]);

  const [workspaces, setWorkspaces] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { workspaces: list } = await api.listWorkspaces();
      setWorkspaces(list);
      setError(null);
      setCurrentId(previous => {
        // Keep the current selection if it survived; otherwise fall back to the
        // remembered one, then to the first. Never leave it pointing at a
        // workspace that is no longer in the list — every call would 403.
        const ids = new Set(list.map(w => w.id));
        if (previous && ids.has(previous)) return previous;
        const remembered = readLastWorkspace();
        if (remembered && ids.has(remembered)) return remembered;
        return list[0]?.id ?? null;
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const select = useCallback(id => {
    setCurrentId(id);
    rememberWorkspace(id);
  }, []);

  const create = useCallback(
    async name => {
      const { workspace } = await api.createWorkspace(name);
      setWorkspaces(previous => [...previous, workspace]);
      select(workspace.id);
      return workspace;
    },
    [api, select]
  );

  const value = useMemo(
    () => ({
      api,
      workspaces,
      workspaceId: currentId,
      workspace: workspaces.find(w => w.id === currentId) ?? null,
      /** 'owner' | 'admin' | 'reader'. Screens hide what a reader cannot do. */
      role: workspaces.find(w => w.id === currentId)?.role ?? null,
      canWrite: (workspaces.find(w => w.id === currentId)?.role ?? 'reader') !== 'reader',
      loading,
      error,
      select,
      create,
      refresh
    }),
    [api, workspaces, currentId, loading, error, select, create, refresh]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside a WorkspaceProvider');
  return context;
}
