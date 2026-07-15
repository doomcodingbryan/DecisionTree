// Checks spliceBetween: inserting a node between a parent and its child must
// rewire P→C into P→N→C, preserving the transition into C. Run: node scripts/insert-check.mjs
// (Node >=23 strips the TS types on import.)
import assert from 'node:assert/strict';
import { spliceBetween } from '../src/insert.ts';

// P → C, where the edge into C carries a 'pass' label
const edges = [
  {
    id: 'e1',
    source: 'P',
    sourceHandle: 'bottom',
    target: 'C',
    targetHandle: 'top',
    type: 'transition',
    data: { label: 'pass' },
  },
];

const out = spliceBetween(edges, 'P', 'C', 'N', 'Armbar', 'e2');

assert.equal(out.length, 2, 'one edge in, two out (P→N and N→C)');
const pn = out.find((e) => e.source === 'P' && e.target === 'N');
const nc = out.find((e) => e.source === 'N' && e.target === 'C');
assert.ok(pn, 'parent should point at the new node');
assert.ok(nc, 'new node should point at the old child');
assert.equal(nc.data.label, 'pass', 'transition into the old child is preserved');
assert.equal(pn.data.label, 'submit', 'new edge auto-labels from Armbar (a submission)');
assert.ok(
  !out.some((e) => e.source === 'P' && e.target === 'C'),
  'the direct P→C edge must be gone',
);
// unrelated edges are left untouched
const extra = spliceBetween(
  [...edges, { id: 'x', source: 'Z', target: 'Y', type: 'transition', data: {} }],
  'P',
  'C',
  'N',
  'Armbar',
  'e2',
);
assert.ok(extra.some((e) => e.id === 'x' && e.source === 'Z' && e.target === 'Y'));

console.log('OK: insert splices a node between parent and child');
