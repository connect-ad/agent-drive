/* @ds-bundle: {"format":4,"namespace":"AgentStorageMcp_d311bf","components":[{"name":"ActivityRow","sourcePath":"components/ActivityRow/ActivityRow.jsx"},{"name":"AgentCard","sourcePath":"components/AgentCard/AgentCard.jsx"},{"name":"Alert","sourcePath":"components/Alert/Alert.jsx"},{"name":"ApiKeyDisplay","sourcePath":"components/ApiKeyDisplay/ApiKeyDisplay.jsx"},{"name":"AppShell","sourcePath":"components/AppShell/AppShell.jsx"},{"name":"PageHead","sourcePath":"components/AppShell/PageHead.jsx"},{"name":"Badge","sourcePath":"components/Badge/Badge.jsx"},{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"IconButton","sourcePath":"components/Button/IconButton.jsx"},{"name":"CodeBlock","sourcePath":"components/CodeBlock/CodeBlock.jsx"},{"name":"DataTable","sourcePath":"components/DataTable/DataTable.jsx"},{"name":"EmptyState","sourcePath":"components/EmptyState/EmptyState.jsx"},{"name":"FileCell","sourcePath":"components/FileCell/FileCell.jsx"},{"name":"Icon","sourcePath":"components/Icon/Icon.jsx"},{"name":"Checkbox","sourcePath":"components/Input/Checkbox.jsx"},{"name":"Input","sourcePath":"components/Input/Input.jsx"},{"name":"Select","sourcePath":"components/Input/Select.jsx"},{"name":"Switch","sourcePath":"components/Input/Switch.jsx"},{"name":"McpToolList","sourcePath":"components/McpToolList/McpToolList.jsx"},{"name":"Menu","sourcePath":"components/Menu/Menu.jsx"},{"name":"ConfirmModal","sourcePath":"components/Modal/ConfirmModal.jsx"},{"name":"Modal","sourcePath":"components/Modal/Modal.jsx"},{"name":"Panel","sourcePath":"components/Panel/Panel.jsx"},{"name":"PermissionSelector","sourcePath":"components/PermissionSelector/PermissionSelector.jsx"},{"name":"Skeleton","sourcePath":"components/Skeleton/Skeleton.jsx"},{"name":"Meter","sourcePath":"components/StatTile/Meter.jsx"},{"name":"StatTile","sourcePath":"components/StatTile/StatTile.jsx"},{"name":"Breadcrumb","sourcePath":"components/Tabs/Breadcrumb.jsx"},{"name":"Tabs","sourcePath":"components/Tabs/Tabs.jsx"},{"name":"Toast","sourcePath":"components/Toast/Toast.jsx"},{"name":"UploadDropzone","sourcePath":"components/UploadDropzone/UploadDropzone.jsx"},{"name":"UploadItem","sourcePath":"components/UploadDropzone/UploadItem.jsx"}],"sourceHashes":{"components/ActivityRow/ActivityRow.jsx":"59330be8a598","components/AgentCard/AgentCard.jsx":"4f2690c4bd01","components/Alert/Alert.jsx":"1ac354c54eff","components/ApiKeyDisplay/ApiKeyDisplay.jsx":"f96cd0af8378","components/AppShell/AppShell.jsx":"1d62c48ddb2d","components/AppShell/PageHead.jsx":"afeabba9a00d","components/Badge/Badge.jsx":"8a20ec18bb7f","components/Button/Button.jsx":"6e180566aa26","components/Button/IconButton.jsx":"608a838acecf","components/CodeBlock/CodeBlock.jsx":"64a7f14306b6","components/DataTable/DataTable.jsx":"dcc84b608abc","components/EmptyState/EmptyState.jsx":"d5c3497d9955","components/FileCell/FileCell.jsx":"a14f803c0325","components/Icon/Icon.jsx":"1fc3742012ac","components/Input/Checkbox.jsx":"d5f0bfa85bb7","components/Input/Input.jsx":"4fa1ed87889e","components/Input/Select.jsx":"2a8eb10a4943","components/Input/Switch.jsx":"ad2ee09bb17f","components/McpToolList/McpToolList.jsx":"cdaa2cea3b0c","components/Menu/Menu.jsx":"1d0ea3dfdb19","components/Modal/ConfirmModal.jsx":"e114800f399e","components/Modal/Modal.jsx":"49ddc570606a","components/Panel/Panel.jsx":"0af655b8db99","components/PermissionSelector/PermissionSelector.jsx":"caba51377116","components/Skeleton/Skeleton.jsx":"d4d5d4603694","components/StatTile/Meter.jsx":"298e170c5dbb","components/StatTile/StatTile.jsx":"82ef26deeb38","components/Tabs/Breadcrumb.jsx":"d8519efa6745","components/Tabs/Tabs.jsx":"8bf448290e31","components/Toast/Toast.jsx":"83346df7f314","components/UploadDropzone/UploadDropzone.jsx":"41c1f1494405","components/UploadDropzone/UploadItem.jsx":"797e1526f6aa"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/Icon/Icon.jsx"},{"name":"mcpTools","sourcePath":"components/McpToolList/McpToolList.jsx"},{"name":"permissionPresets","sourcePath":"components/PermissionSelector/PermissionSelector.jsx"}]} */

