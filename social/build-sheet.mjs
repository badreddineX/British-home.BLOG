// Turns social/queue.json into social/queue-sheet.csv — import into the Google
// Sheet that Make.com reads from.
// Columns: order | slug | image_url | caption | posted
//   node social/build-sheet.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const RAW_BASE = 'https://raw.githubusercontent.com/badreddineX/British-home.BLOG/main/';

const queue = JSON.parse(readFileSync(resolve(here, 'queue.json'), 'utf8'));
const csvField = (s) => `"${String(s).replace(/"/g, '""')}"`;
const rows = [
  ['order', 'slug', 'image_url', 'caption', 'posted'].join(','),
  ...queue.map((q, i) =>
    [i + 1, csvField(q.slug), csvField(RAW_BASE + encodeURI(q.image)), csvField(q.igCaption), ''].join(',')
  ),
];

writeFileSync(resolve(here, 'queue-sheet.csv'), rows.join('\n') + '\n');
console.log(`social/queue-sheet.csv — ${queue.length} rows`);
