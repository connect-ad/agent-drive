import React from 'react';

const P = {
  dashboard:'M4 4h6.5v6.5H4zM13.5 4H20v3.5h-6.5zM13.5 11H20v9h-6.5zM4 14h6.5v6H4z',
  folder:'M3 6.5A1.5 1.5 0 014.5 5h4l2 2.5h9A1.5 1.5 0 0121 9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5z',
  file:'M6 3h7.5L19 8.5V21H6zM13 3v6h6',
  filePlus:'M6 3h7.5L19 8.5V21H6zM13 3v6h6M12 12v6M9 15h6',
  upload:'M12 16.5V4M7.5 8.5L12 4l4.5 4.5M4 20h16',
  download:'M12 4v12.5M7.5 12L12 16.5 16.5 12M4 20h16',
  key:'M14.5 9.5a3.5 3.5 0 10-3.4 3.5H12l1.5 1.5 2-1 1.5 1.5 2-1.5-1.5-1.5 1.5-1.5-1.5-1H14.5z',
  agent:'M7 7.5h10v9H7zM10 11h.01M14 11h.01M10 14h4M12 4v3.5M4.5 10.5H3M4.5 13.5H3M21 10.5h-1.5M21 13.5h-1.5',
  activity:'M3 12h4l3-8 4 16 3-8h4',
  chart:'M4 20V10M10 20V4M16 20v-7M2 20h20',
  clock:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5V12l3 2',
  gear:'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8',
  search:'M11 4a7 7 0 100 14 7 7 0 000-14zM16.2 16.2L21 21',
  plus:'M12 5v14M5 12h14',
  minus:'M5 12h14',
  chevronDown:'M6 9.5l6 6 6-6',
  chevronRight:'M9.5 6l6 6-6 6',
  chevronLeft:'M14.5 6l-6 6 6 6',
  chevronUpDown:'M8 10l4-4 4 4M8 14l4 4 4-4',
  copy:'M9 9h11v11H9zM15 9V4H4v11h5',
  trash:'M4 7h16M9.5 7V4h5v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6',
  check:'M4.5 12.5l5 5L20 7',
  x:'M6 6l12 12M18 6L6 18',
  alert:'M12 3.5L21.5 20h-19zM12 10v4.5M12 17.5v.01',
  info:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5.5M12 7.8v.01',
  lock:'M4.5 10.5h15V21h-15zM8 10.5V7a4 4 0 018 0v3.5',
  unlock:'M4.5 10.5h15V21h-15zM8 10.5V7a4 4 0 017.5-1.9',
  more:'M12 5.5v.01M12 12v.01M12 18.5v.01',
  link:'M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L12 6.4M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7L12 17.6',
  refresh:'M20 12a8 8 0 11-2.4-5.7M20 4v4.5h-4.5',
  shield:'M12 3l8 3v5.5c0 4.8-3.3 7.8-8 9.5-4.7-1.7-8-4.7-8-9.5V6z',
  book:'M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2zM19 17H6a2 2 0 00-2 2',
  terminal:'M5 7.5l4.5 4.5L5 16.5M12.5 17H19',
  eye:'M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  eyeOff:'M4 4l16 16M9.9 5.2A9.9 9.9 0 0112 5c6 0 9.5 6 9.5 6a17 17 0 01-3.3 3.8M6.3 8.2A17 17 0 002.5 11S6 17 12 17c1 0 1.9-.2 2.8-.5',
  menu:'M4 7h16M4 12h16M4 17h16',
  external:'M14 4h6v6M20 4l-8.5 8.5M18 13.5V20H4V6h6.5',
  users:'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M17 4.7a3.5 3.5 0 010 6.6M18.5 14.8c1.9.7 3 2.2 3 4.2',
  database:'M4 6c0 1.7 3.6 3 8 3s8-1.3 8-3-3.6-3-8-3-8 1.3-8 3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  billing:'M3 7h18v11H3zM3 11h18M6.5 15h3',
  logout:'M14 4H5v16h9M18.5 12H10M15.5 8.5L19 12l-3.5 3.5',
  drag:'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  pin:'M12 21v-6M8 4h8l-1 6 3 3H6l3-3z',
  bolt:'M13 3L5 14h6l-1 7 8-11h-6z',
  archive:'M3 5h18v4H3zM5 9v11h14V9M10 13h4'
};

export function Icon({ name = 'file', size = 16, strokeWidth = 1.6, className = '', title, ...rest }) {
  const d = P[name] || P.file;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}
      focusable="false" {...rest}>
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}

export const iconNames = Object.keys(P);
