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

  // ============================================================
  // expanded coverage — realistic follow-ups so more moves get a
  // curated "next" instead of the category fallback.
  // ============================================================

  // --- positions ---
  'Quarter Guard': [{ to: 'Half Guard' }, { to: 'Back Control' }, { to: 'Dogfight' }],
  'Reverse Half Guard': [{ to: 'Back Control' }, { to: 'Kneebar' }],
  'Low Mount': [{ to: 'Americana' }, { to: 'Ezekiel Choke' }, { to: 'High Mount' }],
  'High Mount': [{ to: 'Armbar' }, { to: 'Cross Collar Choke' }, { to: 'Gift Wrap' }],
  'Three-Quarter Mount': [{ to: 'Mount' }, { to: 'Back Control' }],
  'Reverse Side Control': [
    { to: 'Twister Side Control' }, { to: 'Back Control' }, { to: 'Kneebar' },
  ],
  Truck: [{ to: 'Twister' }, { to: 'Backside 50/50' }, { to: 'Inside Heel Hook' }],
  Sprawl: [{ to: 'Front Headlock' }, { to: 'Guillotine' }, { to: 'Turtle' }],
  'Leg Knot': [{ to: 'Heel Hook' }, { to: 'Inside Heel Hook' }],
  Spiderweb: [{ to: 'Armbar' }, { to: 'Triangle Choke' }, { to: 'Omoplata' }],
  'Crab Ride': [{ to: 'Back Control' }, { to: 'Truck' }],
  'Scarf Hold (Kesa Gatame)': [
    { to: 'Americana' }, { to: 'Armbar' }, { to: 'Mount' },
  ],
  'Gift Wrap': [{ to: 'Back Control' }, { to: 'Rear Naked Choke' }],
  'Backside 50/50': [{ to: 'Inside Heel Hook' }, { to: 'Heel Hook' }],
  'Reaping Position': [{ to: 'Inside Heel Hook' }, { to: 'Heel Hook' }],
  'Body Triangle': [
    { to: 'Rear Naked Choke' }, { to: 'Bow and Arrow Choke' }, { to: 'Armbar' },
  ],

  // --- guards (bottom) ---
  'Reverse De La Riva': [
    { to: 'Back Control' }, { to: 'Berimbolo' }, { to: 'Single Leg X' },
    { to: 'Kneebar' },
  ],
  'K-Guard': [
    { to: 'Ashi Garami' }, { to: 'Backside 50/50' }, { to: 'Heel Hook' },
    { to: 'Back Control' },
  ],
  'Worm Guard': [{ to: 'Balloon Sweep' }, { to: 'Back Control' }, { to: 'Omoplata' }],
  'Lapel Guard': [{ to: 'Balloon Sweep' }, { to: 'Back Control' }, { to: 'Omoplata' }],
  'Williams Guard': [{ to: 'Triangle Choke' }, { to: 'Omoplata' }],
  'Collar Sleeve': [
    { to: 'Triangle Choke' }, { to: 'Omoplata' }, { to: 'Balloon Sweep' },
  ],
  'Sit-Up Guard': [
    { to: 'Arm Drag' }, { to: 'Hip Bump Sweep' }, { to: 'Back Control' },
    { to: 'Kimura' },
  ],
  'Shin-to-Shin': [
    { to: 'Single Leg X' }, { to: 'X-Guard' }, { to: 'Ashi Garami' },
    { to: 'Ankle Pick' },
  ],
  'Waiter Guard': [{ to: 'Waiter Sweep' }, { to: 'Back Control' }],
  'Octopus Guard': [{ to: 'Back Control' }, { to: 'Arm Drag' }],
  'Knee Shield': [
    { to: 'Old School Sweep' }, { to: 'Back Control' }, { to: 'Kimura' },
    { to: 'Deep Half Guard' },
  ],
  'Inverted Guard': [{ to: 'Berimbolo' }, { to: 'Omoplata' }, { to: 'Back Control' }],
  'Matrix Guard': [{ to: 'Berimbolo' }, { to: 'Back Control' }],
  'Squid Guard': [{ to: 'Omoplata' }, { to: 'Back Control' }],
  'Reverse X-Guard': [
    { to: 'X-Guard Sweep' }, { to: 'Single Leg' }, { to: 'Heel Hook' },
  ],
  '93 Guard': [{ to: 'Omoplata' }, { to: 'Triangle Choke' }, { to: 'Back Control' }],
  'Gubber Guard': [{ to: 'Omoplata' }, { to: 'Triangle Choke' }],
  'Half Butterfly Guard': [
    { to: 'Butterfly Sweep' }, { to: 'Hook Sweep' }, { to: 'Back Control' },
    { to: 'X-Guard' },
  ],
  'One-Legged X': [
    { to: 'X-Guard' }, { to: 'Straight Ankle Lock' }, { to: 'Technical Standup' },
    { to: 'Single Leg' },
  ],
  'Falcon Guard': [{ to: 'Balloon Sweep' }, { to: 'Back Control' }],
  'Tornado Guard': [{ to: 'Tornado Sweep' }, { to: 'X-Guard' }],

  // --- passes -> top control ---
  'Long Step': [{ to: 'Side Control' }, { to: 'Back Control' }],
  'Folding Pass': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Cartwheel Pass': [{ to: 'Side Control' }],
  'Leg Weave': [{ to: 'Side Control' }],
  Backstep: [{ to: 'Side Control' }, { to: 'Leg Drag' }, { to: 'Back Control' }],
  'Float Pass': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Bullfighter Pass': [{ to: 'Side Control' }, { to: 'Knee on Belly' }],
  'Standing Guard Break': [
    { to: 'Knee Cut' }, { to: 'Toreando Pass' }, { to: 'Stack Pass' },
  ],
  'Kneeling Guard Break': [{ to: 'Knee Cut' }, { to: 'Stack Pass' }],
  'Tripod Pass': [{ to: 'Side Control' }],
  'Pressure Pass': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Loop Pass': [{ to: 'Side Control' }],
  'Wilson Pass': [{ to: 'Side Control' }],
  'Saulo Hip Switch': [{ to: 'Side Control' }, { to: 'Back Control' }],
  'Cross Knee Pass': [{ to: 'Side Control' }, { to: 'Mount' }],

  // --- sweeps -> top ---
  'Waiter Sweep': [{ to: 'Back Control' }, { to: 'Mount' }],
  'Balloon Sweep': [{ to: 'Mount' }, { to: 'Side Control' }],
  'Lumberjack Sweep': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Hook Sweep': [{ to: 'Mount' }, { to: 'Side Control' }],
  'Tripod Sweep': [{ to: 'Standing' }, { to: 'Single Leg' }],
  'Sickle Sweep': [{ to: 'Mount' }, { to: 'Side Control' }],
  'Overhead Sweep': [{ to: 'Mount' }],
  'Electric Chair': [{ to: 'Mount' }, { to: 'Side Control' }],
  'Kiss of the Dragon': [{ to: 'Back Control' }],
  'John Wayne Sweep': [{ to: 'Mount' }, { to: 'Single Leg' }],
  'Muscle Sweep': [{ to: 'Mount' }],
  Berimbolo: [{ to: 'Back Control' }],
  'Tornado Sweep': [{ to: 'Side Control' }, { to: 'Mount' }, { to: 'X-Guard' }],
  'Kimura Sweep': [{ to: 'Side Control' }, { to: 'Kimura' }],
  'Windshield Wiper Sweep': [{ to: 'Mount' }, { to: 'Side Control' }],
  'Underhook Sweep': [{ to: 'Mount' }, { to: 'Side Control' }, { to: 'Back Control' }],
  'Log Roll': [{ to: 'Back Control' }, { to: 'Mount' }],

  // --- submissions (chains / re-attacks when defended) ---
  Monoplata: [{ to: 'Armbar' }, { to: 'Omoplata' }],
  Americana: [{ to: 'Kimura' }, { to: 'Cross Collar Choke' }, { to: 'Mount' }],
  'Rear Naked Choke': [{ to: 'Bow and Arrow Choke' }, { to: 'Armbar' }],
  'Bow and Arrow Choke': [{ to: 'Rear Naked Choke' }, { to: 'Armbar' }],
  'Ezekiel Choke': [{ to: 'Cross Collar Choke' }, { to: 'Mount' }, { to: 'Armbar' }],
  'Cross Collar Choke': [{ to: 'Armbar' }, { to: 'Ezekiel Choke' }, { to: 'Mount' }],
  "D'Arce Choke": [{ to: 'Anaconda Choke' }, { to: 'Back Control' }],
  'Anaconda Choke': [{ to: "D'Arce Choke" }, { to: 'Back Control' }],
  'Peruvian Necktie': [{ to: "D'Arce Choke" }, { to: 'Back Control' }],
  'North-South Choke': [{ to: 'Kimura' }, { to: 'Mount' }],
  'Clock Choke': [{ to: 'Back Control' }, { to: 'Bow and Arrow Choke' }],
  'Loop Choke': [{ to: 'Guard Pull' }, { to: 'Back Control' }],
  'Baseball Bat Choke': [{ to: 'Mount' }, { to: 'Back Control' }],
  'Paper Cutter Choke': [{ to: 'Mount' }, { to: 'Bow and Arrow Choke' }],
  Gogoplata: [{ to: 'Omoplata' }, { to: 'Triangle Choke' }],
  'Buggy Choke': [{ to: 'Omoplata' }, { to: 'Back Control' }],
  'Arm Triangle': [{ to: 'Mount' }, { to: 'North-South' }],
  'Inside Heel Hook': [
    { to: 'Saddle (Inside Sankaku)' }, { to: '50/50' }, { to: 'Kneebar' },
  ],
  Kneebar: [{ to: 'Heel Hook' }, { to: 'Toe Hold' }, { to: 'Straight Ankle Lock' }],
  'Straight Ankle Lock': [
    { to: 'Heel Hook' }, { to: '50/50' }, { to: 'Single Leg X' },
  ],
  'Toe Hold': [{ to: 'Heel Hook' }, { to: 'Kneebar' }, { to: '50/50' }],
  'Estima Lock': [{ to: 'Straight Ankle Lock' }, { to: 'Heel Hook' }],
  'Calf Slicer': [{ to: 'Heel Hook' }, { to: 'Toe Hold' }],
  'Bicep Slicer': [{ to: 'Armbar' }, { to: 'Omoplata' }],
  Wristlock: [{ to: 'Armbar' }, { to: 'Kimura' }],
  Twister: [{ to: 'Back Control' }, { to: 'Rear Naked Choke' }],
  'Banana Split': [{ to: 'Heel Hook' }, { to: 'Toe Hold' }],
  'Neck Crank': [{ to: 'Rear Naked Choke' }, { to: 'Guillotine' }],
  'Mounted Triangle': [{ to: 'Armbar' }, { to: 'Triangle Choke' }],
  'Reverse Triangle': [{ to: 'Armbar' }, { to: 'Triangle Choke' }],
  'Rear Triangle': [{ to: 'Rear Naked Choke' }, { to: 'Armbar' }],
  'Von Flue Choke': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Japanese Necktie': [{ to: "D'Arce Choke" }, { to: 'Back Control' }],
  Marcelotine: [{ to: 'Guillotine' }, { to: 'Back Control' }],
  'Ninja Choke': [{ to: "D'Arce Choke" }, { to: 'Guillotine' }],
  'Short Choke': [{ to: 'Rear Naked Choke' }, { to: 'Bow and Arrow Choke' }],
  'Crucifix Choke': [{ to: 'Rear Naked Choke' }, { to: 'Armbar' }],
  'Aoki Lock': [{ to: 'Heel Hook' }, { to: 'Straight Ankle Lock' }],
  'Z-Lock': [{ to: 'Heel Hook' }, { to: 'Kneebar' }],
  Tarikoplata: [{ to: 'Omoplata' }, { to: 'Kimura' }],
  Baratoplata: [{ to: 'Omoplata' }, { to: 'Kimura' }],

  // --- takedowns -> top / control ---
  'Ankle Pick': [{ to: 'Side Control' }, { to: 'Front Headlock' }],
  'Knee Pick': [{ to: 'Side Control' }, { to: 'Half Guard' }],
  'Uchi Mata': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Seoi Nage': [{ to: 'Side Control' }, { to: 'Front Headlock' }],
  'Foot Sweep': [{ to: 'Side Control' }, { to: 'Mount' }],
  "Fireman's Carry": [{ to: 'Side Control' }, { to: 'Back Control' }],
  'Blast Double': [{ to: 'Side Control' }, { to: 'Mount' }],
  'High Crotch': [{ to: 'Double Leg' }, { to: 'Side Control' }],
  'Inside Trip': [{ to: 'Side Control' }, { to: 'Half Guard' }],
  'Tani Otoshi': [{ to: 'Side Control' }, { to: 'Back Control' }],
  'Kouchi Gari': [{ to: 'Double Leg' }, { to: 'Side Control' }],
  'Ouchi Gari': [{ to: 'Double Leg' }, { to: 'Side Control' }],
  'Harai Goshi': [{ to: 'Side Control' }, { to: 'Mount' }],
  'Sumi Gaeshi': [
    { to: 'Butterfly Guard' }, { to: 'X-Guard' }, { to: 'Back Control' },
  ],
  Whizzer: [{ to: 'Single Leg' }, { to: 'Sprawl' }, { to: 'Front Headlock' }],
  'Tai Otoshi': [{ to: 'Side Control' }, { to: 'Front Headlock' }],
  'Kosoto Gari': [{ to: 'Side Control' }, { to: 'Back Control' }],
  'Drop Seoi Nage': [{ to: 'Side Control' }, { to: 'Front Headlock' }],
  'Sasae Tsurikomi Ashi': [{ to: 'Side Control' }, { to: 'Ankle Pick' }],
  'Imanari Roll': [
    { to: 'Ashi Garami' }, { to: 'Saddle (Inside Sankaku)' }, { to: 'Heel Hook' },
  ],
  'Flying Armbar': [{ to: 'Armbar' }],
  'Flying Triangle': [{ to: 'Triangle Choke' }],
  'Low Single': [{ to: 'Single Leg' }, { to: 'Ankle Pick' }, { to: 'Side Control' }],

  // --- escapes -> recovered position ---
  'Frame and Escape': [{ to: 'Closed Guard' }, { to: 'Half Guard' }],
  'Ghost Escape': [{ to: 'Closed Guard' }, { to: 'Open Guard' }],
  'Hip Heist': [{ to: 'Standing' }, { to: 'Single Leg' }],
  'Knee Elbow Escape': [{ to: 'Half Guard' }, { to: 'Closed Guard' }],
  'Wall Walk': [{ to: 'Standing' }],
  'Kipping Escape': [{ to: 'Closed Guard' }, { to: 'Half Guard' }],
  'Technical Standup': [{ to: 'Standing' }],
  'Funk Roll': [{ to: 'Back Control' }, { to: 'Single Leg' }],
  'Shoulder Roll': [{ to: 'Turtle' }, { to: 'Back Escape' }],
  'Sit-Out': [{ to: 'Front Headlock' }, { to: 'Standing' }],
  'Peterson Roll': [{ to: 'Back Control' }],
  'Stack Escape': [{ to: 'Closed Guard' }, { to: 'Triangle Choke' }],
  'Hip Switch Escape': [{ to: 'Turtle' }, { to: 'Half Guard' }],
  'Running Escape': [{ to: 'Turtle' }, { to: 'Half Guard' }],
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