(() => {

const __ds_ns = (window.AgentStorageMcp_d311bf = window.AgentStorageMcp_d311bf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/AppShell/PageHead.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PageHead({
  title,
  subtitle,
  actions,
  meta,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['page-head', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "page-head__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "page-head__title"
  }, title), meta), subtitle ? /*#__PURE__*/React.createElement("p", {
    className: "page-head__sub"
  }, subtitle) : null), actions ? /*#__PURE__*/React.createElement("div", {
    className: "page-head__actions"
  }, actions) : null);
}
Object.assign(__ds_scope, { PageHead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/AppShell/PageHead.jsx", error: String((e && e.message) || e) }); }

// components/Badge/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Badge({
  tone = 'neutral',
  dot = false,
  pulse = false,
  mono = false,
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const cls = ['badge', tone !== 'neutral' ? 'badge--' + tone : '', mono ? 'badge--mono' : '', size === 'lg' ? 'badge--lg' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    className: ['badge__dot', pulse ? 'badge__dot--pulse' : ''].filter(Boolean).join(' ')
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Badge/Badge.jsx", error: String((e && e.message) || e) }); }

// components/Button/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  full = false,
  as: Tag = 'button',
  className = '',
  children,
  disabled,
  ...rest
}) {
  const cls = ['btn', 'btn--' + variant, 'btn--' + size, full ? 'btn--full' : '', loading ? 'is-loading' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    disabled: Tag === 'button' ? disabled || loading : undefined,
    "aria-disabled": disabled || loading || undefined,
    "aria-busy": loading || undefined
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    className: "btn__spin"
  }) : null, icon ? /*#__PURE__*/React.createElement("span", {
    className: "btn__ico"
  }, icon) : null, /*#__PURE__*/React.createElement("span", {
    className: "btn__label"
  }, children), iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "btn__ico"
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/Button/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  label,
  tone = 'default',
  bordered = false,
  size = 'sm',
  className = '',
  ...rest
}) {
  const cls = ['icon-btn', bordered ? 'icon-btn--bordered' : '', tone === 'danger' ? 'icon-btn--danger' : '', size === 'lg' ? 'icon-btn--lg' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-label": label,
    title: label
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/DataTable/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  loading = false,
  skeletonRows = 5,
  empty,
  hover = true,
  selectedKeys = [],
  onRowClick,
  className = '',
  ...rest
}) {
  if (!loading && rows.length === 0 && empty) return empty;
  const body = loading ? Array.from({
    length: skeletonRows
  }).map((_, i) => /*#__PURE__*/React.createElement("tr", {
    key: 's' + i
  }, columns.map((c, j) => /*#__PURE__*/React.createElement("td", {
    key: c.key || j
  }, /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      display: 'block',
      width: j === 0 ? '58%' : '38%'
    }
  }))))) : rows.map((r, i) => {
    const k = r[rowKey] != null ? r[rowKey] : i;
    const sel = selectedKeys.indexOf(k) !== -1;
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      className: sel ? 'is-selected' : undefined,
      onClick: onRowClick ? () => onRowClick(r) : undefined,
      tabIndex: onRowClick ? 0 : undefined,
      onKeyDown: onRowClick ? e => {
        if (e.key === 'Enter') onRowClick(r);
      } : undefined
    }, columns.map((c, j) => /*#__PURE__*/React.createElement("td", {
      key: c.key || j,
      className: [c.align === 'right' ? 'tbl__num' : '', c.mono ? 'tbl__mono' : '', c.primary ? 'tbl__primary' : '', c.className || ''].filter(Boolean).join(' '),
      style: c.width ? {
        width: c.width
      } : undefined
    }, c.render ? c.render(r, i) : r[c.key])));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "tbl-scroll"
  }, /*#__PURE__*/React.createElement("table", _extends({
    className: ['tbl', hover && onRowClick ? 'tbl--hover' : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, j) => /*#__PURE__*/React.createElement("th", {
    key: c.key || j,
    scope: "col",
    style: {
      textAlign: c.align === 'right' ? 'right' : undefined,
      width: c.width
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, body)));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/DataTable/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/EmptyState/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  icon,
  title,
  children,
  actions,
  tone = 'neutral',
  compact = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['empty', className].filter(Boolean).join(' '),
    style: compact ? {
      padding: '40px 20px'
    } : undefined
  }, rest), icon ? /*#__PURE__*/React.createElement("div", {
    className: ['empty__mark', tone === 'danger' ? 'empty__mark--danger' : ''].filter(Boolean).join(' ')
  }, icon) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "empty__title"
  }, title), children ? /*#__PURE__*/React.createElement("p", {
    className: "empty__text",
    style: {
      marginTop: 6
    }
  }, children) : null), actions ? /*#__PURE__*/React.createElement("div", {
    className: "empty__actions"
  }, actions) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/EmptyState/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/Icon/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const P = {
  dashboard: 'M4 4h6.5v6.5H4zM13.5 4H20v3.5h-6.5zM13.5 11H20v9h-6.5zM4 14h6.5v6H4z',
  folder: 'M3 6.5A1.5 1.5 0 014.5 5h4l2 2.5h9A1.5 1.5 0 0121 9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5z',
  file: 'M6 3h7.5L19 8.5V21H6zM13 3v6h6',
  filePlus: 'M6 3h7.5L19 8.5V21H6zM13 3v6h6M12 12v6M9 15h6',
  upload: 'M12 16.5V4M7.5 8.5L12 4l4.5 4.5M4 20h16',
  download: 'M12 4v12.5M7.5 12L12 16.5 16.5 12M4 20h16',
  key: 'M14.5 9.5a3.5 3.5 0 10-3.4 3.5H12l1.5 1.5 2-1 1.5 1.5 2-1.5-1.5-1.5 1.5-1.5-1.5-1H14.5z',
  agent: 'M7 7.5h10v9H7zM10 11h.01M14 11h.01M10 14h4M12 4v3.5M4.5 10.5H3M4.5 13.5H3M21 10.5h-1.5M21 13.5h-1.5',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  chart: 'M4 20V10M10 20V4M16 20v-7M2 20h20',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5V12l3 2',
  gear: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM16.2 16.2L21 21',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  chevronDown: 'M6 9.5l6 6 6-6',
  chevronRight: 'M9.5 6l6 6-6 6',
  chevronLeft: 'M14.5 6l-6 6 6 6',
  chevronUpDown: 'M8 10l4-4 4 4M8 14l4 4 4-4',
  copy: 'M9 9h11v11H9zM15 9V4H4v11h5',
  trash: 'M4 7h16M9.5 7V4h5v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6',
  check: 'M4.5 12.5l5 5L20 7',
  x: 'M6 6l12 12M18 6L6 18',
  alert: 'M12 3.5L21.5 20h-19zM12 10v4.5M12 17.5v.01',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5.5M12 7.8v.01',
  lock: 'M4.5 10.5h15V21h-15zM8 10.5V7a4 4 0 018 0v3.5',
  unlock: 'M4.5 10.5h15V21h-15zM8 10.5V7a4 4 0 017.5-1.9',
  more: 'M12 5.5v.01M12 12v.01M12 18.5v.01',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L12 6.4M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7L12 17.6',
  refresh: 'M20 12a8 8 0 11-2.4-5.7M20 4v4.5h-4.5',
  shield: 'M12 3l8 3v5.5c0 4.8-3.3 7.8-8 9.5-4.7-1.7-8-4.7-8-9.5V6z',
  book: 'M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2zM19 17H6a2 2 0 00-2 2',
  terminal: 'M5 7.5l4.5 4.5L5 16.5M12.5 17H19',
  eye: 'M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  eyeOff: 'M4 4l16 16M9.9 5.2A9.9 9.9 0 0112 5c6 0 9.5 6 9.5 6a17 17 0 01-3.3 3.8M6.3 8.2A17 17 0 002.5 11S6 17 12 17c1 0 1.9-.2 2.8-.5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  external: 'M14 4h6v6M20 4l-8.5 8.5M18 13.5V20H4V6h6.5',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M17 4.7a3.5 3.5 0 010 6.6M18.5 14.8c1.9.7 3 2.2 3 4.2',
  database: 'M4 6c0 1.7 3.6 3 8 3s8-1.3 8-3-3.6-3-8-3-8 1.3-8 3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  billing: 'M3 7h18v11H3zM3 11h18M6.5 15h3',
  logout: 'M14 4H5v16h9M18.5 12H10M15.5 8.5L19 12l-3.5 3.5',
  drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  pin: 'M12 21v-6M8 4h8l-1 6 3 3H6l3-3z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  archive: 'M3 5h18v4H3zM5 9v11h14V9M10 13h4'
};
function Icon({
  name = 'file',
  size = 16,
  strokeWidth = 1.6,
  className = '',
  title,
  ...rest
}) {
  const d = P[name] || P.file;
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    role: title ? 'img' : undefined,
    "aria-hidden": title ? undefined : true,
    focusable: "false"
  }, rest), title ? /*#__PURE__*/React.createElement("title", null, title) : null, /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
