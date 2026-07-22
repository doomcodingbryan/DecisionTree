import { MOVE_CATEGORY } from './data/moves.ts';
import type { MoveNode, TransitionEdge } from './store';

// ponytail: "who would win" is inherently fuzzy — this is a transparent
// heuristic over the flow's shape, not a real grappling model. The power
// weights below are the tuning knob.
export type Flow = { nodes: MoveNode[]; edges: TransitionEdge[] };

export type FlowStats = {
  moves: number;
  links: number;
  submissions: number; // nodes in the Submissions category = finishing threats
  maxDepth: number; // longest chain = how developed the game is
  breadth: number; // biggest branch = adaptability
  categories: number; // distinct move types = well-roundedness
  power: number;
};

const isSubmission = (label: string) => MOVE_CATEGORY[label] === 'Submissions';

const childMap = (flow: Flow) => {
  const out = new Map<string, string[]>();
  for (const n of flow.nodes) out.set(n.id, []);
  for (const e of flow.edges) out.get(e.source)?.push(e.target);
  return out;
};

// start positions: nodes nothing transitions into. Fall back to every node
// (a fully cyclic graph has no clean root).
const rootsOf = (flow: Flow): string[] => {
  const hasIncoming = new Set(flow.edges.map((e) => e.target));
  const roots = flow.nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
  return roots.length ? roots : flow.nodes.map((n) => n.id);
};

export function analyzeFlow(flow: Flow): FlowStats {
  const out = childMap(flow);
  const submissions = flow.nodes.filter((n) => isSubmission(n.data.label)).length;
  const breadth = flow.nodes.reduce(
    (m, n) => Math.max(m, out.get(n.id)?.length ?? 0),
    0,
  );
  const categories = new Set(
    flow.nodes.map((n) => MOVE_CATEGORY[n.data.label]).filter(Boolean),
  ).size;

  const depthFrom = (id: string, seen: Set<string>): number => {
    if (seen.has(id)) return 0; // cycle guard
    seen.add(id);
    let best = 0;
    for (const k of out.get(id) ?? []) best = Math.max(best, depthFrom(k, seen));
    seen.delete(id);
    return 1 + best;
  };
  let maxDepth = 0;
  for (const r of rootsOf(flow)) maxDepth = Math.max(maxDepth, depthFrom(r, new Set()));

  const power = submissions * 3 + maxDepth * 2 + flow.edges.length + categories * 2;
  return {
    moves: flow.nodes.length,
    links: flow.edges.length,
    submissions,
    maxDepth,
    breadth,
    categories,
    power,
  };
}

// What to fix, most impactful first — your plan's shape vs the rival's.
// ponytail: threshold rules over FlowStats, not real game analysis.
export function coachingTips(you: FlowStats, opp: FlowStats): string[] {
  const tips: string[] = [];
  if (you.submissions === 0)
    tips.push(
      'No submissions: every line ends in a stall. Chain a finish onto your strongest position.',
    );
  else if (you.submissions < opp.submissions)
    tips.push(
      `Fewer finishing threats than the rival (${you.submissions} vs ${opp.submissions}). Add another submission at the end of a chain.`,
    );
  if (you.moves > 1 && you.links < you.moves - 1)
    tips.push(
      'Some moves aren’t linked to anything: connect them into a chain or they never come up in a scramble.',
    );
  if (you.maxDepth < opp.maxDepth)
    tips.push(
      `Your longest chain is ${you.maxDepth} ${you.maxDepth === 1 ? 'move' : 'moves'} to the rival’s ${opp.maxDepth}. Deeper chains win scrambles: extend a line toward a finish.`,
    );
  if (you.moves > 1 && you.breadth < 2)
    tips.push(
      'Every move has at most one follow-up. Give your key positions a second option so a defended move isn’t a dead end.',
    );
  if (you.categories < opp.categories)
    tips.push(
      `The rival mixes ${opp.categories} move types to your ${you.categories}. Add a takedown, sweep, or escape to round out your game.`,
    );
  return tips.slice(0, 3);
}

export type Rng = () => number;

// One simulated scramble: random-walk from a start until a submission (finish),
// a dead end, or the step cap. Returns the moves taken and where it finished.
export function playLine(
  flow: Flow,
  rng: Rng,
  maxSteps = 10,
): { path: string[]; finishAt: number | null } {
  const byId = new Map(flow.nodes.map((n) => [n.id, n] as const));
  const out = childMap(flow);
  const roots = rootsOf(flow);
  if (!roots.length) return { path: [], finishAt: null };
  let cur: string | undefined = roots[Math.floor(rng() * roots.length)];
  const path: string[] = [];
  const seen = new Set<string>();
  for (let step = 0; step < maxSteps && cur; step++) {
    const node = byId.get(cur);
    if (!node || seen.has(cur)) break;
    seen.add(cur);
    path.push(node.data.label);
    if (isSubmission(node.data.label)) return { path, finishAt: step };
    const kids: string[] = out.get(cur) ?? [];
    if (!kids.length) break;
    cur = kids[Math.floor(rng() * kids.length)];
  }
  return { path, finishAt: null };
}

export type Side = 'you' | 'opp' | 'draw';
export type Round = { you: string[]; opp: string[]; winner: Side; reason: string };
export type Match = {
  rounds: Round[];
  youWins: number;
  oppWins: number;
  winner: Side;
};

export function simulateMatch(
  you: Flow,
  opp: Flow,
  rng: Rng = Math.random,
  rounds = 5,
): Match {
  const yp = analyzeFlow(you).power;
  const op = analyzeFlow(opp).power;
  const results: Round[] = [];
  let youWins = 0;
  let oppWins = 0;
  for (let i = 0; i < rounds; i++) {
    const y = playLine(you, rng);
    const o = playLine(opp, rng);
    let winner: Side;
    let reason: string;
    const yFin = y.finishAt !== null;
    const oFin = o.finishAt !== null;
    if (yFin && (!oFin || (y.finishAt as number) < (o.finishAt as number))) {
      winner = 'you';
      reason = `${y.path[y.path.length - 1]} finish`;
    } else if (oFin && (!yFin || (o.finishAt as number) < (y.finishAt as number))) {
      winner = 'opp';
      reason = `${o.path[o.path.length - 1]} finish`;
    } else if (yp !== op) {
      // no clean finish (or a simultaneous one): stronger game controls
      winner = yp > op ? 'you' : 'opp';
      reason = 'controlled the scramble';
    } else {
      winner = 'draw';
      reason = 'stalemate';
    }
    if (winner === 'you') youWins++;
    else if (winner === 'opp') oppWins++;
    results.push({ you: y.path, opp: o.path, winner, reason });
  }
  const winner: Side = youWins > oppWins ? 'you' : oppWins > youWins ? 'opp' : 'draw';
  return { rounds: results, youWins, oppWins, winner };
}
