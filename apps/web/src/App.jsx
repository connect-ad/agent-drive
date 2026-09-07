import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { AppShell, Breadcrumb, Badge, Button, Icon } from './components/index.js';

import Dashboard from './routes/Dashboard.jsx';
import FileBrowser from './routes/FileBrowser.jsx';
import Agents from './routes/Agents.jsx';
import AgentDetails from './routes/AgentDetails.jsx';
import ApiKeys from './routes/ApiKeys.jsx';
import Usage from './routes/Usage.jsx';
import Settings from './routes/Settings.jsx';
import Profile from './routes/Profile.jsx';
import { NotFound, Forbidden, ServerError, Maintenance } from './routes/ErrorPages.jsx';
import { Sandbox } from './routes/Sandbox.jsx';
import { Signup, VerifyEmail, ForgotPassword, ResetPassword, Login } from './routes/Auth.jsx';
import { Landing, Pricing } from './routes/Marketing.jsx';
import { Terms, Privacy } from './routes/Legal.jsx';
import Docs from './routes/Docs.jsx';
import McpConnection from './routes/McpConnection.jsx';
import Webhooks from './routes/Webhooks.jsx';
import ActivityLog from './routes/ActivityLog.jsx';
import RequireAuth, { RequireWorkspace } from './lib/RequireAuth.jsx';
import WorkspaceSwitcher from './components-local/WorkspaceSwitcher.jsx';
import { useAuth } from './lib/auth.jsx';
import { useWorkspace } from './lib/workspace.jsx';

/**
 * Sidebar navigation — doc 03 §7.3. Three groups: workspace, agent access, account.
 * `id` is what AppShell reports back through onNavigate; `path` is appended to
 * the workspace root (empty string = the workspace root itself).
 */
export const NAV = [
  {
    items: [
      { id: 'dash', label: 'Dashboard', icon: 'dashboard', path: '' },
      { id: 'files', label: 'Files', icon: 'folder', path: '/files' },
      { id: 'activity', label: 'Activity', icon: 'activity', path: '/activity' }
    ]
  },
  {
    label: 'Agent access',
    items: [
      { id: 'agents', label: 'Agents', icon: 'agent', path: '/agents' },
      { id: 'keys', label: 'API keys', icon: 'key', path: '/keys' },
      { id: 'mcp', label: 'MCP connection', icon: 'terminal', path: '/mcp' },
      { id: 'webhooks', label: 'Webhooks', icon: 'link', path: '/webhooks' }
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'usage', label: 'Usage', icon: 'chart', path: '/usage' },
      { id: 'settings', label: 'Settings', icon: 'gear', path: '/settings' },
      { id: 'docs', label: 'Documentation', icon: 'book', href: 'https://docs.agentdisk.io', external: true }
    ]
  }
];

/**
 * `/app` is the one URL the rest of the product links to without knowing which
 * workspace anybody is in. It resolves to the current one - remembered across
 * reloads - so a bookmark, a redirect after sign-in and an email link all land
 * somewhere real instead of a hardcoded slug that belongs to nobody.
 */
function CurrentWorkspaceRedirect() {
  const { workspaceId, loading } = useWorkspace();
  if (loading) return null;
  return workspaceId ? <Navigate to={`/w/${workspaceId}`} replace /> : <Navigate to="/login" replace />;
}

/** Which nav id is active for the current pathname. */
function activeId(pathname, wsRoot) {
  const rest = pathname.slice(wsRoot.length) || '';
  const match = NAV.flatMap(g => g.items)
    .filter(it => it.path && rest.startsWith(it.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match ? match.id : 'dash';
}

/**
 * The authenticated workspace shell. Every in-app screen renders inside this.
 */
function WorkspaceLayout() {
  const navigate = useNavigate();
  const { ws } = useParams();
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { workspaces, workspaceId, select, create } = useWorkspace();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };
  const wsRoot = `/w/${ws}`;
  const active = activeId(pathname, wsRoot);
  const current = NAV.flatMap(g => g.items).find(it => it.id === active);

  // The URL is the source of truth for which workspace is open, so a shared
  // link opens the workspace it names rather than whichever one this browser
  // last had selected.
  React.useEffect(() => {
    if (ws && ws !== workspaceId && workspaces.some(w => w.id === ws)) select(ws);
  }, [ws, workspaceId, workspaces, select]);

  const open = workspaces.find(w => w.id === ws) ?? null;
  const workspaceName = open?.name ?? 'Workspace';
  const USER = {
    name: user?.displayName ?? user?.email ?? 'Signed in',
    email: user?.email ?? ''
  };

  return (
    <AppShell
      nav={NAV}
      active={active}
      workspaceSlot={
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentId={ws}
          onSelect={id => navigate(`/w/${id}`)}
          onCreate={async name => {
            const workspace = await create(name);
            navigate(`/w/${workspace.id}`);
          }}
        />
      }
      user={USER}
      onNavigate={id => {
        const item = NAV.flatMap(g => g.items).find(i => i.id === id);
        if (!item) return;
        if (item.external) { window.location.assign(item.href); return; }
        navigate(wsRoot + item.path);
      }}
      topbar={
        <Breadcrumb
          items={[
            { label: workspaceName, href: wsRoot },
            { label: current ? current.label : 'Dashboard' }
          ]}
        />
      }
      topbarActions={
        <>
          {/*
            No workspace controls here. Switching and creating both used to live
            in this row, beside a third copy of the workspace's name in the
            sidebar - and the switcher hid itself until you already had two, so
            the only route to a second workspace sat next to a control you could
            not see. All three are now the one switcher in the sidebar.
          */}
          <Button size="sm" variant="secondary" as={Link} to="/docs" icon={<Icon name="book" size={13} />}>
            Docs
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSignOut}>Sign out</Button>
        </>
      }
    >
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<CurrentWorkspaceRedirect />} />
        {/* `/dashboard` is the shareable spelling of the same idea: a bookmark,
            a support article or a link to a colleague cannot name a workspace,
            because `/w/{id}` is an address that belongs to one reader. Both
            paths resolve through the same component so neither can drift into
            being the unprotected one. */}
        <Route path="/dashboard" element={<CurrentWorkspaceRedirect />} />
      </Route>
      <Route element={<RequireAuth />}>
      <Route element={<RequireWorkspace />}>
      <Route path="/w/:ws" element={<WorkspaceLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="files" element={<FileBrowser />} />
        <Route path="files/*" element={<FileBrowser />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:agentId" element={<AgentDetails />} />
        <Route path="keys" element={<ApiKeys />} />
        <Route path="mcp" element={<McpConnection />} />
        <Route path="webhooks" element={<Webhooks />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="usage" element={<Usage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* Talks to the real API, unlike every other screen here: it is the one
          way to obtain a first credential (05 PART 13's Turnstile-gated
          POST /v1/workspaces). */}
      <Route path="/sandbox" element={<Sandbox />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account/profile" element={<Profile />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError onRetry={() => window.location.reload()} />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