const iconNames = Object.keys(P);
Object.assign(__ds_scope, { Icon, iconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/ActivityRow/ActivityRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ACTION = {
  'file.upload': {
    icon: 'upload',
    label: 'uploaded'
  },
  'file.download': {
    icon: 'download',
    label: 'downloaded'
  },
  'file.delete': {
    icon: 'trash',
    label: 'deleted'
  },
  'file.move': {
    icon: 'link',
    label: 'moved'
  },
  'folder.create': {
    icon: 'folder',
    label: 'created folder'
  },
  'key.create': {
    icon: 'key',
    label: 'created API key'
  },
  'key.revoke': {
    icon: 'lock',
    label: 'revoked API key'
  },
  'agent.create': {
    icon: 'agent',
    label: 'created agent'
  },
  'mcp.call': {
    icon: 'terminal',
    label: 'called'
  },
  'auth.denied': {
    icon: 'shield',
    label: 'was denied access to'
  }
};
function ActivityRow({
  action,
  actor,
  actorType = 'user',
  resource,
  time,
  status = 'ok',
  detail,
  className = '',
  ...rest
}) {
  const a = ACTION[action] || {
    icon: 'activity',
    label: action
  };
  const denied = status === 'denied' || status === 'error';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '12px 16px',
      borderBottom: '1px solid var(--line)'
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 24,
      height: 24,
      flex: 'none',
      marginTop: 1,
      borderRadius: 'var(--r-1)',
      display: 'grid',
      placeItems: 'center',
      border: '1px solid ' + (denied ? 'var(--danger-line)' : 'var(--line)'),
      background: denied ? 'var(--danger-soft)' : 'var(--surface-2)',
      color: denied ? 'var(--danger)' : 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: denied ? 'shield' : a.icon,
    size: 13
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      textWrap: 'pretty'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: 'var(--ink)',
      fontFamily: actorType === 'agent' ? 'var(--font-mono)' : undefined,
      fontSize: actorType === 'agent' ? 12 : undefined
    }
  }, actor), ' ', a.label, ' ', resource ? /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, resource) : null), detail ? /*#__PURE__*/React.createElement("p", {
    className: "ad-meta",
    style: {
      marginTop: 3
    }
  }, detail) : null), /*#__PURE__*/React.createElement("span", {
    className: "ad-mono-sm",
    style: {
      flex: 'none',
      color: 'var(--ink-4)',
      marginTop: 2
    }
  }, time));
}
Object.assign(__ds_scope, { ActivityRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ActivityRow/ActivityRow.jsx", error: String((e && e.message) || e) }); }

// components/AgentCard/AgentCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATUS = {
  active: {
    tone: 'ok',
    label: 'Active'
  },
  idle: {
    tone: 'neutral',
    label: 'Idle'
  },
  no_key: {
    tone: 'warn',
    label: 'No credential'
  },
  key_expired: {
    tone: 'warn',
    label: 'Credential expired'
  },
  revoked: {
    tone: 'danger',
    label: 'Revoked'
  }
};
function AgentCard({
  name,
  slug,
  status = 'idle',
  permission = 'Read only',
  workspace,
  lastActive,
  requests,
  transport = 'MCP',
  onOpen,
  className = '',
  ...rest
}) {
  const s = STATUS[status] || STATUS.idle;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onOpen,
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      textAlign: 'left',
      width: '100%',
      padding: 16,
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-3)',
      cursor: 'pointer',
      transition: 'border-color var(--d-1) var(--ease), box-shadow var(--d-1) var(--ease)'
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 10,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 30,
      height: 30,
      flex: 'none',
      borderRadius: 'var(--r-2)',
      display: 'grid',
      placeItems: 'center',
      border: '1px solid var(--line-2)',
      background: 'var(--surface-2)',
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "agent",
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate",
    style: {
      display: 'block',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink)',
      letterSpacing: '-0.011em'
    }
  }, name), slug ? /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate ad-mono-sm",
    style: {
      display: 'block',
      color: 'var(--ink-3)'
    }
  }, slug) : null), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: s.tone,
    dot: true,
    pulse: status === 'active'
  }, s.label)), /*#__PURE__*/React.createElement("dl", {
    className: "dl",
    style: {
      gridTemplateColumns: 'auto 1fr',
      gap: '6px 16px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("dt", null, "Permission"), /*#__PURE__*/React.createElement("dd", null, permission), /*#__PURE__*/React.createElement("dt", null, "Transport"), /*#__PURE__*/React.createElement("dd", null, /*#__PURE__*/React.createElement("span", {
    className: "ad-mono-sm"
  }, transport)), workspace ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Workspace"), /*#__PURE__*/React.createElement("dd", {
    className: "ad-truncate"
  }, workspace)) : null, /*#__PURE__*/React.createElement("dt", null, "Last active"), /*#__PURE__*/React.createElement("dd", null, lastActive || 'Never'), requests != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Requests, 7d"), /*#__PURE__*/React.createElement("dd", {
    className: "ad-num"
  }, requests)) : null));
}
Object.assign(__ds_scope, { AgentCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/AgentCard/AgentCard.jsx", error: String((e && e.message) || e) }); }

// components/Alert/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICO = {
  neutral: 'info',
  accent: 'info',
  ok: 'check',
  warn: 'alert',
  danger: 'alert'
};
function Alert({
  tone = 'neutral',
  title,
  children,
  actions,
  icon,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['alert', tone !== 'neutral' ? 'alert--' + tone : '', className].filter(Boolean).join(' '),
    role: tone === 'danger' ? 'alert' : 'status'
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "alert__ico"
  }, icon || /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ICO[tone],
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    className: "alert__body"
  }, title ? /*#__PURE__*/React.createElement("p", {
    className: "alert__title"
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    className: "alert__text"
  }, children) : null, actions ? /*#__PURE__*/React.createElement("div", {
    className: "alert__actions"
  }, actions) : null));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Alert/Alert.jsx", error: String((e && e.message) || e) }); }

