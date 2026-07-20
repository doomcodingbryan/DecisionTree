// Checks the battle heuristic. Run: node scripts/battle-check.mjs
// (Node >=23 strips the TS types on import.)
import assert from 'node:assert/strict';
import { analyzeFlow, coachingTips, playLine, simulateMatch } from '../src/battle.ts';

const N = (id, label) => ({ id, type: 'move', position: { x: 0, y: 0 }, data: { label } });
const E = (s, t) => ({ id: `${s}-${t}`, source: s, target: t, type: 'transition', data: {} });

// Closed Guard -> Armbar (a submission)
const attacker = { nodes: [N('a', 'Closed Guard'), N('b', 'Armbar')], edges: [E('a', 'b')] };
const stats = analyzeFlow(attacker);
assert.equal(stats.submissions, 1, 'Armbar is a submission');
assert.equal(stats.maxDepth, 2, 'two-move chain is depth 2');
assert.equal(stats.categories, 2, 'a position + a submission = 2 categories');
assert.equal(stats.power, 12, 'power = 1*3 + 2*2 + 1 link + 2*2 categories');

// a lone position with no finishes
const passive = { nodes: [N('s', 'Standing')], edges: [] };
assert.equal(analyzeFlow(passive).submissions, 0);

// the attacker always reaches its submission; the passive plan never finishes
const line = playLine(attacker, () => 0);
assert.deepEqual(line.path, ['Closed Guard', 'Armbar']);
assert.equal(line.finishAt, 1, 'submission reached on step 1');
assert.equal(playLine(passive, () => 0).finishAt, null);

// so the attacker sweeps the match
const m = simulateMatch(attacker, passive, () => 0.5, 5);
assert.equal(m.winner, 'you');
assert.equal(m.youWins, 5, 'submission threat beats a plan with none, every round');

// coaching: the passive plan gets told to add a finish; capped at 3 tips
const tips = coachingTips(analyzeFlow(passive), stats);
assert.ok(tips[0].includes('No submissions'), 'first tip targets the missing finish');
assert.ok(tips.length <= 3, 'at most 3 tips');
// a branched, finishing plan matched against itself has nothing to fix
const branched = {
  nodes: [N('a', 'Closed Guard'), N('b', 'Armbar'), N('c', 'Triangle Choke')],
  edges: [E('a', 'b'), E('a', 'c')],
};
const bs = analyzeFlow(branched);
assert.deepEqual(coachingTips(bs, bs), [], 'no tips when matching the rival');

console.log('OK: battle heuristic rates flows, picks a winner, and coaches');
