// Data-integrity check for the transition graph. Run: node scripts/check-transitions.mjs
// (Node >=23 strips the TS types on import.) Fails loudly if any transition key or
// `to` isn't a real move name, which is the one way this data silently rots.
import assert from 'node:assert/strict';
import { ALL_MOVES } from '../src/data/moves.ts';
import { TRANSITIONS, getSuggestions } from '../src/data/transitions.ts';

const moves = new Set(ALL_MOVES);
assert.equal(moves.size, ALL_MOVES.length, 'ALL_MOVES has duplicates');

const bad = [];
for (const [from, list] of Object.entries(TRANSITIONS)) {
  if (!moves.has(from)) bad.push(`unknown key: "${from}"`);
  for (const s of list) if (!moves.has(s.to)) bad.push(`"${from}" -> unknown "${s.to}"`);
}
assert.equal(bad.length, 0, `transitions reference unknown moves:\n  ${bad.join('\n  ')}`);

// helper behaves
const cg = getSuggestions('Closed Guard');
assert.ok(cg.some((s) => s.to === 'Armbar'), 'Closed Guard should suggest Armbar');
assert.equal(getSuggestions('Totally Not A Move').length, 0, 'unknown label -> no suggestions');

console.log(
  `OK: ${ALL_MOVES.length} moves, ${Object.keys(TRANSITIONS).length} transition keys, all references valid`,
);