// components/ApiKeyDisplay/ApiKeyDisplay.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function ApiKeyDisplay({
  secret,
  lastFour,
  prefix = 'ad_live',
  revealed = false,
  onAcknowledge,
  className = '',
  ...rest
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard.writeText(secret || '');
    } catch (e) {/* clipboard unavailable */}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!revealed) {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: "ad-mono",
      style: {
        color: 'var(--ink-2)',
        letterSpacing: '0.04em'
      }
    }, rest), prefix, "_", '\u2022'.repeat(8), lastFour);
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      border: '1px solid var(--warn-line)',
      background: 'var(--warn-soft)',
      borderRadius: 'var(--r-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("code", {
    className: "ad-mono",
    style: {
      flex: 1,
      minWidth: 0,
      padding: '10px 12px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      color: 'var(--ink)'
    }
  }, secret), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: copy,
    style: {
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 14px',
      border: 0,
      borderLeft: '1px solid var(--warn-line)',
      background: 'transparent',
      color: 'var(--ink)',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: copied ? 'check' : 'copy',
    size: 13
  }), copied ? 'Copied' : 'Copy')), /*#__PURE__*/React.createElement("p", {
    className: "ad-meta",
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alert",
    size: 13,
    style: {
      marginTop: 2,
      flex: 'none',
      color: 'var(--warn)'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Copy this key now. It is stored only as a hash, so we cannot show it again. If you lose it, revoke the key and create a new one.")), onAcknowledge ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "sm",
    onClick: onAcknowledge
  }, "I\u2019ve stored this key")) : null);
}
Object.assign(__ds_scope, { ApiKeyDisplay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ApiKeyDisplay/ApiKeyDisplay.jsx", error: String((e && e.message) || e) }); }

// components/AppShell/AppShell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function AppShell({
  nav = [],
  active,
  workspace,
  user,
  topbar,
  topbarActions,
  children,
  flush = false,
  onNavigate,
  className = '',
  ...rest
}) {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['shell', open ? 'is-open' : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("nav", {
    className: "shell__nav",
    "aria-label": "Primary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shell__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "shell__logo",
    "aria-hidden": "true"
  }, "A"), /*#__PURE__*/React.createElement("span", {
    className: "shell__wordmark"
  }, "AgentDrive")), workspace ? /*#__PURE__*/React.createElement("div", {
    className: "shell__ws"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "shell__wsbtn"
  }, /*#__PURE__*/React.createElement("span", {
    className: "shell__wsmark",
    "aria-hidden": "true"
  }, (workspace.name || 'W').slice(0, 1).toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "shell__wsname",
    style: {
      display: 'block'
    }
  }, workspace.name), /*#__PURE__*/React.createElement("span", {
    className: "shell__wsmeta"
  }, workspace.meta)), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronUpDown",
    size: 14
  }))) : null, /*#__PURE__*/React.createElement("div", {
    className: "shell__scroll"
  }, nav.map((group, gi) => /*#__PURE__*/React.createElement("div", {
    className: "shell__group",
    key: group.label || gi
  }, group.label ? /*#__PURE__*/React.createElement("p", {
    className: "shell__grouplabel"
  }, group.label) : null, group.items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it.id,
    href: it.href || '#',
    className: "shell__link",
    "aria-current": it.id === active ? 'page' : undefined,
    onClick: onNavigate ? e => {
      e.preventDefault();
      onNavigate(it.id);
      setOpen(false);
    } : undefined
  }, /*#__PURE__*/React.createElement("span", {
    className: "shell__linkico"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate"
  }, it.label), it.badge != null ? /*#__PURE__*/React.createElement("span", {
    className: "shell__badge"
  }, it.badge) : null))))), user ? /*#__PURE__*/React.createElement("div", {
    className: "shell__foot"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "shell__user"
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    "aria-hidden": "true"
  }, (user.name || 'U').slice(0, 1).toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate",
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 500
    }
  }, user.name), /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate",
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, user.email)), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronUpDown",
    size: 14
  }))) : null), /*#__PURE__*/React.createElement("div", {
    className: "shell__main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "shell__top"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    className: "shell__burger",
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: open ? 'x' : 'menu',
      size: 17
    }),
    label: open ? 'Close navigation' : 'Open navigation',
    onClick: () => setOpen(!open)
  }), topbar, topbarActions ? /*#__PURE__*/React.createElement("div", {
    className: "shell__topactions"
  }, topbarActions) : null), /*#__PURE__*/React.createElement("main", {
    className: ['shell__page', flush ? 'shell__page--flush' : ''].filter(Boolean).join(' ')
  }, children)));
}
Object.assign(__ds_scope, { AppShell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/AppShell/AppShell.jsx", error: String((e && e.message) || e) }); }

// components/CodeBlock/CodeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function CodeBlock({
  code = '',
  filename,
  theme = 'dark',
  copyable = true,
  actions,
  className = '',
  ...rest
}) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard.writeText(code);
    } catch (e) {/* clipboard unavailable */}
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['code', theme === 'light' ? 'code--light' : '', className].filter(Boolean).join(' ')
  }, rest), filename || copyable || actions ? /*#__PURE__*/React.createElement("div", {
    className: "code__head"
  }, filename ? /*#__PURE__*/React.createElement("span", {
    className: "code__name"
  }, filename) : null, /*#__PURE__*/React.createElement("div", {
    className: "code__tools"
  }, actions, copyable ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "code__copy",
    onClick: copy
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: done ? 'check' : 'copy',
    size: 12
  }), done ? 'Copied' : 'Copy') : null)) : null, /*#__PURE__*/React.createElement("pre", {
    className: "code__pre"
  }, /*#__PURE__*/React.createElement("code", null, code)));
}
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/CodeBlock/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/FileCell/FileCell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const EXT_LABEL = {
  pdf: 'PDF',
  json: 'JSON',
  md: 'MD',
  txt: 'TXT',
  csv: 'CSV',
  png: 'PNG',
  jpg: 'JPG',
  jpeg: 'JPG',
  zip: 'ZIP',
  html: 'HTML',
  js: 'JS',
  ts: 'TS',
  py: 'PY',
  sql: 'SQL',
  yaml: 'YML',
  log: 'LOG'
};
function FileCell({
  name,
  kind = 'file',
  meta,
  ext,
  agentWritten = false,
  ...rest
}) {
  const isFolder = kind === 'folder';
  const label = ext || (name && name.indexOf('.') > -1 ? name.split('.').pop().toLowerCase() : '');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "row",
    style: {
      gap: 10
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 26,
      height: 26,
      flex: 'none',
      borderRadius: 'var(--r-1)',
      display: 'grid',
      placeItems: 'center',
      border: '1px solid ' + (isFolder ? 'var(--accent-line)' : 'var(--line)'),
      background: isFolder ? 'var(--accent-soft)' : 'var(--surface-2)',
      color: isFolder ? 'var(--accent-ink)' : 'var(--ink-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: 0
    }
  }, isFolder ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "folder",
    size: 14
  }) : EXT_LABEL[label] || /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "file",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate",
    style: {
      display: 'block',
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, name), meta ? /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate",
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, meta) : null), agentWritten ? /*#__PURE__*/React.createElement("span", {
    title: "Written by an agent",
    "aria-label": "Written by an agent",
    style: {
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      height: 18,
      padding: '0 5px',
      borderRadius: 'var(--r-1)',
      border: '1px solid var(--accent-line)',
      background: 'var(--accent-soft)',
      color: 'var(--accent-ink)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "agent",
    size: 10
  }), "agent") : null);
}
Object.assign(__ds_scope, { FileCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/FileCell/FileCell.jsx", error: String((e && e.message) || e) }); }

// components/Input/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  description,
  radio = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['check', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: radio ? 'radio' : 'checkbox'
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: ['check__box', radio ? 'check__box--radio' : ''].filter(Boolean).join(' '),
    "aria-hidden": "true"
  }, radio ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: 'currentColor'
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 11,
    strokeWidth: 2.6
  })), /*#__PURE__*/React.createElement("span", {
    className: "check__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "check__title"
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    className: "check__desc",
    style: {
      display: 'block'
    }
  }, description) : null));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Input/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/Input/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Input({
  label,
  hint,
  error,
  optional = false,
  required = false,
  prefix,
  suffix,
  leadingIcon,
  mono = false,
  size = 'md',
  multiline = false,
  id,
  className = '',
  disabled,
  ...rest
}) {
  const auto = useId();
  const inputId = id || auto;
  const hintId = hint ? inputId + '-hint' : undefined;
  const errId = error ? inputId + '-err' : undefined;
  const Tag = multiline ? 'textarea' : 'input';
  const cls = ['field', error ? 'is-error' : '', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ');
  const inputCls = ['field__input', mono ? 'field__input--mono' : '', size === 'lg' ? 'field__input--lg' : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: cls
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "field__label",
    htmlFor: inputId
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "field__req",
    "aria-hidden": "true"
  }, "*") : null, optional ? /*#__PURE__*/React.createElement("span", {
    className: "field__opt"
  }, "Optional") : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "field__wrap"
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    className: "field__affix"
  }, prefix) : null, leadingIcon ? /*#__PURE__*/React.createElement("span", {
    className: "field__ico"
  }, leadingIcon) : null, /*#__PURE__*/React.createElement(Tag, _extends({
    id: inputId,
    className: inputCls,
    disabled: disabled,
    required: required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [errId, hintId].filter(Boolean).join(' ') || undefined
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    className: "field__affix field__affix--end"
  }, suffix) : null), error ? /*#__PURE__*/React.createElement("p", {
    className: "field__error",
    id: errId
  }, error) : hint ? /*#__PURE__*/React.createElement("p", {
    className: "field__hint",
    id: hintId
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Input/Input.jsx", error: String((e && e.message) || e) }); }

// components/Input/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Select({
  label,
  hint,
  error,
  options = [],
  required = false,
  id,
  className = '',
  disabled,
  children,
  ...rest
}) {
  const auto = useId();
  const selId = id || auto;
  const cls = ['field', error ? 'is-error' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: cls
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "field__label",
    htmlFor: selId
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "field__req"
  }, "*") : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "select"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    className: "select__el",
    disabled: disabled,
    "aria-invalid": error ? true : undefined
  }, rest), children || options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const l = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement("span", {
    className: "select__chev"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronDown",
    size: 14
  }))), error ? /*#__PURE__*/React.createElement("p", {
    className: "field__error"
  }, error) : hint ? /*#__PURE__*/React.createElement("p", {
    className: "field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Input/Select.jsx", error: String((e && e.message) || e) }); }

