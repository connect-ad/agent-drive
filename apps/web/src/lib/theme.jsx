import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Light/dark, as the design's top bar specifies.
 *
 * Three states, not two. "system" is the default and is not the same as
 * picking light: it follows the reader's OS setting and keeps following it if
 * they change it. Choosing light or dark stamps `data-theme` on <html>, which
 * `styles.css` reads, and that choice outranks the media query in both
 * directions.
 *
 * Persisted per browser in localStorage. It is a display preference, not
 * account state — syncing it to the API would mean a write on every toggle and
 * a read before first paint, for something the browser can answer instantly.
 *
 * Every storage access is wrapped: Safari in private mode throws on
 * localStorage rather than returning null, and a theme control is not worth a
 * blank page.
 */

const KEY = 'agentdisk:theme';
const ThemeContext = createContext(null);

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function write(value) {
  try {
    if (value === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    /* Private mode, or site data blocked. The choice just will not persist. */
  }
}

/** Reflect the choice onto <html> so the CSS can see it. */
function apply(value) {
  const root = document.documentElement;
  if (value === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', value);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(read);

  useEffect(() => { apply(theme); }, [theme]);

  const choose = useCallback(value => {
    setTheme(value);
    write(value);
  }, []);

  /**
   * What the toggle flips to. From "system" it resolves what the OS is
   * currently showing and picks the opposite, so the first click always
   * visibly changes something — which is not true if "system" is treated as
   * light on a dark machine.
   */
  const toggle = useCallback(() => {
    setTheme(current => {
      let effective = current;
      if (current === 'system') {
        const prefersDark = typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-color-scheme: dark)').matches;
        effective = prefersDark ? 'dark' : 'light';
      }
      const next = effective === 'dark' ? 'light' : 'dark';
      write(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme: choose, toggle }), [theme, choose, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Screens outside the provider (the marketing pages) still render; they just
  // follow the system setting with no control to change it.
  return ctx ?? { theme: 'system', setTheme: () => {}, toggle: () => {} };
}
