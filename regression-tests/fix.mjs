import fs from 'node:fs';
const p = 'tests/dashboard.spec.js';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
lines[16] = String.raw`const escapeRe = str => str.replace(/[.*+?^${}()|[\]\]/g, '\$&');`;
fs.writeFileSync(p, lines.join('\n'));