// components/Input/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['switch', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "switch__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "switch__knob"
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Input/Switch.jsx", error: String((e && e.message) || e) }); }

// components/McpToolList/McpToolList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function McpToolList({
  tools = [],
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ul", _extends({
    className: className,
    style: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column'
    }
  }, rest), tools.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: t.name,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '11px 16px',
      borderTop: i === 0 ? 0 : '1px solid var(--line)',
      background: t.enabled === false ? 'var(--surface-2)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      marginTop: 1,
      flex: 'none',
      color: t.enabled === false ? 'var(--ink-4)' : 'var(--ok)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.enabled === false ? 'lock' : 'check',
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("code", {
    className: "ad-mono",
    style: {
      color: t.enabled === false ? 'var(--ink-3)' : 'var(--ink)',
      fontWeight: 500
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12,
      color: 'var(--ink-2)',
      marginTop: 2,
      textWrap: 'pretty'
    }
  }, t.description), t.enabled === false ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12,
      color: 'var(--warn)',
      marginTop: 4
    }
  }, "Unavailable to this agent. Requires ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, t.scope), ".") : null), /*#__PURE__*/React.createElement("span", {
    className: "badge badge--mono",
    style: {
      flex: 'none',
      marginTop: 1
    }
  }, t.scope))));
}
const mcpTools = [{
  name: 'list_files',
  scope: 'files:read',
  description: 'List files and folders in a path, with size, MIME type and version count.'
}, {
  name: 'get_file',
  scope: 'files:read',
  description: 'Fetch a file\u2019s contents, or a time-limited download URL for large objects.'
}, {
  name: 'get_metadata',
  scope: 'files:read',
  description: 'Return metadata for one object without transferring its body.'
}, {
  name: 'search_files',
  scope: 'files:read',
  description: 'Search filenames, paths and extracted text within the agent\u2019s workspace.'
}, {
  name: 'create_file',
  scope: 'files:write',
  description: 'Write a new file. Fails if the path already exists.'
}, {
  name: 'update_file',
  scope: 'files:write',
  description: 'Overwrite an existing file and record a new version.'
}, {
  name: 'create_folder',
  scope: 'files:write',
  description: 'Create a folder at the given path.'
}, {
  name: 'move_file',
  scope: 'files:write',
  description: 'Move or rename an object within the workspace.'
}, {
  name: 'copy_file',
  scope: 'files:write',
  description: 'Copy an object to a new path in the same workspace.'
}, {
  name: 'delete_file',
  scope: 'files:delete',
  description: 'Move an object to the trash. Recoverable for 30 days.'
}];
Object.assign(__ds_scope, { McpToolList, mcpTools });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/McpToolList/McpToolList.jsx", error: String((e && e.message) || e) }); }

