import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGraph, type Folder, type Tree } from '../store';
import {
  MOVE_LIBRARY,
  ALL_MOVES,
  MOVE_CATEGORY,
  moveMatches,
} from '../data/moves';
import {
  analyzeFlow,
  coachingTips,
  simulateMatch,
  type FlowStats,
  type Match,
} from '../battle';
import { sampleEdges, sampleNodes } from '../data/sampleGraph';
import { PRESETS, type Preset } from '../data/presets';
import { getVideos, parseYouTubeId, saveVideo, youtubeSearch } from '../video';

const openPlan = (id: string) => {
  window.location.hash = `#/t/${id}`;
};

const btn =
  'h-10 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em]';
const btnPrimary = `${btn} border-neutral-900 bg-neutral-900 text-[#F3EFE2] hover:bg-neutral-700`;
const btnGhost = `${btn} border-neutral-900 bg-[#F3EFE2] text-neutral-900 hover:bg-[#E7E1CD]`;
const iconBtn =
  'h-5 w-5 rounded-full border border-[#B7B098] font-mono text-[10px] leading-none text-neutral-500';
const monoLabel =
  'font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500';

const navToggle =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-900 font-mono text-[11px] leading-none text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]';

// ponytail: belt rank doubles as the avatar color, stored like gps-user in localStorage
const BELTS: Record<string, { bg: string; fg: string }> = {
  White: { bg: '#FBF9F0', fg: '#171717' },
  Blue: { bg: '#2B5DA8', fg: '#F3EFE2' },
  Purple: { bg: '#6B4FA0', fg: '#F3EFE2' },
  Brown: { bg: '#7B4A2D', fg: '#F3EFE2' },
  Black: { bg: '#171717', fg: '#F3EFE2' },
};
// undefined keeps the default teal for users with no belt set
const beltStyle = () => {
  const b = BELTS[localStorage.getItem('gps-belt') ?? ''];
  return b ? { backgroundColor: b.bg, color: b.fg } : undefined;
};

