import { useGraph } from '../store';
import { sampleEdges, sampleNodes } from '../data/sampleGraph';

const CREAM = '#F3EFE2';
const pill =
  'rounded-full border border-neutral-900 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]';

const hl = (text: string) => (
  <mark className="bg-[#52E5D8] px-1 text-neutral-900">{text}</mark>
);

export default function Landing() {
  const createTree = useGraph((s) => s.createTree);
  const trySample = () => {
    window.location.hash = `#/t/${createTree('Sample Game Plan', sampleNodes, sampleEdges)}`;
  };

  return (
    <div className="min-h-screen bg-[#E7E2D0] p-3 sm:p-5">
      <div
        className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-neutral-900 px-6 py-5 sm:px-10"
        style={{ background: CREAM }}
      >
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="font-serif text-[22px] leading-[1.05] text-neutral-900">
            Game Plan
            <br />
            Studio
          </div>
          <nav className="flex flex-wrap gap-2">
            <a className={`${pill} bg-white`} href="#/">
              Home
            </a>
            <a className={pill} href="#/plans">
              Plans
            </a>
            <button className={pill} onClick={trySample}>
              Sample
            </button>
            <a
              className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#F3EFE2] hover:bg-neutral-700"
              href="#/plans"
            >
              Start
            </a>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="max-w-xl font-serif text-[40px] leading-[1.08] text-neutral-900 sm:text-[56px]">
              The {hl('Flowchart Builder')} for Your Jiu-Jitsu {hl('A-Game')}
              <span className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.1em] animate-pulse bg-blue-600" />
            </h1>

            <div className="relative mt-10 max-w-md">
              {/* crop marks */}
              <span className="absolute -left-3 -top-3 h-3 w-px bg-neutral-900" />
              <span className="absolute -left-5 top-0 h-px w-3 bg-neutral-900" />
              <span className="absolute -right-3 -top-3 h-3 w-px bg-neutral-900" />
              <span className="absolute -right-5 top-0 h-px w-3 bg-neutral-900" />
              <span className="absolute -bottom-3 -left-3 h-3 w-px bg-neutral-900" />
              <span className="absolute -left-5 bottom-0 h-px w-3 bg-neutral-900" />
              <span className="absolute -bottom-3 -right-3 h-3 w-px bg-neutral-900" />
              <span className="absolute -right-5 bottom-0 h-px w-3 bg-neutral-900" />
              <div className="bg-[#CDC7AE] px-5 py-4">
                <h2 className="border-b border-neutral-500/40 pb-2 font-serif text-[19px] text-neutral-900">
                  Your Game, Made Predictable
                </h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-800">
                  Map positions, transitions, and submissions into one
                  connected system. Hover any move for suggested follow-ups
                  grounded in real grappling data — so you build chains, not
                  collections, and always know your next move.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full border border-neutral-900 bg-neutral-900 px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-[#F3EFE2] hover:bg-neutral-700"
                href="#/plans"
              >
                Start Building — Free
              </a>
              <button
                className="rounded-full border border-neutral-900 px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-neutral-900 hover:bg-neutral-900 hover:text-[#F3EFE2]"
                onClick={trySample}
              >
                Try the Sample
              </button>
            </div>
          </div>

          <Illustration />
        </main>

        <a
          href="#/plans"
          className="absolute bottom-6 left-6 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-[#F3EFE2]"
          title="Your plans"
        >
          ↓
        </a>
      </div>
    </div>
  );
}

// line-art mini game plan, echoing the canvas: dashed edges, chips, port dots
function Illustration() {
  const chip = (x: number, y: number, w: number, label: string) => (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={11} fill={CREAM} stroke="#171717" strokeWidth="1.2" />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill="#171717">
        {label}
      </text>
    </g>
  );
  const node = (x: number, y: number, label: string) => (
    <g>
      <rect x={x} y={y} width={150} height={54} rx={10} fill="#FFFFFF" stroke="#171717" strokeWidth="1.5" />
      <line x1={x} y1={y + 20} x2={x + 150} y2={y + 20} stroke="#171717" strokeWidth="0.8" />
      <text x={x + 10} y={y + 14} fontFamily="ui-monospace, monospace" fontSize="8" letterSpacing="2" fill="#525252">
        MOVE
      </text>
      <text x={x + 10} y={y + 42} fontFamily="Georgia, serif" fontSize="15" fill="#171717">
        {label}
      </text>
      <circle cx={x + 75} cy={y} r={3.5} fill={CREAM} stroke="#171717" strokeWidth="1.2" />
      <circle cx={x + 75} cy={y + 54} r={3.5} fill={CREAM} stroke="#171717" strokeWidth="1.2" />
    </g>
  );
  return (
    <div className="relative hidden select-none md:block">
      <svg viewBox="0 0 380 430" className="mx-auto w-full max-w-sm">
        {/* blueprint crosses */}
        <g stroke="#171717" strokeWidth="1.2">
          <line x1="20" y1="40" x2="40" y2="40" />
          <line x1="30" y1="30" x2="30" y2="50" />
          <line x1="340" y1="150" x2="360" y2="150" />
          <line x1="350" y1="140" x2="350" y2="160" />
          <line x1="40" y1="390" x2="60" y2="390" />
          <line x1="50" y1="380" x2="50" y2="400" />
        </g>
        <g fill="none" stroke="#171717" strokeWidth="1.3" strokeDasharray="5 4">
          <path d="M190 64 C 190 95, 115 90, 115 130" />
          <path d="M190 64 C 190 95, 265 90, 265 130" />
          <path d="M115 184 C 115 220, 188 215, 190 250" />
          <path d="M265 184 C 265 220, 192 215, 190 250" />
          <path d="M190 304 L 190 340" />
        </g>
        {node(115, 10, 'Standing')}
        {node(40, 130, 'Guard Pull')}
        {node(190, 130, 'Snap Down')}
        {node(115, 250, 'Back Control')}
        {chip(82, 92, 52, 'pull')}
        {chip(232, 92, 52, 'snap')}
        {chip(154, 336, 72, 'submit')}
        <text x="190" y="392" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="3" fill="#525252">
          REAR NAKED CHOKE
        </text>
      </svg>
    </div>
  );
}