// components/Menu/Menu.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Menu({
  items = [],
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['menu', className].filter(Boolean).join(' '),
    role: "menu"
  }, rest), items.map((it, i) => {
    if (it.type === 'separator') return /*#__PURE__*/React.createElement("div", {
      key: 's' + i,
      className: "menu__sep",
      role: "separator"
    });
    if (it.type === 'label') return /*#__PURE__*/React.createElement("div", {
      key: 'l' + i,
      className: "menu__label"
    }, it.label);
    return /*#__PURE__*/React.createElement("button", {
      key: it.label + i,
      type: "button",
      role: "menuitem",
      disabled: it.disabled,
      className: ['menu__item', it.danger ? 'menu__item--danger' : ''].filter(Boolean).join(' '),
      onClick: it.onSelect
    }, it.icon, /*#__PURE__*/React.createElement("span", null, it.label), it.shortcut ? /*#__PURE__*/React.createElement("span", {
      className: "menu__kbd"
    }, it.shortcut) : null);
  }));
}
Object.assign(__ds_scope, { Menu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Menu/Menu.jsx", error: String((e && e.message) || e) }); }

// components/Modal/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useEffect,
  useRef
} = React;
function Modal({
  open = true,
  title,
  description,
  mark,
  tone = 'neutral',
  size = 'sm',
  footer,
  onClose,
  children,
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    if (ref.current) {
      const f = ref.current.querySelector('input,select,textarea,button,[href],[tabindex]:not([tabindex="-1"])');
      if (f) f.focus();
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onMouseDown: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    className: ['modal', size !== 'sm' ? 'modal--' + size : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("header", {
    className: "modal__head"
  }, mark ? /*#__PURE__*/React.createElement("div", {
    className: ['modal__mark', tone !== 'neutral' ? 'modal__mark--' + tone : ''].filter(Boolean).join(' ')
  }, mark) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "modal__title"
  }, title), description ? /*#__PURE__*/React.createElement("p", {
    className: "modal__desc"
  }, description) : null), onClose ? /*#__PURE__*/React.createElement("div", {
    className: "modal__x"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "x",
      size: 15
    }),
    label: "Close",
    onClick: onClose
  })) : null), children ? /*#__PURE__*/React.createElement("div", {
    className: "modal__body"
  }, children) : null, footer ? /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, footer) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Modal/Modal.jsx", error: String((e && e.message) || e) }); }