// sidebar on the outer ground, content in the rounded card beside it
function Shell({ children }: { children: ReactNode }) {
  const here = window.location.hash;
  const user = localStorage.getItem('gps-user') ?? 'guest';
  // Shell remounts per page, so the collapse survives navigation via localStorage
  const [open, setOpen] = useState(
    () => localStorage.getItem('gps-nav') !== 'closed',
  );
  const toggle = () => {
    localStorage.setItem('gps-nav', open ? 'closed' : 'open');
    setOpen(!open);
  };
  // Account isn't a tab — it's reached via the profile card / avatar below
  const onAccount = here.startsWith('#/account');
  const tabs = [
    // folder pages count as Plans. icon = letter badge shown on the collapsed rail
    {
      href: '#/plans',
      label: 'Plans',
      icon: 'P',
      active: here.startsWith('#/plans') || here.startsWith('#/f/'),
    },
    {
      href: '#/flows',
      label: 'All Flows',
      icon: 'F',
      active: here.startsWith('#/flows'),
    },
    {
      href: '#/library',
      label: 'Library',
      icon: 'L',
      active: here.startsWith('#/library'),
    },
    {
      href: '#/battle',
      label: 'Battle',
      icon: 'B',
      active: here.startsWith('#/battle'),
    },
    {
      href: '#/discover',
      label: 'Discover',
      icon: 'D',
      active: here.startsWith('#/discover'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col gap-4 p-3 text-neutral-900 sm:p-5 md:flex-row md:gap-6">
      {!open ? (
        // collapsed rail, echoing the move library's
        <aside className="flex shrink-0 items-center gap-3 md:w-8 md:flex-col md:py-2">
          <button className={navToggle} onClick={toggle} title="Expand sidebar">
            »
          </button>
          <a
            href="#/"
            className="font-serif text-[15px] text-neutral-900 md:[writing-mode:vertical-rl]"
          >
            Game Plan Studio
          </a>
          {/* collapsed tabs: letter badges, full label on hover */}
          {tabs.map((t) => (
            <a
              key={t.href}
              href={t.href}
              title={t.label}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] leading-none transition-colors ${
                t.active
                  ? 'border-neutral-900 bg-neutral-900 text-[#F3EFE2]'
                  : 'border-[#B7B098] text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              {t.icon}
            </a>
          ))}
          <a
            href="#/account"
            title={user}
            className={`mt-auto hidden h-8 w-8 items-center justify-center rounded-full border font-serif text-[15px] text-neutral-900 md:flex ${
              onAccount ? 'border-neutral-900 ring-2 ring-neutral-900' : 'border-neutral-900'
            } bg-[#52E5D8]`}
            style={beltStyle()}
          >
            {user[0]?.toUpperCase()}
          </a>
        </aside>
      ) : (
      <aside className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 md:w-56 md:flex-col md:flex-nowrap md:items-stretch md:py-2">
        <div className="flex flex-1 items-start justify-between gap-2 md:flex-none md:px-2">
          <a href="#/" className="font-serif text-[22px] leading-[1.05]">
            Game Plan
            <br />
            Studio
          </a>
          <button className={navToggle} onClick={toggle} title="Collapse sidebar">
            «
          </button>
        </div>
        <nav className="flex flex-wrap gap-1.5 md:mt-10 md:flex-col">
          {tabs.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                t.active
                  ? 'border-neutral-900 bg-[#F3EFE2] text-neutral-900'
                  : 'border-transparent text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              {t.label}
            </a>
          ))}
        </nav>
        {/* user card pinned to the bottom, like the reference */}
        <a
          href="#/account"
          className={`mt-auto hidden items-center gap-2.5 rounded-2xl border border-neutral-900 px-3 py-2.5 transition-colors md:flex ${
            onAccount ? 'bg-[#EFEBDC] ring-2 ring-neutral-900' : 'bg-[#F3EFE2] hover:bg-[#EFEBDC]'
          }`}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-900 bg-[#52E5D8] font-serif text-[15px]"
            style={beltStyle()}
          >
            {user[0]?.toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[15px]">
              {user}
            </span>
            <span className={`block text-[9px] ${monoLabel}`}>
              {localStorage.getItem('gps-tagline') || 'On the mat'}
            </span>
          </span>
        </a>
      </aside>
      )}
      <main
        className="min-h-[calc(100vh-2.5rem)] flex-1 rounded-3xl border border-neutral-900 bg-[#F3EFE2] px-6 py-8 sm:px-10"
        style={{
          backgroundImage:
            'radial-gradient(rgba(23,23,23,0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {children}
      </main>
    </div>
  );
}

// #/account — ponytail: "account" is localStorage fields (name/belt/tagline), no backend
export function AccountPage() {
  const trees = useGraph((s) => s.trees);
  const folders = useGraph((s) => s.folders);
  const [name, setName] = useState(localStorage.getItem('gps-user') ?? '');
  const [belt, setBelt] = useState(localStorage.getItem('gps-belt') ?? '');
  const [tagline, setTagline] = useState(
    localStorage.getItem('gps-tagline') ?? '',
  );
  const planCount = Object.keys(trees).length;
  const save = () => {
    const n = name.trim();
    if (n) localStorage.setItem('gps-user', n);
  };
  const saveTagline = () => {
    const t = tagline.trim();
    if (t) localStorage.setItem('gps-tagline', t);
    else localStorage.removeItem('gps-tagline');
  };
  const fieldInput =
    'mt-1 h-10 w-full rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 font-sans text-[14px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400';

  return (
    <Shell>
      <p className={monoLabel}>Account</p>
      <div className="mt-1 flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-neutral-900 bg-[#52E5D8] font-serif text-[26px]"
          style={beltStyle()}
        >
          {(name.trim() || 'guest')[0]?.toUpperCase()}
        </span>
        <h1 className="font-serif text-[40px] tracking-tight">
          Account Details
        </h1>
      </div>
      <div className="mt-8 max-w-sm">
        <label className={`block ${monoLabel}`}>
          Display Name
          <input
            className={fieldInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
        </label>
        <label className={`mt-4 block ${monoLabel}`}>
          Belt Rank
          <select
            className={`${fieldInput} cursor-pointer appearance-none uppercase`}
            value={belt}
            onChange={(e) => {
              // saves immediately so the avatars recolor on this render
              setBelt(e.target.value);
              if (e.target.value)
                localStorage.setItem('gps-belt', e.target.value);
              else localStorage.removeItem('gps-belt');
            }}
          >
            <option value="">Not set</option>
            {Object.keys(BELTS).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className={`mt-4 block ${monoLabel}`}>
          Tagline
          <input
            className={fieldInput}
            placeholder="On the mat"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            onBlur={saveTagline}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
        </label>
        <p className={`mt-6 ${monoLabel}`}>
          {planCount} {planCount === 1 ? 'plan' : 'plans'} · {folders.length}{' '}
          {folders.length === 1 ? 'folder' : 'folders'}
        </p>
        <button
          className={`${btnPrimary} mt-8`}
          onClick={() => {
            localStorage.removeItem('gps-user');
            localStorage.removeItem('gps-belt');
            localStorage.removeItem('gps-tagline');
            window.location.hash = '#/'; // hashchange makes the router re-read auth
          }}
        >
          Log Out
        </button>
      </div>
    </Shell>
  );
}

// #/library — whitebeltclub-style catalog: top filters, a grid or list of
// category-badged techniques, each opening a video panel.
export function LibraryPage() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, string>>(() => getVideos());
  const needle = q.trim().toLowerCase();

  const source = cat ? MOVE_LIBRARY[cat] : ALL_MOVES;
  const moves = needle ? source.filter((m) => moveMatches(m, needle)) : source;

  const attach = (move: string, id: string | null) => {
    saveVideo(move, id);
    setVideos(getVideos());
  };

  const filterPill = (active: boolean) =>
    `rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-[#F3EFE2]'
        : 'border-[#B7B098] text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
    }`;
  const viewBtn = (active: boolean) =>
    `h-8 rounded-full border px-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-[#F3EFE2]'
        : 'border-[#B7B098] text-neutral-500 hover:border-neutral-900'
    }`;
  const badge = (m: string) => (
    <span className="inline-block rounded-full bg-[#E7E2D0] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">
      {MOVE_CATEGORY[m]}
    </span>
  );

  return (
    <Shell>
      <p className={monoLabel}>Reference</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[40px] tracking-tight">Move Library</h1>
        <input
          className="h-10 w-full max-w-[220px] rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 font-sans text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder="Search moves…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button className={filterPill(cat === null)} onClick={() => setCat(null)}>
          All · {ALL_MOVES.length}
        </button>
        {Object.entries(MOVE_LIBRARY).map(([c, list]) => (
          <button key={c} className={filterPill(cat === c)} onClick={() => setCat(c)}>
            {c} · {list.length}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className={monoLabel}>
          {moves.length} {moves.length === 1 ? 'move' : 'moves'}
        </p>
        <div className="flex gap-1.5">
          <button className={viewBtn(view === 'grid')} onClick={() => setView('grid')}>
            Grid
          </button>
          <button className={viewBtn(view === 'list')} onClick={() => setView('list')}>
            List
          </button>
        </div>
      </div>

      {moves.length === 0 ? (
        <p className={`mt-8 ${monoLabel}`}>No moves match “{q.trim()}”.</p>
      ) : view === 'grid' ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moves.map((m) => (
            <li key={m}>
              <button
                className="w-full rounded-xl border border-[#B7B098] bg-[#FBF9F0] px-4 py-3.5 text-left transition-colors hover:border-neutral-900"
                onClick={() => setSelected(m)}
              >
                <span className="flex items-center justify-between gap-2">
                  {badge(m)}
                  {videos[m] && (
                    <span className="font-mono text-[11px] leading-none text-neutral-500">
                      ▶
                    </span>
                  )}
                </span>
                <span className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[16px] tracking-tight text-neutral-900">
                  {m}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 border-y border-[#DCD6C1]">
          {moves.map((m) => (
            <li key={m} className="border-b border-[#DCD6C1] last:border-0">
              <button
                className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-[#FBF9F0]"
                onClick={() => setSelected(m)}
              >
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[15px] text-neutral-900">
                  {m}
                </span>
                {videos[m] && (
                  <span className="font-mono text-[11px] leading-none text-neutral-500">
                    ▶
                  </span>
                )}
                {badge(m)}
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                  Open
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <MoveVideoModal
          move={selected}
          videoId={videos[selected]}
          onAttach={attach}
          onClose={() => setSelected(null)}
        />
      )}
    </Shell>
  );
}

// technique detail + video. No API key, so a video is attached by pasting a
// YouTube link (persisted in localStorage); the search button helps find one.
// Exported for the canvas: MoveNode opens the same modal from its ▶ button.
export function MoveVideoModal({
  move,
  videoId,
  onAttach,
  onClose,
}: {
  move: string;
  videoId?: string;
  onAttach: (move: string, id: string | null) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState(false);
  const attach = () => {
    const id = parseYouTubeId(url);
    if (!id) return setErr(true);
    onAttach(move, id);
    setUrl('');
    setErr(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-neutral-900 bg-[#F3EFE2] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* canvas nodes can carry custom labels with no category */}
            {MOVE_CATEGORY[move] && (
              <span className="inline-block rounded-full bg-[#E7E2D0] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                {MOVE_CATEGORY[move]}
              </span>
            )}
            <h2 className="mt-1 font-serif text-[26px] tracking-tight">{move}</h2>
          </div>
          <button
            className={`${iconBtn} shrink-0 hover:border-neutral-500 hover:text-black`}
            title="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {videoId ? (
          <>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-neutral-900 bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={move}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                className={btnGhost}
                href={youtubeSearch(move)}
                target="_blank"
                rel="noreferrer"
              >
                More on YouTube
              </a>
              <button className={btnGhost} onClick={() => onAttach(move, null)}>
                Remove Video
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4">
            <p className="text-[14px] leading-relaxed text-neutral-600">
              No video yet. Find one on YouTube, then paste its link to embed it
              here.
            </p>
            <a
              className={`${btnPrimary} mt-4 inline-flex items-center`}
              href={youtubeSearch(move)}
              target="_blank"
              rel="noreferrer"
            >
              Search YouTube ▶
            </a>
            <div className="mt-4 flex gap-2">
              <input
                className={`h-10 flex-1 rounded-full border bg-[#FBF9F0] px-4 font-sans text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 ${
                  err ? 'border-red-500' : 'border-neutral-900'
                }`}
                placeholder="Paste a YouTube link…"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErr(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') attach();
                }}
              />
              <button className={btnPrimary} onClick={attach}>
                Attach
              </button>
            </div>
            {err && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-red-500">
                Not a valid YouTube link
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// #/battle — local head-to-head: simulate two game plans to see who'd win.
// No backend, so rivals = the Discover presets and the sample plan, built in,
// plus any plan a friend exports and you import.
const RIVALS: Tree[] = [
  ...PRESETS.map((p) => ({
    id: `__preset_${p.name}`,
    name: p.name,
    nodes: p.nodes,
    edges: p.edges,
    updatedAt: 0,
  })),
  {
    id: '__sample_rival',
    name: 'Sample Grappler',
    nodes: sampleNodes,
    edges: sampleEdges,
    updatedAt: 0,
  },
];

export function BattlePage() {
  const trees = useGraph((s) => s.trees);
  const plans = Object.values(trees).sort((a, b) => b.updatedAt - a.updatedAt);
  // built-in opponents so Battle works even with a single plan
  const roster = [...plans, ...RIVALS];
  const [youId, setYouId] = useState(roster[0]?.id ?? '');
  const [oppId, setOppId] = useState((plans[1] ?? RIVALS[0]).id);
  const [match, setMatch] = useState<Match | null>(null);

  const find = (id: string) => roster.find((t) => t.id === id);
  const you = find(youId);
  const opp = find(oppId);
  const fight = () => {
    if (you && opp) setMatch(simulateMatch(you, opp));
  };

  const picker = (value: string, onChange: (v: string) => void) => (
    <select
      className="mt-1 h-10 w-full cursor-pointer appearance-none rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 font-sans text-[14px] text-neutral-900 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {/* optgroups keep a user's copy of a preset distinct from the built-in rival */}
      <optgroup label="Your Plans">
        {plans.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Built-in Rivals">
        {RIVALS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </optgroup>
    </select>
  );

  return (
    <Shell>
      <p className={monoLabel}>Train</p>
      <h1 className="mt-1 font-serif text-[40px] tracking-tight">Battle</h1>
      {plans.length === 0 ? (
        <div className="mt-10 border border-neutral-900 bg-[#FBF9F0]/90 px-6 py-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            No Plans Yet
          </p>
          <p className="mt-2 font-serif text-[24px] tracking-tight">
            Build a game plan, then bring it to the mat.
          </p>
          <a
            className={`${btnPrimary} mt-6 inline-flex items-center`}
            href="#/plans"
          >
            Go to Plans
          </a>
        </div>
      ) : (
        <>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-neutral-600">
            Pit two game plans against each other and simulate the scramble.
            The Discover plans are built in as rivals — see if your game beats
            theirs.
          </p>
          <div className="mt-8 grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <label className="block">
              <span className={monoLabel}>You</span>
              {picker(youId, setYouId)}
            </label>
            <span className="pb-2 text-center font-serif text-[20px] text-neutral-500">
              vs
            </span>
            <label className="block">
              <span className={monoLabel}>Opponent</span>
              {picker(oppId, setOppId)}
            </label>
          </div>
          <button className={`${btnPrimary} mt-6`} onClick={fight}>
            {match ? 'Rematch' : 'Fight'}
          </button>
          {match && you && opp && (
            <BattleResult match={match} you={you} opp={opp} />
          )}
        </>
      )}
    </Shell>
  );
}

function BattleStat({
  name,
  s,
  won,
}: {
  name: string;
  s: FlowStats;
  won: boolean;
}) {
  const row = (label: string, value: number) => (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        won ? 'border-neutral-900 bg-[#EFEBDC]' : 'border-[#B7B098] bg-[#FBF9F0]'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[17px] tracking-tight">
          {name}
        </p>
        {won && (
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Winner
          </span>
        )}
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {row('Power', s.power)}
        {row('Subs', s.submissions)}
        {row('Depth', s.maxDepth)}
        {row('Moves', s.moves)}
      </dl>
    </div>
  );
}

function BattleResult({
  match,
  you,
  opp,
}: {
  match: Match;
  you: Tree;
  opp: Tree;
}) {
  const ys = analyzeFlow(you);
  const os = analyzeFlow(opp);
  const tips = coachingTips(ys, os);
  const title =
    match.winner === 'draw'
      ? 'Draw'
      : `${(match.winner === 'you' ? you : opp).name} wins`;
  const nameFor = (w: Match['winner']) =>
    w === 'you' ? you.name : w === 'opp' ? opp.name : 'Draw';

  return (
    <div className="mt-8">
      <div className="border border-neutral-900 bg-[#CDC7AE] px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-600">
          Result
        </p>
        <h2 className="mt-1 font-serif text-[28px] tracking-tight">{title}</h2>
        <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.16em] text-neutral-700">
          {match.youWins} – {match.oppWins}
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <BattleStat name={you.name} s={ys} won={match.winner === 'you'} />
        <BattleStat name={opp.name} s={os} won={match.winner === 'opp'} />
      </div>
      {tips.length > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-900 bg-[#FBF9F0] px-4 py-3">
          <p className={monoLabel}>Coach’s Corner</p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-neutral-700">
            {tips.map((t) => (
              <li key={t}>→ {t}</li>
            ))}
          </ul>
        </div>
      )}
      <p className={`mt-6 ${monoLabel}`}>Round by Round</p>
      <ul className="mt-3 space-y-2">
        {match.rounds.map((r, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl border border-[#B7B098] bg-[#FBF9F0] px-4 py-2.5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              R{i + 1}
            </span>
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-neutral-700">
              {r.reason}
            </span>
            <span
              className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] ${
                r.winner === 'draw' ? 'text-neutral-400' : 'text-neutral-900'
              }`}
            >
              {nameFor(r.winner)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// #/discover — prebuilt game plans; adding one clones it into your plans
export function DiscoverPage() {
  const createTree = useGraph((s) => s.createTree);
  const add = (p: Preset) => openPlan(createTree(p.name, p.nodes, p.edges));
  // white belts (or no belt set) see the basics first; colored belts see them last
  const basicsFirst = ['', 'White'].includes(
    localStorage.getItem('gps-belt') ?? '',
  );
  const presets = [...PRESETS].sort(
    (a, b) =>
      Number((a.level === 'basics') !== basicsFirst) -
      Number((b.level === 'basics') !== basicsFirst),
  );

  return (
    <Shell>
      <p className={monoLabel}>Explore</p>
      <h1 className="mt-1 font-serif text-[40px] tracking-tight">Discover</h1>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-neutral-600">
        Prebuilt game plans to steal from. Add one to your plans to edit it, or
        send it to Battle.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((p) => (
          <li
            key={p.name}
            className="flex flex-col rounded-xl border border-[#B7B098] bg-[#FBF9F0] p-4"
          >
            {p.level === 'basics' && (
              <span className="mb-1.5 self-start rounded-full bg-[#E7E2D0] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">
                Fundamentals
              </span>
            )}
            <h2 className="font-serif text-[19px] tracking-tight">{p.name}</h2>
            <p className="mt-1 flex-1 text-[13px] leading-relaxed text-neutral-600">
              {p.blurb}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              {p.nodes.length} moves · {p.edges.length} links
            </p>
            <button className={`${btnPrimary} mt-3`} onClick={() => add(p)}>
              Add to My Plans
            </button>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export default function Home() {
  const trees = useGraph((s) => s.trees);
  const folders = useGraph((s) => s.folders);
  const createTree = useGraph((s) => s.createTree);
  // 'new' opens an empty modal; a Folder opens it prefilled for editing
  const [modal, setModal] = useState<Folder | 'new' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // an exported plan becomes a NEW plan here (the canvas's Import instead
  // replaces the open plan's graph). Name: from the file, else its filename.
  const importPlan = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { name, nodes, edges } = JSON.parse(await file.text());
      if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error();
      const fallback = file.name.replace(/\.json$/i, '').replace(/-+/g, ' ').trim();
      const planName =
        typeof name === 'string' && name.trim()
          ? name.trim()
          : fallback || 'Imported Plan';
      openPlan(createTree(planName, nodes, edges));
    } catch {
      alert('Invalid plan JSON.');
    }
  };
  const plans = Object.values(trees).sort((a, b) => b.updatedAt - a.updatedAt);
  // stale folder refs (e.g. imported data) fall back to unfiled
  const unfiled = plans.filter(
    (p) => !p.folder || !folders.some((f) => f.name === p.folder),
  );

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[40px] tracking-tight">
            Your Game Plans
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnGhost} onClick={() => fileRef.current?.click()}>
            Import Plan
          </button>
          <button className={btnGhost} onClick={() => setModal('new')}>
            + New Folder
          </button>
          <button className={btnPrimary} onClick={() => openPlan(createTree())}>
            + New Plan
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              importPlan(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </div>
      {plans.length === 0 && folders.length === 0 ? (
        <div className="mt-16 border border-neutral-900 bg-[#FBF9F0]/90 px-6 py-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            No Plans Yet
          </p>
          <p className="mt-2 font-serif text-[24px] tracking-tight">
            Start mapping your A-game.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              className={`${btnPrimary} inline-flex items-center`}
              href="#/sample"
            >
              Start from Sample
            </a>
            <button className={btnGhost} onClick={() => openPlan(createTree())}>
              Blank Plan
            </button>
          </div>
        </div>
      ) : (
        <>
          {folders.length > 0 && (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((f) => (
                <FolderBox
                  key={f.name}
                  folder={f}
                  count={plans.filter((p) => p.folder === f.name).length}
                  onEdit={() => setModal(f)}
                />
              ))}
            </ul>
          )}
          {unfiled.length > 0 && (
            <>
              {folders.length > 0 && (
                <p className={`mt-12 ${monoLabel}`}>Unfiled</p>
              )}
              <ul
                className={`${
                  folders.length > 0 ? 'mt-3' : 'mt-10'
                } grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}
              >
                {unfiled.map((tree) => (
                  <PlanCard key={tree.id} tree={tree} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {modal && (
        <FolderModal
          folder={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </Shell>
  );
}

// folder page (#/f/<name>) — or every flow across folders when name is unset (#/flows)
export function FolderPage({ name }: { name?: string }) {
  const trees = useGraph((s) => s.trees);
  const folders = useGraph((s) => s.folders);
  const createTree = useGraph((s) => s.createTree);
  const setTreeFolder = useGraph((s) => s.setTreeFolder);
  const folder = name ? folders.find((f) => f.name === name) : undefined;
  const missing = Boolean(name) && !folder;
  useEffect(() => {
    if (missing) window.location.hash = '#/plans';
  }, [missing]);
  if (missing) return null;

  const plans = Object.values(trees)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((p) => !name || p.folder === name);

  return (
    <Shell>
      {/* back link only on a specific folder; All Flows is its own top-level tab */}
      {name && (
        <a
          href="#/plans"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900 bg-[#F3EFE2] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]"
        >
          ← All Plans
        </a>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[32px] tracking-tight">
          {name ?? 'All Flows'}
        </h1>
        <button
          className={btnPrimary}
          onClick={() => {
            const id = createTree();
            if (name) setTreeFolder(id, name); // born filed in this folder
            openPlan(id);
          }}
        >
          + New Plan
        </button>
      </div>
      {folder?.info && (
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-700">
          {folder.info}
        </p>
      )}
      <p className={`mt-2 ${monoLabel}`}>
        {plans.length} {plans.length === 1 ? 'flow' : 'flows'}
      </p>
      {plans.length === 0 ? (
        <p className={`mt-10 ${monoLabel}`}>
          Nothing here yet — start one above, or file plans from the Plans page.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((tree) => (
            <PlanCard key={tree.id} tree={tree} />
          ))}
        </ul>
      )}
    </Shell>
  );
}

// crop-marked khaki box with a tab, echoing the landing page blurb box
function FolderBox({
  folder,
  count,
  onEdit,
}: {
  folder: Folder;
  count: number;
  onEdit: () => void;
}) {
  const deleteFolder = useGraph((s) => s.deleteFolder);
  const setTreeFolder = useGraph((s) => s.setTreeFolder);
  const [over, setOver] = useState(false);

  return (
    <li
      // flex column so a notes-less box still fills its grid row
      className="group relative flex cursor-pointer flex-col"
      onClick={() =>
        (window.location.hash = `#/f/${encodeURIComponent(folder.name)}`)
      }
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        // dragleave also fires when entering a child — only clear on real exit
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) setTreeFolder(id, folder.name);
      }}
    >
      {/* folder tab */}
      <div
        className={`h-4 w-24 rounded-t-md transition-colors ${
          over ? 'bg-[#52E5D8]' : 'bg-[#CDC7AE]'
        }`}
      />
      <div
        className={`flex-1 px-5 py-4 transition-colors ${
          over ? 'bg-[#52E5D8]/60' : 'bg-[#CDC7AE]'
        }`}
      >
        <div className="flex items-baseline justify-between border-b border-neutral-500/40 pb-2">
          <h2 className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[19px] text-neutral-900">
            {folder.name}
          </h2>
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              className={`${iconBtn} hover:border-neutral-500 hover:text-black`}
              title="Edit folder"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              ✎
            </button>
            <button
              className={`${iconBtn} hover:border-red-500 hover:text-red-500`}
              title="Delete folder"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete folder "${folder.name}"? Its flows are kept.`))
                  deleteFolder(folder.name);
              }}
            >
              ×
            </button>
          </div>
        </div>
        {folder.info && (
          <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-relaxed text-neutral-700">
            {folder.info}
          </p>
        )}
        <p className={`mt-2 ${monoLabel}`}>
          {count} {count === 1 ? 'flow' : 'flows'} · drag to file
        </p>
      </div>
    </li>
  );
}

function FolderModal({
  folder,
  onClose,
}: {
  folder: Folder | null;
  onClose: () => void;
}) {
  const createFolder = useGraph((s) => s.createFolder);
  const updateFolder = useGraph((s) => s.updateFolder);
  const [name, setName] = useState(folder?.name ?? '');
  const [info, setInfo] = useState(folder?.info ?? '');

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (folder) updateFolder(folder.name, n, info);
    else createFolder(n, info);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <form
        className="w-full max-w-sm rounded-xl border border-neutral-900 bg-[#F3EFE2] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Folder
        </p>
        <h2 className="mt-1 font-serif text-[24px] text-neutral-900">
          {folder ? 'Edit Folder' : 'New Folder'}
        </h2>
        <label className={`mt-5 block ${monoLabel}`}>
          Name
          <input
            className="mt-1 h-10 w-full rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 font-sans text-[14px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
            placeholder="e.g. Guard Play"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={`mt-4 block ${monoLabel}`}>
          Notes
          <textarea
            className="mt-1 w-full resize-none rounded-xl border border-neutral-900 bg-[#FBF9F0] px-4 py-2.5 font-sans text-[14px] normal-case leading-relaxed tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
            placeholder="What's this folder for? (optional)"
            rows={3}
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {folder ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PlanCard({ tree }: { tree: Tree }) {
  const folders = useGraph((s) => s.folders);
  const setTreeFolder = useGraph((s) => s.setTreeFolder);
  const renameTree = useGraph((s) => s.renameTree);
  const deleteTree = useGraph((s) => s.deleteTree);
  const [editing, setEditing] = useState(false);

  const commit = (value: string) => {
    renameTree(tree.id, value.trim() || tree.name);
    setEditing(false);
  };

  return (
    <li
      className="group relative rounded-xl border border-[#B7B098] bg-[#FBF9F0] transition-colors hover:border-neutral-900"
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tree.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="flex h-8 items-center justify-between rounded-t-xl border-b border-[#DCD6C1] bg-[#EFEBDC] px-3">
        {folders.length > 0 ? (
          // ponytail: native <select> is the folder menu — closed it doubles as the card's tag
          <select
            className="max-w-[110px] cursor-pointer appearance-none overflow-hidden text-ellipsis bg-transparent font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 outline-none hover:text-black"
            title="Move to folder"
            value={
              tree.folder && folders.some((f) => f.name === tree.folder)
                ? tree.folder
                : ''
            }
            onChange={(e) => setTreeFolder(tree.id, e.target.value || undefined)}
          >
            <option value="">Unfiled</option>
            {folders.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Plan
          </span>
        )}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className={`${iconBtn} hover:border-neutral-500 hover:text-black`}
            title="Rename"
            onClick={() => setEditing(true)}
          >
            ✎
          </button>
          <button
            className={`${iconBtn} hover:border-red-500 hover:text-red-500`}
            title="Delete"
            onClick={() => {
              if (confirm(`Delete "${tree.name}"?`)) deleteTree(tree.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div
        className="block w-full cursor-pointer px-4 py-4 text-left"
        onClick={() => {
          if (!editing) openPlan(tree.id);
        }}
      >
        {editing ? (
          <input
            className="w-full bg-transparent font-serif text-[17px] tracking-tight text-neutral-900 outline-none"
            defaultValue={tree.name}
            autoFocus
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[17px] tracking-tight">
            {tree.name}
          </span>
        )}
        <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          {tree.nodes.length} moves · {tree.edges.length} links
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          Updated {new Date(tree.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </li>
  );
}
