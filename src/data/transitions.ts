// Deterministic transition graph powering "suggested next moves".
// Keyed by move name; each entry lists likely next moves. Every key and every
// `to` MUST be an exact name in ALL_MOVES (moves.ts) — enforced by transitions.test.ts.
//
// Hand-authored for the common core, grounded in GrappleMap tag co-occurrence
// (scripts/grapplemap.mjs). `weight` is optional for now: order = default rank.
// Phase 2 (Reddit/NLP) will populate weights with real-world popularity.
// .ts extension so scripts/check-transitions.mjs can run this under plain node
import { MOVE_CATEGORY } from './moves.ts';

export type Suggestion = { to: string; weight?: number; note?: string };

export const TRANSITIONS: Record<string, Suggestion[]> = {
  // --- neutral / standing ---
  Standing: [
    { to: 'Double Leg' }, { to: 'Single Leg' }, { to: 'Ankle Pick' },
    { to: 'Arm Drag' }, { to: 'Snap Down' }, { to: 'Osoto Gari' },
    { to: 'Uchi Mata' }, { to: 'Seoi Nage' }, { to: 'Guard Pull' },
    { to: 'Body Lock Takedown' },
  ],

  // --- guards (bottom) ---
  'Closed Guard': [
    { to: 'Armbar' }, { to: 'Triangle Choke' }, { to: 'Omoplata' },
    { to: 'Hip Bump Sweep' }, { to: 'Scissor Sweep' }, { to: 'Flower Sweep' },
    { to: 'Cross Collar Choke' }, { to: 'Kimura' }, { to: 'Guillotine' },
  ],
  'Open Guard': [
    { to: 'De La Riva' }, { to: 'Spider Guard' }, { to: 'Butterfly Guard' },
    { to: 'X-Guard' }, { to: 'Lasso Guard' }, { to: 'Tomoe Nage' },
  ],
  'Half Guard': [
    { to: 'Old School Sweep' }, { to: 'Electric Chair' }, { to: 'Dogfight' },
    { to: 'Kimura' }, { to: 'Back Control' }, { to: 'Deep Half Guard' },
    { to: 'Knee Shield' },
  ],
  'Deep Half Guard': [
    { to: 'Waiter Sweep' }, { to: 'Back Control' }, { to: 'Dogfight' },
  ],
  'Butterfly Guard': [
    { to: 'Butterfly Sweep' }, { to: 'Hook Sweep' }, { to: 'Elevator Sweep' },
    { to: 'X-Guard' }, { to: 'Arm Drag' }, { to: 'Guillotine' },
  ],
  'De La Riva': [
    { to: 'Single Leg X' }, { to: 'X-Guard' }, { to: 'Back Control' },
    { to: 'Ankle Pick' },
  ],
  'Spider Guard': [
    { to: 'Triangle Choke' }, { to: 'Omoplata' }, { to: 'Lasso Guard' },
    { to: 'Balloon Sweep' }, { to: 'Sickle Sweep' },
  ],
  'Lasso Guard': [
    { to: 'Omoplata' }, { to: 'Triangle Choke' }, { to: 'Pendulum Sweep' },
  ],
  'X-Guard': [
    { to: 'X-Guard Sweep' }, { to: 'Single Leg' }, { to: 'Technical Standup' },
  ],
  'Single Leg X': [
    { to: 'Straight Ankle Lock' }, { to: 'Heel Hook' }, { to: 'X-Guard' },
    { to: 'Single Leg' },
  ],
  'Z-Guard': [
    { to: 'Knee Shield' }, { to: 'Back Control' }, { to: 'Kimura' },
  ],
  'Rubber Guard': [
    { to: 'Gogoplata' }, { to: 'Omoplata' }, { to: 'Triangle Choke' },
  ],

  // --- top / dominant ---
  Mount: [
    { to: 'Armbar' }, { to: 'Americana' }, { to: 'Cross Collar Choke' },
    { to: 'Ezekiel Choke' }, { to: 'S-Mount' }, { to: 'Technical Mount' },
    { to: 'Back Control' },
  ],
  'S-Mount': [{ to: 'Armbar' }, { to: 'Cross Collar Choke' }],
  'Technical Mount': [{ to: 'Back Control' }, { to: 'Armbar' }],
  'Side Control': [
    { to: 'Mount' }, { to: 'Knee on Belly' }, { to: 'North-South' },
    { to: 'Kimura' }, { to: 'Americana' }, { to: 'Arm Triangle' },
    { to: 'Back Control' },
  ],
  'Knee on Belly': [
    { to: 'Mount' }, { to: 'Armbar' }, { to: 'Baseball Bat Choke' },
  ],
  'North-South': [
    { to: 'North-South Choke' }, { to: 'Kimura' }, { to: 'Mount' },
  ],
  'Back Control': [
    { to: 'Rear Naked Choke' }, { to: 'Bow and Arrow Choke' },
    { to: 'Armbar' }, { to: 'Ezekiel Choke' },
  ],
  'Back Mount': [{ to: 'Rear Naked Choke' }, { to: 'Bow and Arrow Choke' }],
  Turtle: [
    { to: 'Back Control' }, { to: 'Clock Choke' }, { to: 'Crucifix' },
    { to: 'Anaconda Choke' }, { to: "D'Arce Choke" }, { to: 'Front Headlock' },
  ],
  'Front Headlock': [
    { to: 'Guillotine' }, { to: "D'Arce Choke" }, { to: 'Anaconda Choke' },
    { to: 'Snap Down' }, { to: 'Back Control' },
  ],
  Crucifix: [{ to: 'Rear Naked Choke' }, { to: 'Bow and Arrow Choke' }],
  'Combat Base': [{ to: 'Knee Cut' }, { to: 'Toreando Pass' }, { to: 'Stack Pass' }],
  Dogfight: [{ to: 'Old School Sweep' }, { to: 'Back Control' }, { to: 'Single Leg' }],
  'Twister Side Control': [{ to: 'Twister' }, { to: 'Back Control' }],

  // --- leg entanglements ---
  '50/50': [{ to: 'Heel Hook' }, { to: 'Inside Heel Hook' }, { to: 'Straight Ankle Lock' }],
  'Ashi Garami': [
    { to: 'Straight Ankle Lock' }, { to: 'Heel Hook' },
    { to: 'Saddle (Inside Sankaku)' }, { to: 'Outside Ashi' },
  ],
  'Saddle (Inside Sankaku)': [{ to: 'Inside Heel Hook' }, { to: 'Kneebar' }],
  'Outside Ashi': [{ to: 'Heel Hook' }, { to: 'Straight Ankle Lock' }],

  // --- passes -> top control ---
  'Toreando Pass': [{ to: 'Side Control' }, { to: 'Knee on Belly' }],
  'Knee Cut': [{ to: 'Side Control' }, { to: 'Half Guard' }],
  'Over-Under Pass': [{ to: 'Side Control' }],
  'Double Under Pass': [{ to: 'Side Control' }, { to: 'Stack Pass' }],
  'Leg Drag': [{ to: 'Side Control' }, { to: 'Back Control' }],
  'Smash Pass': [{ to: 'Side Control' }],
  'Body Lock Pass': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Stack Pass': [{ to: 'Side Control' }],
  'X-Pass': [{ to: 'Side Control' }],
  'Headquarters (HQ)': [{ to: 'Knee Cut' }, { to: 'Leg Drag' }, { to: 'Backstep' }],

  // --- takedowns -> top / control ---
  'Double Leg': [{ to: 'Side Control' }, { to: 'Combat Base' }],
  'Single Leg': [{ to: 'Side Control' }, { to: 'Ankle Pick' }],
  'Arm Drag': [{ to: 'Back Control' }, { to: 'Single Leg' }, { to: 'Two-on-One' }],
  'Snap Down': [{ to: 'Front Headlock' }, { to: 'Turtle' }],
  'Osoto Gari': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Body Lock Takedown': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Guard Pull': [{ to: 'Closed Guard' }, { to: 'Open Guard' }, { to: 'Butterfly Guard' }],
  'Duck Under': [{ to: 'Back Control' }],
  'Two-on-One': [{ to: 'Arm Drag' }, { to: 'Single Leg' }],

  // --- sweeps -> top ---
  'Scissor Sweep': [{ to: 'Mount' }, { to: 'Side Control' }],
  'Hip Bump Sweep': [{ to: 'Mount' }],
  'Flower Sweep': [{ to: 'Mount' }, { to: 'Armbar' }],
  'Butterfly Sweep': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Elevator Sweep': [{ to: 'Mount' }],
  'Old School Sweep': [{ to: 'Side Control' }, { to: 'Dogfight' }],
  'X-Guard Sweep': [{ to: 'Standing' }, { to: 'Single Leg' }],
  'Pendulum Sweep': [{ to: 'Mount' }, { to: 'Armbar' }],
  'Tomoe Nage': [{ to: 'Mount' }, { to: 'Side Control' }],

  // --- submission chains ---
  Armbar: [{ to: 'Triangle Choke' }, { to: 'Omoplata' }],
  'Triangle Choke': [{ to: 'Armbar' }, { to: 'Omoplata' }],
  Omoplata: [{ to: 'Triangle Choke' }, { to: 'Armbar' }],
  Kimura: [{ to: 'Guillotine' }, { to: 'Armbar' }, { to: 'Back Control' }],
  Guillotine: [{ to: 'Back Control' }, { to: 'Guard Pull' }],
  'Heel Hook': [{ to: '50/50' }, { to: 'Saddle (Inside Sankaku)' }],

  // --- escapes -> recovered position ---
  'Bridge and Roll (Upa)': [{ to: 'Closed Guard' }],
  'Elbow Escape (Shrimp)': [{ to: 'Half Guard' }, { to: 'Closed Guard' }],
  'Back Escape': [{ to: 'Turtle' }, { to: 'Half Guard' }],
  'Mount Escape': [{ to: 'Half Guard' }, { to: 'Closed Guard' }, { to: 'Bridge and Roll (Upa)' }],
  'Side Control Escape': [{ to: 'Turtle' }, { to: 'Closed Guard' }, { to: 'Half Guard' }],
  'Granby Roll': [{ to: 'Turtle' }, { to: 'Open Guard' }],
};