// components/Modal/ConfirmModal.jsx
try { (() => {
function ConfirmModal({
  open = true,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onClose,
  children
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Modal, {
    open: open,
    title: title,
    description: description,
    onClose: onClose,
    tone: destructive ? 'danger' : 'accent',
    mark: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: destructive ? 'alert' : 'info',
      size: 16
    }),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "secondary",
      onClick: onClose
    }, cancelLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: destructive ? 'danger' : 'primary',
      loading: loading,
      onClick: onConfirm
    }, confirmLabel))
  }, children);
}
Object.assign(__ds_scope, { ConfirmModal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Modal/ConfirmModal.jsx", error: String((e && e.message) || e) }); }

// components/Panel/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Panel({
  title,
  subtitle,
  actions,
  footer,
  flush = false,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    className: ['panel', className].filter(Boolean).join(' ')
  }, rest), title || actions ? /*#__PURE__*/React.createElement("header", {
    className: "panel__head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("h2", {
    className: "panel__title"
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("p", {
    className: "panel__sub"
  }, subtitle) : null), actions ? /*#__PURE__*/React.createElement("div", {
    className: "panel__actions"
  }, actions) : null) : null, /*#__PURE__*/React.createElement("div", {
    className: ['panel__body', flush ? 'panel__body--flush' : ''].filter(Boolean).join(' ')
  }, children), footer ? /*#__PURE__*/React.createElement("footer", {
    className: "panel__foot"
  }, footer) : null);
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Panel/Panel.jsx", error: String((e && e.message) || e) }); }

// components/PermissionSelector/PermissionSelector.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PRESETS = [{
  id: 'read',
  label: 'Read only',
  desc: 'List and download files. Cannot change anything.',
  scopes: ['files:read']
}, {
  id: 'write',
  label: 'Read and write',
  desc: 'List, download, upload and overwrite files.',
  scopes: ['files:read', 'files:write']
}, {
  id: 'full',
  label: 'Full access',
  desc: 'Read, write and permanently delete files.',
  scopes: ['files:read', 'files:write', 'files:delete']
}];
function PermissionSelector({
  value = 'read',
  onChange,
  name = 'permission',
  presets = PRESETS,
  disabled = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    role: "radiogroup",
    "aria-label": "Agent permissions",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, rest), presets.map(p => {
    const on = p.id === value;
    return /*#__PURE__*/React.createElement("label", {
      key: p.id,
      style: {
        display: 'flex',
        gap: 12,
        padding: '12px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line-2)'),
        background: on ? 'var(--accent-soft)' : 'var(--surface)',
        borderRadius: 'var(--r-2)',
        boxShadow: on ? 'var(--ring)' : 'none',
        transition: 'border-color var(--d-1) var(--ease), background var(--d-1) var(--ease)',
        opacity: disabled ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: name,
      value: p.id,
      checked: on,
      disabled: disabled,
      onChange: () => onChange && onChange(p.id),
      style: {
        position: 'absolute',
        opacity: 0,
        width: 0,
        height: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        width: 16,
        height: 16,
        marginTop: 2,
        flex: 'none',
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line-3)'),
        background: on ? 'var(--accent)' : 'var(--surface)'
      }
    }, on ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 999,
        background: 'var(--on-accent)'
      }
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--ink)'
      }
    }, p.label), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 12,
        color: 'var(--ink-2)',
        marginTop: 1
      }
    }, p.desc), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 4,
        marginTop: 8,
        flexWrap: 'wrap'
      }
    }, p.scopes.map(s => /*#__PURE__*/React.createElement("span", {
      key: s,
      className: "badge badge--mono"
    }, s)))), p.id === 'full' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "alert",
      size: 14,
      style: {
        flex: 'none',
        color: 'var(--warn)',
        marginTop: 2
      },
      title: "Includes permanent deletion"
    }) : null);
  }));
}
const permissionPresets = PRESETS;
Object.assign(__ds_scope, { PermissionSelector, permissionPresets });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/PermissionSelector/PermissionSelector.jsx", error: String((e && e.message) || e) }); }

// components/Skeleton/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Skeleton({
  width = '100%',
  height = 10,
  radius,
  lines = 1,
  gap = 8,
  className = '',
  ...rest
}) {
  if (lines > 1) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap
      }
    }, rest), Array.from({
      length: lines
    }).map((_, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "skel",
      style: {
        height,
        width: i === lines - 1 ? '62%' : width,
        borderRadius: radius
      }
    })));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['skel', className].filter(Boolean).join(' '),
    style: {
      display: 'block',
      width,
      height,
      borderRadius: radius
    }
  }, rest));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Skeleton/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/StatTile/Meter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Meter({
  value = 0,
  max = 1,
  tone,
  label,
  className = '',
  ...rest
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const auto = pct >= 0.95 ? 'danger' : pct >= 0.8 ? 'warn' : '';
  const t = tone || auto;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['meter', className].filter(Boolean).join(' '),
    role: "progressbar",
    "aria-valuenow": Math.round(pct * 100),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-label": label
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: ['meter__fill', t ? 'meter__fill--' + t : ''].filter(Boolean).join(' '),
    style: {
      width: (pct * 100).toFixed(1) + '%'
    }
  }));
}
Object.assign(__ds_scope, { Meter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/StatTile/Meter.jsx", error: String((e && e.message) || e) }); }

// components/StatTile/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatTile({
  label,
  value,
  unit,
  sub,
  icon,
  meter,
  meterMax = 1,
  meterTone,
  loading = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['stat', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "stat__label"
  }, icon, label), loading ? /*#__PURE__*/React.createElement("span", {
    className: "skel",
    style: {
      height: 24,
      width: '55%'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    className: "stat__val"
  }, value, unit ? /*#__PURE__*/React.createElement("span", {
    className: "stat__unit"
  }, unit) : null), meter != null ? /*#__PURE__*/React.createElement(__ds_scope.Meter, {
    value: meter,
    max: meterMax,
    tone: meterTone,
    label: label
  }) : null, sub ? /*#__PURE__*/React.createElement("span", {
    className: "stat__sub"
  }, sub) : null);
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/StatTile/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/Tabs/Breadcrumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Breadcrumb({
  items = [],
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: ['crumbs', className].filter(Boolean).join(' '),
    "aria-label": "Folder path"
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: it.label + i
    }, last ? /*#__PURE__*/React.createElement("span", {
      className: "crumbs__item",
      "aria-current": "page"
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      className: "crumbs__item",
      href: it.href || '#',
      onClick: it.onSelect
    }, it.label), last ? null : /*#__PURE__*/React.createElement("span", {
      className: "crumbs__sep",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevronRight",
      size: 12
    })));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Tabs/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/Tabs/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['tabs', className].filter(Boolean).join(' '),
    role: "tablist"
  }, rest), items.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    type: "button",
    role: "tab",
    "aria-selected": t.value === value,
    className: "tabs__item",
    onClick: () => onChange && onChange(t.value)
  }, t.label, t.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "tabs__count"
  }, t.count) : null)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Tabs/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/Toast/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICO = {
  neutral: 'info',
  ok: 'check',
  warn: 'alert',
  danger: 'alert'
};
function Toast({
  tone = 'neutral',
  title,
  children,
  action,
  onDismiss,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['toast', 'toast--' + tone, className].filter(Boolean).join(' '),
    role: "status",
    "aria-live": "polite"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "toast__ico"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ICO[tone],
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "toast__title"
  }, title), children ? /*#__PURE__*/React.createElement("p", {
    className: "toast__text"
  }, children) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action) : null), onDismiss ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "x",
      size: 13
    }),
    label: "Dismiss",
    onClick: onDismiss
  }) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Toast/Toast.jsx", error: String((e && e.message) || e) }); }

