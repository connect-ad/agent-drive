import React from 'react';

export function DataTable({
  columns = [], rows = [], rowKey = 'id', loading = false, skeletonRows = 5,
  empty, hover = true, selectedKeys = [], onRowClick, className = '', ...rest
}) {
  if (!loading && rows.length === 0 && empty) return empty;
  const body = loading
    ? Array.from({ length: skeletonRows }).map((_, i) => (
        <tr key={'s' + i}>
          {columns.map((c, j) => (
            <td key={c.key || j}>
              <span className="skel" style={{ display: 'block', width: j === 0 ? '58%' : '38%' }} />
            </td>
          ))}
        </tr>
      ))
    : rows.map((r, i) => {
        const k = r[rowKey] != null ? r[rowKey] : i;
        const sel = selectedKeys.indexOf(k) !== -1;
        return (
          <tr key={k} className={sel ? 'is-selected' : undefined}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r); } : undefined}>
            {columns.map((c, j) => (
              <td key={c.key || j}
                className={[c.align === 'right' ? 'tbl__num' : '', c.mono ? 'tbl__mono' : '', c.primary ? 'tbl__primary' : '', c.className || ''].filter(Boolean).join(' ')}
                style={c.width ? { width: c.width } : undefined}>
                {c.render ? c.render(r, i) : r[c.key]}
              </td>
            ))}
          </tr>
        );
      });
  return (
    <div className="tbl-scroll">
      <table className={['tbl', hover && onRowClick ? 'tbl--hover' : '', className].filter(Boolean).join(' ')} {...rest}>
        <thead>
          <tr>{columns.map((c, j) => (
            <th key={c.key || j} scope="col" style={{ textAlign: c.align === 'right' ? 'right' : undefined, width: c.width }}>{c.header}</th>
          ))}</tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}
