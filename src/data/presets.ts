import type { MoveNode, TransitionEdge } from '../store';

// Ready-made game plans shown in Discover. Every label is a canonical move name
// from moves.ts so categories / edge auto-labels / battle scoring line up.
export type Preset = {
  name: string;
  blurb: string;
  // 'basics' floats to the top of Discover for white belts (and sinks for colored belts)
  level?: 'basics';
  nodes: MoveNode[];
  edges: TransitionEdge[];
};

// compact builders — columns are multiples of 120, rows 160 apart (the app grid)
const node = (
  id: string,
  x: number,
  y: number,
  label: string,
  notes?: string,
): MoveNode => ({
  id,
  type: 'move',
  position: { x, y },
  data: notes ? { label, notes } : { label },
});

const edge = (source: string, target: string, label: string): TransitionEdge => ({
  id: `${source}__${target}`,
  source,
  sourceHandle: 'bottom',
  target,
  targetHandle: 'top',
  type: 'transition',
  data: { label },
});

export const PRESETS: Preset[] = [
  {
    name: 'White Belt Fundamentals',
    blurb:
      'Survive first: escape mount and side control, recover closed guard, sweep to the top, and finish with the basics.',
    level: 'basics',
    nodes: [
      node('wbf-sc', -360, 0, 'Side Control', 'Under side control: frame at neck and hip, get on your side.'),
      node('wbf-mt', 120, 0, 'Mount', 'Under mount: elbows in, protect your neck.'),
      node('wbf-sce', -360, 160, 'Side Control Escape'),
      node('wbf-upa', -120, 160, 'Bridge and Roll (Upa)', 'You land on top in their guard — posture up.'),
      node('wbf-shr', 360, 160, 'Elbow Escape (Shrimp)'),
      node('wbf-cg', 0, 320, 'Closed Guard', 'Home base. Break their posture and attack.'),
      node('wbf-hb', -240, 480, 'Hip Bump Sweep'),
      node('wbf-ss', 0, 480, 'Scissor Sweep'),
      node('wbf-ki', 240, 480, 'Kimura'),
      node('wbf-mtop', -120, 640, 'Mount', 'On top now: stay heavy, climb your knees high.'),
      node('wbf-am', -240, 800, 'Americana'),
      node('wbf-cc', 0, 800, 'Cross Collar Choke'),
    ],
    edges: [
      edge('wbf-sc', 'wbf-sce', 'escape'),
      edge('wbf-mt', 'wbf-upa', 'escape'),
      edge('wbf-mt', 'wbf-shr', 'escape'),
      edge('wbf-sce', 'wbf-cg', 'recover'),
      edge('wbf-shr', 'wbf-cg', 'recover'),
      edge('wbf-cg', 'wbf-hb', 'sweep'),
      edge('wbf-cg', 'wbf-ss', 'sweep'),
      edge('wbf-cg', 'wbf-ki', 'submit'),
      edge('wbf-hb', 'wbf-mtop', 'top'),
      edge('wbf-ss', 'wbf-mtop', 'top'),
      edge('wbf-mtop', 'wbf-am', 'submit'),
      edge('wbf-mtop', 'wbf-cc', 'submit'),
    ],
  },
  {
    name: 'Closed Guard Attacks',
    blurb:
      'Break posture and hunt the finish: armbar and triangle off the collar, or sweep to the top and choke.',
    nodes: [
      node('cga-cg', 0, 0, 'Closed Guard', 'Break posture, control a sleeve.'),
      node('cga-ar', -360, 160, 'Armbar'),
      node('cga-tr', -120, 160, 'Triangle Choke'),
      node('cga-hb', 120, 160, 'Hip Bump Sweep'),
      node('cga-fl', 360, 160, 'Flower Sweep'),
      node('cga-mo', 120, 320, 'Mount'),
      node('cga-bk', 360, 320, 'Back Control'),
      node('cga-at', 120, 480, 'Arm Triangle'),
      node('cga-rnc', 360, 480, 'Rear Naked Choke'),
    ],
    edges: [
      edge('cga-cg', 'cga-ar', 'submit'),
      edge('cga-cg', 'cga-tr', 'submit'),
      edge('cga-cg', 'cga-hb', 'sweep'),
      edge('cga-cg', 'cga-fl', 'sweep'),
      edge('cga-hb', 'cga-mo', 'top'),
      edge('cga-fl', 'cga-bk', 'back'),
      edge('cga-mo', 'cga-at', 'submit'),
      edge('cga-bk', 'cga-rnc', 'submit'),
    ],
  },
  {
    name: 'Wrestle to Mount',
    blurb:
      'Pressure top game: shoot the double, pass to mount and finish, or snap to the front headlock series.',
    nodes: [
      node('w2m-st', 0, 0, 'Standing', 'Hand fight, level change early.'),
      node('w2m-dl', -240, 160, 'Double Leg'),
      node('w2m-sn', 240, 160, 'Snap Down'),
      node('w2m-sc', -240, 320, 'Side Control'),
      node('w2m-fh', 240, 320, 'Front Headlock'),
      node('w2m-mo', -240, 480, 'Mount'),
      node('w2m-gu', 120, 480, 'Guillotine'),
      node('w2m-da', 360, 480, "D'Arce Choke"),
      node('w2m-am', -360, 640, 'Americana'),
      node('w2m-att', -120, 640, 'Arm Triangle'),
    ],
    edges: [
      edge('w2m-st', 'w2m-dl', 'shot'),
      edge('w2m-st', 'w2m-sn', 'snap'),
      edge('w2m-dl', 'w2m-sc', 'pass'),
      edge('w2m-sn', 'w2m-fh', 'control'),
      edge('w2m-sc', 'w2m-mo', 'mount'),
      edge('w2m-fh', 'w2m-gu', 'submit'),
      edge('w2m-fh', 'w2m-da', 'submit'),
      edge('w2m-mo', 'w2m-am', 'submit'),
      edge('w2m-mo', 'w2m-att', 'submit'),
    ],
  },
  {
    name: 'Leg Lock Entries',
    blurb:
      'Modern lower-body game: enter the ashi from single-leg-X, invert to the saddle, or split to 50/50.',
    nodes: [
      node('llg-og', 0, 0, 'Open Guard', 'Feet on hips, manage the distance.'),
      node('llg-slx', -240, 160, 'Single Leg X'),
      node('llg-ff', 240, 160, '50/50'),
      node('llg-ag', -240, 320, 'Ashi Garami'),
      node('llg-hh', 240, 320, 'Heel Hook'),
      node('llg-sal', -360, 480, 'Straight Ankle Lock'),
      node('llg-sad', -120, 480, 'Saddle (Inside Sankaku)'),
      node('llg-ihh', -120, 640, 'Inside Heel Hook'),
    ],
    edges: [
      edge('llg-og', 'llg-slx', 'entry'),
      edge('llg-og', 'llg-ff', 'entry'),
      edge('llg-slx', 'llg-ag', 'ashi'),
      edge('llg-ff', 'llg-hh', 'submit'),
      edge('llg-ag', 'llg-sal', 'submit'),
      edge('llg-ag', 'llg-sad', 'invert'),
      edge('llg-sad', 'llg-ihh', 'submit'),
    ],
  },
  {
    name: 'Back Attacks',
    blurb:
      'Finish from the back: choke off the seatbelt, or trap an arm in the gift wrap for the armbar and triangle.',
    nodes: [
      node('bak-bc', 0, 0, 'Back Control', 'Seatbelt grip, chest glued to the back.'),
      node('bak-rnc', -240, 160, 'Rear Naked Choke'),
      node('bak-ba', 0, 160, 'Bow and Arrow Choke'),
      node('bak-gw', 240, 160, 'Gift Wrap'),
      node('bak-ar', 120, 320, 'Armbar'),
      node('bak-rt', 360, 320, 'Rear Triangle'),
    ],
    edges: [
      edge('bak-bc', 'bak-rnc', 'submit'),
      edge('bak-bc', 'bak-ba', 'submit'),
      edge('bak-bc', 'bak-gw', 'trap'),
      edge('bak-gw', 'bak-ar', 'submit'),
      edge('bak-gw', 'bak-rt', 'submit'),
    ],
  },
];
