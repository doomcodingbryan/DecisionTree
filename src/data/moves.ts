// Curated BJJ move library used to suggest node names.
// Grouped for readability / future category UI; flattened into ALL_MOVES for filtering.
// Vocabulary is hand-curated, grounded in the public-domain GrappleMap tag set
// (see scripts/grapplemap.mjs). Extend by editing this one file — keep names canonical
// (each move appears once) so src/data/transitions.ts can reference them by exact name.
export const MOVE_LIBRARY: Record<string, string[]> = {
  Positions: [
    'Standing',
    'Closed Guard',
    'Open Guard',
    'Half Guard',
    'Deep Half Guard',
    'Quarter Guard',
    'Reverse Half Guard',
    'Mount',
    'S-Mount',
    'Technical Mount',
    'Low Mount',
    'High Mount',
    'Three-Quarter Mount',
    'Side Control',
    'Reverse Side Control',
    'Twister Side Control',
    'Back Control',
    'Back Mount',
    'Turtle',
    'North-South',
    'Knee on Belly',
    'Crucifix',
    'Truck',
    'Sprawl',
    'Front Headlock',
    'Combat Base',
    '50/50',
    'Ashi Garami',
    'Saddle (Inside Sankaku)',
    'Outside Ashi',
    'Leg Knot',
    'Dogfight',
    'Spiderweb',
    'Crab Ride',
    'Scarf Hold (Kesa Gatame)',
    'Gift Wrap',
    'Backside 50/50',
    'Reaping Position',
    'Body Triangle',
  ],
  Guards: [
    'De La Riva',
    'Reverse De La Riva',
    'Spider Guard',
    'Lasso Guard',
    'Butterfly Guard',
    'X-Guard',
    'Single Leg X',
    'Z-Guard',
    'K-Guard',
    'Worm Guard',
    'Lapel Guard',
    'Rubber Guard',
    'Williams Guard',
    'Collar Sleeve',
    'Sit-Up Guard',
    'Shin-to-Shin',
    'Waiter Guard',
    'Octopus Guard',
    'Knee Shield',
    'Inverted Guard',
    'Matrix Guard',
    'Squid Guard',
    'Reverse X-Guard',
    '93 Guard',
    'Gubber Guard',
    'Half Butterfly Guard',
    'One-Legged X',
    'Falcon Guard',
    'Tornado Guard',
  ],
  Passes: [
    'Toreando Pass',
    'Knee Cut',
    'Over-Under Pass',
    'Double Under Pass',
    'Leg Drag',
    'Long Step',
    'Smash Pass',
    'Body Lock Pass',
    'Stack Pass',
    'Folding Pass',
    'X-Pass',
    'Cartwheel Pass',
    'Leg Weave',
    'Backstep',
    'Float Pass',
    'Headquarters (HQ)',
    'Bullfighter Pass',
    'Standing Guard Break',
    'Kneeling Guard Break',
    'Tripod Pass',
    'Pressure Pass',
    'Loop Pass',
    'Wilson Pass',
    'Saulo Hip Switch',
    'Cross Knee Pass',
  ],
  Sweeps: [
    'Scissor Sweep',
    'Hip Bump Sweep',
    'Flower Sweep',
    'Pendulum Sweep',
    'Butterfly Sweep',
    'Waiter Sweep',
    'Tomoe Nage',
    'Balloon Sweep',
    'Lumberjack Sweep',
    'Hook Sweep',
    'Tripod Sweep',
    'Sickle Sweep',
    'Overhead Sweep',
    'X-Guard Sweep',
    'Elevator Sweep',
    'Old School Sweep',
    'Electric Chair',
    'Kiss of the Dragon',
    'John Wayne Sweep',
    'Muscle Sweep',
    'Berimbolo',
    'Tornado Sweep',
    'Kimura Sweep',
    'Windshield Wiper Sweep',
    'Underhook Sweep',
    'Log Roll',
  ],
  Submissions: [
    'Armbar',
    'Triangle Choke',
    'Omoplata',
    'Monoplata',
    'Kimura',
    'Americana',
    'Guillotine',
    'Rear Naked Choke',
    'Bow and Arrow Choke',
    'Ezekiel Choke',
    'Cross Collar Choke',
    "D'Arce Choke",
    'Anaconda Choke',
    'Peruvian Necktie',
    'North-South Choke',
    'Clock Choke',
    'Loop Choke',
    'Baseball Bat Choke',
    'Paper Cutter Choke',
    'Gogoplata',
    'Buggy Choke',
    'Arm Triangle',
    'Heel Hook',
    'Inside Heel Hook',
    'Kneebar',
    'Straight Ankle Lock',
    'Toe Hold',
    'Estima Lock',
    'Calf Slicer',
    'Bicep Slicer',
    'Wristlock',
    'Twister',
    'Banana Split',
    'Neck Crank',
    'Mounted Triangle',
    'Reverse Triangle',
    'Rear Triangle',
    'Von Flue Choke',
    'Japanese Necktie',
    'Marcelotine',
    'Ninja Choke',
    'Short Choke',
    'Crucifix Choke',
    'Aoki Lock',
    'Z-Lock',
    'Tarikoplata',
    'Baratoplata',
  ],
  Takedowns: [
    'Double Leg',
    'Single Leg',
    'Ankle Pick',
    'Knee Pick',
    'Osoto Gari',
    'Uchi Mata',
    'Seoi Nage',
    'Foot Sweep',
    'Arm Drag',
    'Snap Down',
    'Body Lock Takedown',
    "Fireman's Carry",
    'Blast Double',
    'High Crotch',
    'Duck Under',
    'Inside Trip',
    'Tani Otoshi',
    'Kouchi Gari',
    'Ouchi Gari',
    'Harai Goshi',
    'Sumi Gaeshi',
    'Guard Pull',
    'Two-on-One',
    'Whizzer',
    'Tai Otoshi',
    'Kosoto Gari',
    'Drop Seoi Nage',
    'Sasae Tsurikomi Ashi',
    'Imanari Roll',
    'Flying Armbar',
    'Flying Triangle',
    'Low Single',
  ],
  Escapes: [
    'Bridge and Roll (Upa)',
    'Elbow Escape (Shrimp)',
    'Frame and Escape',
    'Ghost Escape',
    'Granby Roll',
    'Hip Heist',
    'Back Escape',
    'Mount Escape',
    'Side Control Escape',
    'Knee Elbow Escape',
    'Wall Walk',
    'Kipping Escape',
    'Technical Standup',
    'Funk Roll',
    'Shoulder Roll',
    'Sit-Out',
    'Peterson Roll',
    'Stack Escape',
    'Hip Switch Escape',
    'Running Escape',
  ],
};

