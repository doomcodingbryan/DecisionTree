// Data-integrity check for the transition graph. Run: node scripts/check-transitions.mjs
// (Node >=23 strips the TS types on import.) Fails loudly if any transition key or
// `to` isn't a real move name, which is the one way this data silently rots.
import assert from 'node:assert/strict';
import {
  ALIASES,
  ALL_MOVES,
  GI_ONLY,
  MOVE_LIBRARY,
  MOVE_CATEGORY,
  MOVE_META,
  edgeLabelFor,
  gearTags,
  moveMatches,
} from '../src/data/moves.ts';
import {
  TRANSITIONS,
  CATEGORY_FALLBACK,
  getSuggestions,
} from '../src/data/transitions.ts';

const moves = new Set(ALL_MOVES);
assert.equal(moves.size, ALL_MOVES.length, 'ALL_MOVES has duplicates');

const bad = [];
for (const [from, list] of Object.entries(TRANSITIONS)) {
  if (!moves.has(from)) bad.push(`unknown key: "${from}"`);
  for (const s of list) if (!moves.has(s.to)) bad.push(`"${from}" -> unknown "${s.to}"`);
}
assert.equal(bad.length, 0, `transitions reference unknown moves:\n  ${bad.join('\n  ')}`);

// category fallback references real categories and moves
for (const [category, list] of Object.entries(CATEGORY_FALLBACK)) {
  assert.ok(category in MOVE_LIBRARY, `fallback category "${category}" unknown`);
  for (const to of list) assert.ok(moves.has(to), `fallback -> unknown "${to}"`);
}

// helper behaves
const cg = getSuggestions('Closed Guard');
assert.ok(cg.some((s) => s.to === 'Armbar'), 'Closed Guard should suggest Armbar');
assert.equal(getSuggestions('Totally Not A Move').length, 0, 'unknown label -> no suggestions');

// a library move without an authored entry gets its category fallback
const uncovered = ALL_MOVES.find((m) => !TRANSITIONS[m]);
if (uncovered) {
  const fb = getSuggestions(uncovered);
  assert.ok(fb.length > 0, `"${uncovered}" should fall back to category suggestions`);
  assert.ok(fb.every((s) => s.to !== uncovered), 'fallback must not suggest the move itself');
}

// edge auto-labels come from the target's category
assert.equal(MOVE_CATEGORY['Double Leg'], 'Takedowns');
assert.equal(edgeLabelFor('Double Leg'), 'takedown');
assert.equal(edgeLabelFor('Mount'), undefined, 'positions stay unlabeled');
assert.equal(edgeLabelFor('Totally Not A Move'), undefined);

// search aliases: every key canonical (a typo would silently never match)
for (const key of Object.keys(ALIASES))
  assert.ok(moves.has(key), `alias key "${key}" isn't a canonical move`);

// move metadata: every MOVE_META and GI_ONLY key is a canonical move
for (const key of Object.keys(MOVE_META))
  assert.ok(moves.has(key), `MOVE_META key "${key}" isn't a canonical move`);
for (const key of GI_ONLY)
  assert.ok(moves.has(key), `GI_ONLY entry "${key}" isn't a canonical move`);
// gear tags: gi-only moves get just Gi, everything else both
assert.deepEqual(gearTags('Spider Guard'), ['Gi'], 'gi-only move is Gi only');
assert.deepEqual(gearTags('Heel Hook'), ['Gi', 'No-Gi'], 'default is both');
// instructor/tag words are searchable
assert.ok(moveMatches('Heel Hook', 'danaher'), 'search finds by instructor');
assert.ok(moveMatches('Berimbolo', 'back take'), 'search finds by position tag');
// and the matcher finds moves by slang, category, and name
assert.ok(moveMatches('Rear Naked Choke', 'rnc'), '"rnc" should find the RNC');
assert.ok(moveMatches('Bridge and Roll (Upa)', 'upa'), '"upa" should find the escape');
assert.ok(moveMatches('Scissor Sweep', 'sweeps'), 'category words should match');
assert.ok(!moveMatches('Armbar', 'choke'), 'no false positives');

console.log(
  `OK: ${ALL_MOVES.length} moves, ${Object.keys(TRANSITIONS).length} transition keys, ${Object.keys(ALIASES).length} alias keys, all references valid`,
);