// components/UploadDropzone/UploadDropzone.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function UploadDropzone({
  maxSize = '5 GB',
  onFiles,
  compact = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const [over, setOver] = useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: e => {
      e.preventDefault();
      setOver(false);
      if (onFiles) onFiles(Array.from(e.dataTransfer.files || []));
    },
    style: {
      border: '1px dashed ' + (over ? 'var(--accent)' : 'var(--line-3)'),
      background: over ? 'var(--accent-soft)' : 'var(--surface-2)',
      borderRadius: 'var(--r-3)',
      padding: compact ? '20px' : '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      textAlign: 'center',
      transition: 'border-color var(--d-2) var(--ease), background var(--d-2) var(--ease)',
      opacity: disabled ? 0.5 : 1
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--r-2)',
      display: 'grid',
      placeItems: 'center',
      border: '1px solid ' + (over ? 'var(--accent-line)' : 'var(--line-2)'),
      background: 'var(--surface)',
      color: over ? 'var(--accent)' : 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "upload",
    size: 17
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "Drop files here to upload"), /*#__PURE__*/React.createElement("p", {
    className: "ad-meta",
    style: {
      marginTop: 2
    }
  }, "Up to ", maxSize, " per file. Files upload straight to storage, never through our API.")), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "sm",
    disabled: disabled
  }, "Choose files"));
}
Object.assign(__ds_scope, { UploadDropzone });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/UploadDropzone/UploadDropzone.jsx", error: String((e && e.message) || e) }); }

// components/UploadDropzone/UploadItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATE = {
  queued: {
    label: 'Queued',
    tone: 'neutral',
    icon: 'clock'
  },
  uploading: {
    label: 'Uploading',
    tone: 'accent',
    icon: 'upload'
  },
  processing: {
    label: 'Processing',
    tone: 'accent',
    icon: 'refresh'
  },
  complete: {
    label: 'Complete',
    tone: 'ok',
    icon: 'check'
  },
  failed: {
    label: 'Failed',
    tone: 'danger',
    icon: 'alert'
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'neutral',
    icon: 'x'
  }
};
function UploadItem({
  name,
  size,
  status = 'uploading',
  progress = 0,
  error,
  onRetry,
  onCancel,
  className = '',
  ...rest
}) {
  const s = STATE[status] || STATE.uploading;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '10px 12px',
      borderBottom: '1px solid var(--line)'
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      marginTop: 2,
      flex: 'none',
      color: s.tone === 'danger' ? 'var(--danger)' : s.tone === 'ok' ? 'var(--ok)' : 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.icon,
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-truncate",
    style: {
      fontSize: 13,
      color: 'var(--ink)',
      flex: 1
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "ad-mono-sm",
    style: {
      color: 'var(--ink-3)',
      flex: 'none'
    }
  }, size)), status === 'uploading' || status === 'processing' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Meter, {
    value: status === 'processing' ? 1 : progress,
    max: 1,
    tone: "ok",
    label: s.label
  }), /*#__PURE__*/React.createElement("span", {
    className: "ad-meta"
  }, status === 'processing' ? 'Extracting text and metadata. The file is already stored.' : s.label + ' \u00b7 ' + Math.round(progress * 100) + '%')) : /*#__PURE__*/React.createElement("span", {
    className: "ad-meta",
    style: {
      color: status === 'failed' ? 'var(--danger)' : undefined
    }
  }, status === 'failed' ? error || 'Upload failed. Check your connection and try again.' : s.label)), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 2,
      flex: 'none'
    }
  }, status === 'failed' && onRetry ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "refresh",
      size: 14
    }),
    label: 'Retry ' + name,
    onClick: onRetry
  }) : null, (status === 'uploading' || status === 'queued') && onCancel ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "x",
      size: 14
    }),
    label: 'Cancel ' + name,
    onClick: onCancel
  }) : null));
}
Object.assign(__ds_scope, { UploadItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/UploadDropzone/UploadItem.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ActivityRow = __ds_scope.ActivityRow;

__ds_ns.AgentCard = __ds_scope.AgentCard;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.ApiKeyDisplay = __ds_scope.ApiKeyDisplay;

__ds_ns.AppShell = __ds_scope.AppShell;

__ds_ns.PageHead = __ds_scope.PageHead;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.FileCell = __ds_scope.FileCell;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.McpToolList = __ds_scope.McpToolList;

__ds_ns.Menu = __ds_scope.Menu;

__ds_ns.ConfirmModal = __ds_scope.ConfirmModal;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.PermissionSelector = __ds_scope.PermissionSelector;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Meter = __ds_scope.Meter;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.UploadDropzone = __ds_scope.UploadDropzone;

__ds_ns.UploadItem = __ds_scope.UploadItem;

})();
