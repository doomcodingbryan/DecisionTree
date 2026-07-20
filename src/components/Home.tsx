import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGraph, type Folder, type Tree } from '../store';
import ConfirmModal from './ConfirmModal';
import {
  MOVE_LIBRARY,
  ALL_MOVES,
  MOVE_CATEGORY,
  moveMatches,
  moveTags,
  moveInstructors,
} from '../data/moves';
import {
  analyzeFlow,
  coachingTips,
  simulateMatch,
  type FlowStats,
  type Match,
} from '../battle';
import { PRESETS, type Preset } from '../data/presets';
import {
  getVideos,
  mergeVideos,
  parseYouTubeId,
  saveVideo,
  youtubeSearch,
} from '../video';

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
        // collapsed rail, echoing the move library's. sticky + viewport height
        // so mt-auto pins the account avatar to the screen bottom, not the page's
        <aside className="flex shrink-0 items-center gap-3 md:sticky md:top-5 md:h-[calc(100vh-2.5rem)] md:w-8 md:flex-col md:self-start md:overflow-y-auto md:py-2">
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
            className="mt-auto hidden h-8 w-8 items-center justify-center rounded-full border border-neutral-900 bg-[#52E5D8] font-serif text-[15px] text-neutral-900 md:flex"
            style={beltStyle()}
          >
            {user[0]?.toUpperCase()}
          </a>
        </aside>
      ) : (
      <aside className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 md:sticky md:top-5 md:h-[calc(100vh-2.5rem)] md:w-56 md:flex-col md:flex-nowrap md:items-stretch md:self-start md:overflow-y-auto md:py-2">
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
            onAccount ? 'bg-[#EFEBDC]' : 'bg-[#F3EFE2] hover:bg-[#EFEBDC]'
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

// per-category badge color, muted for the paper theme (blue/purple echo the belts)
const CATEGORY_COLOR: Record<string, string> = {
  Positions: 'bg-[#E4E7EA] text-[#41505C]',
  Guards: 'bg-[#DBE6F1] text-[#2B5DA8]',
  Passes: 'bg-[#F1E4D2] text-[#94611F]',
  Sweeps: 'bg-[#DCEAD8] text-[#3F6B4A]',
  Submissions: 'bg-[#E7DEF1] text-[#6B4FA0]',
  Takedowns: 'bg-[#E1DDF0] text-[#4A3F8A]',
  Escapes: 'bg-[#D3ECE8] text-[#1F7A6E]',
};
const catBadge = (m: string) => (
  <span
    className={`inline-block rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${
      CATEGORY_COLOR[MOVE_CATEGORY[m]] ?? 'bg-[#E7E2D0] text-neutral-600'
    }`}
  >
    {MOVE_CATEGORY[m]}
  </span>
);
// gear/position tag chip; Gi/No-Gi get a faint teal tint to stand apart
const tagChip = (t: string) => (
  <span
    key={t}
    className={`rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-wide ${
      t === 'Gi' || t === 'No-Gi'
        ? 'border-[#BFD8D2] bg-[#DFEFEB] text-[#1F7A6E]'
        : 'border-[#DCD6C1] bg-[#EFEBDC] text-neutral-500'
    }`}
  >
    {t}
  </span>
);

// #/library — whitebeltclub-style catalog: a sortable technique table (or a
// grid), category-badged, each row opening a video reference.
export function LibraryPage() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [sort, setSort] = useState<{ key: 'name' | 'cat'; dir: 1 | -1 } | null>(
    null,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, string>>(() => getVideos());
  const favs = useGraph((s) => s.favorites);
  const toggleFavorite = useGraph((s) => s.toggleFavorite);
  const favSet = new Set(favs);
  const needle = q.trim().toLowerCase();

  const source = cat ? MOVE_LIBRARY[cat] : ALL_MOVES;
  let moves = needle ? source.filter((m) => moveMatches(m, needle)) : source;
  if (onlyFavs) moves = moves.filter((m) => favSet.has(m));

  // sort is opt-in; default keeps the curated category-grouped order
  const catOrder = Object.keys(MOVE_LIBRARY);
  const rows = sort
    ? [...moves].sort((a, b) =>
        sort.key === 'name'
          ? a.localeCompare(b) * sort.dir
          : ((catOrder.indexOf(MOVE_CATEGORY[a]) -
              catOrder.indexOf(MOVE_CATEGORY[b])) ||
              a.localeCompare(b)) * sort.dir,
      )
    : moves;

  const attach = (move: string, id: string | null) => {
    saveVideo(move, id);
    setVideos(getVideos());
  };
  const clickSort = (key: 'name' | 'cat') =>
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 },
    );
  const arrow = (key: 'name' | 'cat') =>
    sort?.key === key ? (sort.dir === 1 ? '↑' : '↓') : '↕';

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
  // shared column template so header and rows stay aligned:
  // Technique | Instructors | Category | Tags
  const cols =
    'grid grid-cols-[minmax(150px,1.6fr)_minmax(110px,1fr)_112px_minmax(140px,1.4fr)] items-center gap-3';
  const headCell =
    'font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500';
  const flip = toggleFavorite;

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
        <button
          className={filterPill(onlyFavs)}
          onClick={() => setOnlyFavs((v) => !v)}
        >
          ♥ Favorites · {favs.length}
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className={monoLabel}>
          {rows.length} {rows.length === 1 ? 'move' : 'moves'}
        </p>
        <div className="flex gap-1.5">
          <button className={viewBtn(view === 'table')} onClick={() => setView('table')}>
            Table
          </button>
          <button className={viewBtn(view === 'grid')} onClick={() => setView('grid')}>
            Grid
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={`mt-8 ${monoLabel}`}>
          {onlyFavs && !needle
            ? 'No favorites yet — tap the heart on a move to save it here.'
            : `No moves match “${q.trim()}”.`}
        </p>
      ) : view === 'grid' ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <li key={m}>
              <button
                className="w-full rounded-xl border border-[#B7B098] bg-[#FBF9F0] px-4 py-3.5 text-left transition-colors hover:border-neutral-900"
                onClick={() => setSelected(m)}
              >
                <span className="flex items-center justify-between gap-2">
                  {catBadge(m)}
                  {videos[m] && (
                    <span className="font-mono text-[11px] leading-none text-neutral-500">
                      ▶
                    </span>
                  )}
                </span>
                <span className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[16px] tracking-tight text-neutral-900">
                  {m}
                </span>
                {moveInstructors(m).length > 0 && (
                  <span className="mt-1 block truncate font-sans text-[11px] text-neutral-500">
                    {moveInstructors(m).join(', ')}
                  </span>
                )}
                <span className="mt-2 flex flex-wrap gap-1">
                  {moveTags(m).map(tagChip)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[640px]">
            {/* header row shares `cols` with the data rows so columns line up */}
            <div className={`${cols} border-b border-neutral-900 px-2 pb-2`}>
              <button
                className={`${headCell} flex items-center gap-1 text-left hover:text-neutral-900`}
                onClick={() => clickSort('name')}
              >
                Technique <span className="text-neutral-400">{arrow('name')}</span>
              </button>
              <span className={headCell}>Instructors</span>
              <button
                className={`${headCell} flex items-center gap-1 text-left hover:text-neutral-900`}
                onClick={() => clickSort('cat')}
              >
                Category <span className="text-neutral-400">{arrow('cat')}</span>
              </button>
              <span className={headCell}>Tags</span>
            </div>
            {rows.map((m) => {
              const instructors = moveInstructors(m);
              return (
                <div
                  key={m}
                  role="button"
                  tabIndex={0}
                  className={`${cols} group cursor-pointer border-b border-[#DCD6C1] px-2 py-2.5 outline-none transition-colors last:border-0 hover:bg-[#FBF9F0] focus-visible:bg-[#FBF9F0]`}
                  onClick={() => setSelected(m)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(m);
                    }
                  }}
                >
                  {/* technique + hover cluster: video ▶, favorite, open */}
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-serif text-[15px] text-neutral-900">
                      {m}
                    </span>
                    {videos[m] && (
                      <span
                        className="shrink-0 font-mono text-[10px] leading-none text-[#1F7A6E]"
                        title="Has a video"
                      >
                        ▶
                      </span>
                    )}
                    <button
                      className={`shrink-0 text-[13px] leading-none transition-opacity ${
                        favSet.has(m)
                          ? 'text-red-500 opacity-100'
                          : 'text-neutral-400 opacity-0 hover:text-red-500 group-hover:opacity-100'
                      }`}
                      title={favSet.has(m) ? 'Remove favorite' : 'Add to favorites'}
                      onClick={(e) => {
                        e.stopPropagation();
                        flip(m);
                      }}
                    >
                      {favSet.has(m) ? '♥' : '♡'}
                    </button>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100">
                      Open
                    </span>
                  </span>
                  {/* instructors */}
                  <span className="min-w-0 truncate font-sans text-[12px] text-neutral-600">
                    {instructors.length ? (
                      instructors.join(', ')
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </span>
                  {/* category */}
                  <span>{catBadge(m)}</span>
                  {/* tags */}
                  <span className="flex flex-wrap gap-1">
                    {moveTags(m).map(tagChip)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
                className={`${btnGhost} inline-flex items-center`}
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

// #/battle — local head-to-head, two modes. Lobby: challenge a built-in
// grappler ("someone else"). My Flows: spar two of your own plans. No backend,
// so the "lobby" is a fixed roster of characters, each backed by a Discover flow.
const rivalTree = (p: Preset, name: string): Tree => ({
  id: `__preset_${p.name}`,
  name,
  nodes: p.nodes,
  edges: p.edges,
  updatedAt: 0,
});

type Opponent = { id: string; name: string; belt: string; blurb: string; flow: Tree };
// a belt-ranked persona per preset — the grappler whose game IS that flow
const PERSONAS: Record<string, { name: string; belt: string; blurb: string }> = {
  'White Belt Fundamentals': {
    name: 'Riley',
    belt: 'White',
    blurb: 'Textbook survivor — escapes first, then the basic finishes.',
  },
  'Closed Guard Attacks': {
    name: 'Sofia',
    belt: 'Blue',
    blurb: 'Guard player hunting the armbar–triangle trap.',
  },
  'Wrestle to Mount': {
    name: 'Marcus',
    belt: 'Purple',
    blurb: 'Wrestler — heavy top pressure straight to mount.',
  },
  'Leg Lock Entries': {
    name: 'Dex',
    belt: 'Brown',
    blurb: 'Leg locker — dives for the ashi and inverts to the saddle.',
  },
  'Back Attacks': {
    name: 'Kaito',
    belt: 'Black',
    blurb: 'Seatbelt to the back, chokes waiting on both sides.',
  },
};
const LOBBY: Opponent[] = PRESETS.filter((p) => PERSONAS[p.name]).map((p) => {
  const persona = PERSONAS[p.name];
  return { id: `__op_${p.name}`, ...persona, flow: rivalTree(p, persona.name) };
});

const beltAvatar = (name: string, belt: string) => {
  const b = BELTS[belt];
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-900 bg-[#52E5D8] font-serif text-[17px]"
      style={b ? { backgroundColor: b.bg, color: b.fg } : undefined}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
};

// app-styled dropdown for picking a plan — a button + floating popover,
// closing on outside-click or Escape. Replaces the native <select>.
function PlanSelect({
  plans,
  value,
  onChange,
}: {
  plans: Tree[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = plans.find((t) => t.id === value) ?? plans[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mt-2 max-w-xs">
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between gap-2 rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 text-left transition-colors hover:bg-[#EFEBDC]"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[14px] tracking-tight text-neutral-900">
          {current?.name ?? 'Select a plan'}
        </span>
        <span
          className={`shrink-0 font-mono text-[11px] leading-none text-neutral-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-64 overflow-auto rounded-xl border border-neutral-900 bg-[#FBF9F0] py-1 shadow-xl">
          {plans.map((t) => {
            const active = t.id === value;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${
                    active ? 'bg-[#EFEBDC]' : 'hover:bg-[#EAE5D3]'
                  }`}
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                >
                  <span className="w-3 shrink-0 font-mono text-[11px] leading-none text-neutral-900">
                    {active ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[14px] tracking-tight text-neutral-900">
                    {t.name}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                    {t.nodes.length} mv
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function BattlePage() {
  const trees = useGraph((s) => s.trees);
  const plans = Object.values(trees).sort((a, b) => b.updatedAt - a.updatedAt);
  const [mode, setMode] = useState<'lobby' | 'flows'>('lobby');
  const [youId, setYouId] = useState(plans[0]?.id ?? '');
  const [oppId, setOppId] = useState(plans[1]?.id ?? plans[0]?.id ?? '');
  const [result, setResult] = useState<
    { match: Match; you: Tree; opp: Tree } | null
  >(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const you = plans.find((t) => t.id === youId) ?? plans[0];
  const showResult = (opp: Tree) => {
    if (!you) return;
    setResult({ match: simulateMatch(you, opp), you, opp });
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    );
  };
  const fightFlows = () => {
    const opp = plans.find((t) => t.id === oppId);
    if (opp) showResult(opp);
  };
  const switchMode = (m: 'lobby' | 'flows') => {
    setMode(m);
    setResult(null);
  };

  const modePill = (m: 'lobby' | 'flows', label: string) => (
    <button
      className={`h-9 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
        mode === m
          ? 'border-neutral-900 bg-neutral-900 text-[#F3EFE2]'
          : 'border-[#B7B098] text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
      }`}
      onClick={() => switchMode(m)}
    >
      {label}
    </button>
  );

  // per-mode guidance: a one-line caption + numbered steps for the tab's flow
  const modeCaption =
    mode === 'lobby'
      ? 'Face a built-in grappler — each is a real game plan wearing a belt. Beat one and the next belt is waiting.'
      : 'Spar two of your own plans head-to-head to see which game holds up.';
  const steps =
    mode === 'lobby'
      ? ['Pick your fighter', 'Challenge a grappler', 'Read the scouting report']
      : ['Pick your fighter', 'Pick a sparring plan', 'Compare the two games'];

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
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-600">
            Pressure-test a game plan by simulating scrambles against an
            opponent — no live sparring partner needed. Pick a plan, choose who
            to face, and read the scouting report.
          </p>

          <div className="mt-6 flex gap-1.5">
            {modePill('lobby', 'Lobby')}
            {modePill('flows', 'My Flows')}
          </div>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-neutral-600">
            {modeCaption}
          </p>

          {/* numbered clues so the tab's flow is obvious at a glance */}
          <ol className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 text-neutral-900">
                  {i + 1}
                </span>
                <span>{s}</span>
                {i < steps.length - 1 && (
                  <span className="text-neutral-300">→</span>
                )}
              </li>
            ))}
          </ol>

          {/* step 1 — your fighter, shared across both modes */}
          <div className="mt-8">
            <p className={monoLabel}>Your Fighter</p>
            <PlanSelect plans={plans} value={youId} onChange={setYouId} />
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              The plan you’ll run in the match.
            </p>
          </div>

          {mode === 'lobby' ? (
            <>
              <div className="mt-8 flex items-baseline justify-between gap-3">
                <p className={monoLabel}>Step 2 · Choose an Opponent</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                  Tap Challenge to simulate
                </p>
              </div>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {LOBBY.map((op) => (
                  <li
                    key={op.id}
                    className="flex flex-col rounded-xl border border-[#B7B098] bg-[#FBF9F0] p-4"
                  >
                    <div className="flex items-center gap-3">
                      {beltAvatar(op.name, op.belt)}
                      <div className="min-w-0">
                        <h3 className="font-serif text-[18px] tracking-tight">
                          {op.name}
                        </h3>
                        <p className={monoLabel}>{op.belt} Belt</p>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-neutral-600">
                      {op.blurb}
                    </p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                      {op.flow.nodes.length} moves · {op.flow.edges.length} links
                    </p>
                    <button
                      className={`${btnPrimary} mt-3`}
                      title={`Simulate a match: ${you?.name ?? 'your fighter'} vs ${op.name}`}
                      onClick={() => showResult(op.flow)}
                    >
                      Challenge
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="mt-8">
                <p className={monoLabel}>Step 2 · Opponent Plan</p>
                <PlanSelect plans={plans} value={oppId} onChange={setOppId} />
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                  The plan you’ll test it against.
                </p>
              </div>
              {plans.length < 2 && (
                <p className="mt-4 max-w-md rounded-xl border border-[#B7B098] bg-[#FBF9F0] px-4 py-3 text-[13px] leading-relaxed text-neutral-600">
                  You’ve only got one plan — make another on the{' '}
                  <a className="underline hover:text-neutral-900" href="#/plans">
                    Plans page
                  </a>{' '}
                  to spar your own games against each other.
                </p>
              )}
              <button
                className={`${btnPrimary} mt-6 disabled:pointer-events-none disabled:opacity-40`}
                disabled={plans.length < 2}
                onClick={fightFlows}
              >
                {result ? 'Rematch' : 'Simulate Match'}
              </button>
            </>
          )}

          {result && (
            <div ref={resultRef}>
              <BattleResult
                match={result.match}
                you={result.you}
                opp={result.opp}
              />
            </div>
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
          Result · {you.name} vs {opp.name}
        </p>
        <h2 className="mt-1 font-serif text-[28px] tracking-tight">{title}</h2>
        <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.16em] text-neutral-700">
          {match.youWins} – {match.oppWins} · rounds won
        </p>
      </div>
      <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-neutral-500">
        {match.rounds.length} scrambles simulated. Each fighter runs their plan
        from a starting position until someone lands a submission — the deeper,
        more finish-heavy game tends to win.
      </p>
      <p className={`mt-6 ${monoLabel}`}>Scouting Report</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <BattleStat name={you.name} s={ys} won={match.winner === 'you'} />
        <BattleStat name={opp.name} s={os} won={match.winner === 'opp'} />
      </div>
      <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-neutral-400">
        Power = overall score · Subs = finishing threats · Depth = longest chain ·
        Moves = total nodes
      </p>
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
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
        How each scramble ended, and who took it.
      </p>
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
            <button
              className={`${btnPrimary} mt-3`}
              title={`Copy “${p.name}” into your plans so you can edit it`}
              onClick={() => add(p)}
            >
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
      const { name, nodes, edges, videos } = JSON.parse(await file.text());
      if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error();
      const fallback = file.name.replace(/\.json$/i, '').replace(/-+/g, ' ').trim();
      const planName =
        typeof name === 'string' && name.trim()
          ? name.trim()
          : fallback || 'Imported Plan';
      if (videos && typeof videos === 'object') mergeVideos(videos);
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
  const [confirming, setConfirming] = useState(false);

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
              title={`Edit “${folder.name}”`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              ✎
            </button>
            <button
              className={`${iconBtn} hover:border-red-500 hover:text-red-500`}
              title={`Delete “${folder.name}”`}
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(true);
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
      {confirming && (
        <ConfirmModal
          title="Delete folder?"
          body={`“${folder.name}” will be removed. Its ${count} ${
            count === 1 ? 'flow is' : 'flows are'
          } kept and moved to Unfiled.`}
          onConfirm={() => deleteFolder(folder.name)}
          onClose={() => setConfirming(false)}
        />
      )}
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
  const [confirming, setConfirming] = useState(false);

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
            title={`Rename “${tree.name}”`}
            onClick={() => setEditing(true)}
          >
            ✎
          </button>
          <button
            className={`${iconBtn} hover:border-red-500 hover:text-red-500`}
            title={`Delete “${tree.name}”`}
            onClick={() => setConfirming(true)}
          >
            ×
          </button>
        </div>
      </div>
      <div
        className="block w-full cursor-pointer px-4 py-4 text-left"
        title={`Open “${tree.name}”`}
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
      {confirming && (
        <ConfirmModal
          title="Delete plan?"
          body={`“${tree.name}” and its ${tree.nodes.length} ${
            tree.nodes.length === 1 ? 'move' : 'moves'
          } will be removed. This can’t be undone.`}
          onConfirm={() => deleteTree(tree.id)}
          onClose={() => setConfirming(false)}
        />
      )}
    </li>
  );
}
