import React, { useState } from 'react';
import { Icon } from '../Icon/Icon.jsx';

export function CodeBlock({ code = '', filename, theme = 'dark', copyable = true, actions, className = '', ...rest }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(code); } catch (e) { /* clipboard unavailable */ }
    setDone(true); setTimeout(() => setDone(false), 1600);
  };
  return (
    <div className={['code', theme === 'light' ? 'code--light' : '', className].filter(Boolean).join(' ')} {...rest}>
      {(filename || copyable || actions) ? (
        <div className="code__head">
          {filename ? <span className="code__name">{filename}</span> : null}
          <div className="code__tools">
            {actions}
            {copyable ? (
              <button type="button" className="code__copy" onClick={copy}>
                <Icon name={done ? 'check' : 'copy'} size={12} />{done ? 'Copied' : 'Copy'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <pre className="code__pre"><code>{code}</code></pre>
    </div>
  );
}