// flat list for filtering
export const ALL_MOVES: string[] = Object.values(MOVE_LIBRARY).flat();

// move name -> its MOVE_LIBRARY category
export const MOVE_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(MOVE_LIBRARY).flatMap(([category, moves]) =>
    moves.map((m) => [m, category]),
  ),
);

// ============================================================
// Move metadata — instructor associations + position/style tags.
// Names stay the canonical identity; this is a sparse side-table keyed by
// name (a typoed key is caught by scripts/check-transitions.mjs). Gi/No-Gi is
// derived (gearTags), so it isn't repeated here. `instructors` are genuine
// "known-for" associations, not video credits.
// ============================================================
export type MoveMeta = { instructors?: string[]; positions?: string[] };

export const MOVE_META: Record<string, MoveMeta> = {
  // --- dominant positions ---
  Mount: { positions: ['Mount top'] },
  'Side Control': { positions: ['Side control top'] },
  'Back Control': { positions: ['Back control'] },
  'Knee on Belly': { positions: ['Knee on belly'] },
  'North-South': { positions: ['North-south top'] },
  Turtle: { positions: ['Turtle'] },
  Standing: { positions: ['Standup'] },

  // --- guards (bottom) ---
  'Closed Guard': { positions: ['Closed guard bottom'] },
  'Open Guard': { positions: ['Open guard bottom'] },
  'Half Guard': {
    positions: ['Half guard bottom'],
    instructors: ['Bernardo Faria', 'Tom DeBlass'],
  },
  'Deep Half Guard': {
    positions: ['Half guard bottom'],
    instructors: ['Bernardo Faria'],
  },
  'Butterfly Guard': { positions: ['Guard bottom'], instructors: ['Marcelo Garcia'] },
  'De La Riva': { positions: ['Guard bottom'] },
  'Reverse De La Riva': {
    positions: ['Guard bottom'],
    instructors: ['Mendes Brothers'],
  },
  'X-Guard': { positions: ['Guard bottom'], instructors: ['Marcelo Garcia'] },
  'Single Leg X': { positions: ['Guard bottom'], instructors: ['Marcelo Garcia'] },
  'Rubber Guard': {
    positions: ['Closed guard bottom'],
    instructors: ['Eddie Bravo'],
  },
  'Knee Shield': {
    positions: ['Half guard bottom'],
    instructors: ['Tom DeBlass'],
  },
  'K-Guard': { positions: ['Guard bottom', 'Leg lock'], instructors: ['Craig Jones'] },
  'Spider Guard': { positions: ['Guard bottom'], instructors: ['Romulo Barral'] },
  'Worm Guard': { positions: ['Guard bottom'], instructors: ['Keenan Cornelius'] },
  'Lapel Guard': { positions: ['Guard bottom'], instructors: ['Keenan Cornelius'] },

  // --- submissions ---
  Armbar: { positions: ['Submission'] },
  'Triangle Choke': { positions: ['Submission'], instructors: ['Ryan Hall'] },
  Omoplata: { positions: ['Submission'] },
  Kimura: { positions: ['Submission'] },
  Guillotine: { positions: ['Front headlock'], instructors: ['Marcelo Garcia'] },
  Marcelotine: { positions: ['Front headlock'], instructors: ['Marcelo Garcia'] },
  'Rear Naked Choke': { positions: ['Back control'] },
  'Cross Collar Choke': { positions: ['Submission'], instructors: ['Roger Gracie'] },
  'Bow and Arrow Choke': { positions: ['Back control'] },
  Gogoplata: { positions: ['Submission'], instructors: ['Eddie Bravo'] },
  Twister: { positions: ['Submission'], instructors: ['Eddie Bravo'] },
  'Von Flue Choke': {
    positions: ['Side control top'],
    instructors: ['Jason Von Flue'],
  },
  "D'Arce Choke": { positions: ['Front headlock'] },
  'Anaconda Choke': { positions: ['Front headlock'] },
  'Peruvian Necktie': { positions: ['Front headlock'] },

  // --- leg locks ---
  'Heel Hook': {
    positions: ['Leg lock'],
    instructors: ['John Danaher', 'Gordon Ryan'],
  },
  'Inside Heel Hook': {
    positions: ['Leg lock'],
    instructors: ['John Danaher', 'Gordon Ryan'],
  },
  'Straight Ankle Lock': { positions: ['Leg lock'] },
  'Toe Hold': { positions: ['Leg lock'] },
  Kneebar: { positions: ['Leg lock'] },
  'Calf Slicer': { positions: ['Leg lock'], instructors: ['Eddie Bravo'] },
  'Estima Lock': { positions: ['Leg lock'], instructors: ['Estima Brothers'] },
  'Ashi Garami': { positions: ['Leg lock'], instructors: ['John Danaher'] },
  'Saddle (Inside Sankaku)': {
    positions: ['Leg lock'],
    instructors: ['John Danaher'],
  },
  '50/50': { positions: ['Leg lock'] },
  'Backside 50/50': { positions: ['Leg lock'], instructors: ['Craig Jones'] },
  'Z-Lock': { positions: ['Leg lock'], instructors: ['Craig Jones'] },
  'Aoki Lock': { positions: ['Leg lock'] },
  Truck: { positions: ['Leg lock'], instructors: ['Eddie Bravo'] },
  'Electric Chair': {
    positions: ['Half guard bottom'],
    instructors: ['Eddie Bravo'],
  },

  // --- sweeps ---
  'Butterfly Sweep': { positions: ['Sweep'], instructors: ['Marcelo Garcia'] },
  'Old School Sweep': {
    positions: ['Half guard bottom', 'Sweep'],
    instructors: ['Bernardo Faria'],
  },
  Berimbolo: {
    positions: ['Sweep', 'Back take'],
    instructors: ['Mendes Brothers', 'Miyao Brothers'],
  },
  'Waiter Sweep': {
    positions: ['Half guard bottom', 'Sweep'],
    instructors: ['Bernardo Faria'],
  },

  // --- passes ---
  'Over-Under Pass': {
    positions: ['Guard passing'],
    instructors: ['Bernardo Faria'],
  },
  'Double Under Pass': {
    positions: ['Guard passing'],
    instructors: ['Bernardo Faria'],
  },
  'Toreando Pass': { positions: ['Guard passing'] },
  'Knee Cut': { positions: ['Guard passing'] },
  'Leg Drag': { positions: ['Guard passing'] },

  // --- takedowns ---
  'Double Leg': { positions: ['Standup'] },
  'Single Leg': { positions: ['Standup'] },
  'Arm Drag': { positions: ['Standup'], instructors: ['Marcelo Garcia'] },
  'Imanari Roll': {
    positions: ['Standup', 'Leg lock'],
    instructors: ['Masakazu Imanari'],
  },
  'Osoto Gari': { positions: ['Standup'] },
  'Uchi Mata': { positions: ['Standup'] },
  'Seoi Nage': { positions: ['Standup'] },

  // --- escapes ---
  'Bridge and Roll (Upa)': { positions: ['Mount bottom', 'Escape'] },
  'Elbow Escape (Shrimp)': { positions: ['Escape'] },
  'Granby Roll': { positions: ['Escape'], instructors: ['Ryan Hall'] },
};

