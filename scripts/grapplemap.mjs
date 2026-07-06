// Dev-only. NOT bundled into the app. Provenance + authoring aid for the move
// library and transition graph, sourced from GrappleMap (public domain).
//
//   curl -s https://raw.githubusercontent.com/Eelis/GrappleMap/master/GrappleMap.txt -o /tmp/GrappleMap.txt
//   node scripts/grapplemap.mjs /tmp/GrappleMap.txt
//
// GrappleMap.txt format, per entry: a name line, then metadata lines
// (tags:/ref:/properties:/...), then indented 4-space pose-blob lines
// (4 lines = one pose; a position = 4 blob lines, a transition = >=8).
// We only use the tags — the graph's directed edges live in the 3D poses
// (matched by geometric proximity), which we deliberately do not decode.
import { readFileSync } from 'node:fs';

const META = /^(tags|ref|properties|line_numbers|permalink):/;
// tags that describe pose detail / grips, not a named move or position
const POSE = new Set([
  'bottom_supine','top_kneeling','top_underhook','bottom_underhook','top_posture_broken',
  'bottom_seated','top_on_side','bottom_turned_in','bottom_turned_away','bottom_overhook',
  'top_overhook','crossface','frame','collar_tie','wrist_control','seatbelt','knee_pin',
  'fetal','footsies','bottom_double_unders','top_double_unders','two_on_one','whizzer',
  'lockdown','underhook','overhook','head_control','posture','grip','bottom_kneeling',
  'bottom_post_elbow','top_post_hand','bottom_post_hand','top_supine','bottom_on_side',
  'shoulder_pin','wrist_pin','stacked','vice_grip','grapevine','lat_trap','hip_pin',
  'top_arm_pin','bottom_open_elbow','bottom_inverted','head_grind','leg_ride','stub',
]);

function parse(txt) {
  const entries = [];
  let cur = null;
  const flush = () => { if (cur && cur.name) entries.push(cur); cur = null; };
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (line.startsWith('    ')) { if (cur) cur.blob.push(line.trim()); continue; }
    if (line.trim() === '') { flush(); continue; }
    if (META.test(line)) {
      if (cur) { const k = line.match(/^(\w+):/)[1]; cur.meta[k] = line.slice(k.length + 1).trim(); }
      continue;
    }
    flush();
    cur = { name: line, meta: {}, blob: [] };
  }
  flush();
  return entries;
}

const entries = parse(readFileSync(process.argv[2] || '/tmp/GrappleMap.txt', 'utf8'));
const positions = entries.filter((e) => e.blob.length === 4);
const transitions = entries.filter((e) => e.blob.length >= 8 && e.blob.length % 4 === 0);
console.log(`entries:${entries.length} positions:${positions.length} transitions:${transitions.length}`);

const freq = new Map();
for (const e of entries)
  for (const t of (e.meta.tags || '').split(/\s+/).filter(Boolean))
    freq.set(t, (freq.get(t) || 0) + 1);

const moveTags = [...freq].filter(([t]) => !POSE.has(t)).sort((a, b) => b[1] - a[1]);
console.log('\n=== move/position tags (library vocabulary) ===');
console.log(moveTags.map(([t, c]) => `${t}:${c}`).join('  '));

// candidate edges: move-ish tags that co-occur inside a transition entry
const co = new Map();
for (const e of transitions) {
  const tags = [...new Set((e.meta.tags || '').split(/\s+/).filter((t) => t && !POSE.has(t)))];
  for (let i = 0; i < tags.length; i++)
    for (let j = i + 1; j < tags.length; j++)
      co.set([tags[i], tags[j]].sort().join(' + '), (co.get([tags[i], tags[j]].sort().join(' + ')) || 0) + 1);
}
console.log('\n=== candidate edges (tag co-occurrence in transitions) ===');
console.log([...co].sort((a, b) => b[1] - a[1]).slice(0, 60).map(([k, c]) => `${k} (${c})`).join('\n'));