// Generic follow-ups for moves without an authored entry, keyed by the move's
// category: passes/sweeps/takedowns land on top, a failed submission retreats
// to control, escapes recover guard or the feet. Every name must exist in
// ALL_MOVES — enforced by scripts/check-transitions.mjs.
export const CATEGORY_FALLBACK: Record<string, string[]> = {
  Positions: ['Mount', 'Side Control', 'Back Control'],
  Guards: ['Triangle Choke', 'Armbar', 'Kimura', 'Scissor Sweep'],
  Passes: ['Side Control', 'Mount', 'Knee on Belly'],
  Sweeps: ['Mount', 'Side Control'],
  Takedowns: ['Side Control', 'Half Guard', 'Front Headlock'],
  Submissions: ['Back Control', 'Mount'],
  Escapes: ['Closed Guard', 'Half Guard', 'Standing'],
};

// Recommended next moves for a given label, ranked (weight desc; ties keep
// authored order). Unauthored moves fall back to category-generic follow-ups.
export function getSuggestions(label: string): Suggestion[] {
  const authored = TRANSITIONS[label];
  if (authored?.length)
    return authored.slice().sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  return (CATEGORY_FALLBACK[MOVE_CATEGORY[label] ?? ''] ?? [])
    .filter((to) => to !== label)
    .map((to) => ({ to }));
}