// Moves that fundamentally need the gi (collar/lapel/sleeve grips); everything
// else works in both. Keys checked by scripts/check-transitions.mjs.
export const GI_ONLY = new Set<string>([
  'Spider Guard', 'Lasso Guard', 'Collar Sleeve', 'Worm Guard', 'Lapel Guard',
  'Williams Guard', 'Squid Guard', 'Gubber Guard', 'Cross Collar Choke',
  'Bow and Arrow Choke', 'Baseball Bat Choke', 'Clock Choke', 'Loop Choke',
  'Paper Cutter Choke',
]);

export const gearTags = (move: string): string[] =>
  GI_ONLY.has(move) ? ['Gi'] : ['Gi', 'No-Gi'];

// Display tags: gear first, then curated position/style tags.
export const moveTags = (move: string): string[] => [
  ...gearTags(move),
  ...(MOVE_META[move]?.positions ?? []),
];

export const moveInstructors = (move: string): string[] =>
  MOVE_META[move]?.instructors ?? [];

// Gym-speak → canonical names, so novice searches land ("rnc", "upa", "kob").
// Keyed by canonical name; values are extra words matched by moveMatches.
// Exported only for scripts/check-transitions.mjs — a typoed key silently
// never matches, so the check asserts every key is canonical.
export const ALIASES: Record<string, string> = {
  'Rear Naked Choke': 'rnc mata leao choke from behind',
  'Bridge and Roll (Upa)': 'upa mount escape',
  'Elbow Escape (Shrimp)': 'shrimp hip escape mount escape',
  'Cross Collar Choke': 'x choke',
  'Baseball Bat Choke': 'baseball choke',
  'Paper Cutter Choke': 'bread cutter',
  'Ezekiel Choke': 'sleeve choke',
  'Arm Triangle': 'kata gatame head and arm',
  "D'Arce Choke": 'darce brabo',
  'Triangle Choke': 'sankaku',
  Kimura: 'double wristlock chicken wing',
  Americana: 'keylock key lock figure four',
  Armbar: 'arm bar juji gatame',
  Kneebar: 'knee bar',
  Wristlock: 'wrist lock',
  'Straight Ankle Lock': 'footlock foot lock achilles',
  'Calf Slicer': 'calf crush',
  'Saddle (Inside Sankaku)': 'honey hole 411 four eleven',
  'Single Leg X': 'slx ashi',
  'De La Riva': 'dlr',
  'Reverse De La Riva': 'rdlr',
  'Closed Guard': 'full guard',
  Mount: 'full mount',
  'Side Control': 'side mount cross side 100 kilos',
  'Back Control': 'back take rear mount hooks seatbelt',
  'Knee on Belly': 'kob knee ride knee mount',
  '50/50': 'fifty fifty',
  'Knee Cut': 'knee slice knee slide',
  'Hip Bump Sweep': 'sit up sweep',
  Berimbolo: 'bolo',
  'Guard Pull': 'pull guard',
  'Double Leg': 'shot',
  'Osoto Gari': 'outside trip',
  'Seoi Nage': 'shoulder throw',
  "Fireman's Carry": 'kata guruma',
  'Sumi Gaeshi': 'sacrifice throw',
  'Two-on-One': 'russian tie',
  Whizzer: 'overhook',
};

// name + category + slang + tags + instructors, lowercased once — the haystack
// every search uses. Now "danaher", "gi", or "leg lock" all find moves.
const HAYSTACK: Record<string, string> = Object.fromEntries(
  ALL_MOVES.map((m) => [
    m,
    `${m} ${MOVE_CATEGORY[m]} ${ALIASES[m] ?? ''} ${moveTags(m).join(' ')} ${moveInstructors(m).join(' ')}`.toLowerCase(),
  ]),
);

// q must already be lowercased. Falls back to the label itself for
// non-canonical (user-renamed) labels.
export const moveMatches = (move: string, q: string): boolean =>
  (HAYSTACK[move] ?? move.toLowerCase()).includes(q);

// Chip word for an edge landing on a move of this category. Positions stay
// unlabeled — arriving in a position says nothing about how you got there.
const CATEGORY_EDGE_LABEL: Record<string, string> = {
  Takedowns: 'takedown',
  Passes: 'pass',
  Sweeps: 'sweep',
  Submissions: 'submit',
  Escapes: 'escape',
  Guards: 'guard',
};

export const edgeLabelFor = (targetMove: string): string | undefined =>
  CATEGORY_EDGE_LABEL[MOVE_CATEGORY[targetMove] ?? ''];
