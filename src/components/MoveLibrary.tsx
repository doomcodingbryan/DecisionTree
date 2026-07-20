import { useReactFlow } from '@xyflow/react';
import { useRef, useState } from 'react';
import { MOVE_LIBRARY, moveMatches } from '../data/moves';
import { useGraph } from '../store';

const actionBtn =
  'h-7 rounded-full border border-neutral-900 bg-[#F7F4E8] px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2] disabled:pointer-events-none disabled:opacity-35';

export default function MoveLibrary() {
  const [open, setOpen] = useState(() => window.innerWidth >= 1024);
  const [query, setQuery] = useState('');
  const addMove = useGraph((s) => s.addMove);
  const nodes = useGraph((s) => s.nodes);
  const edges = useGraph((s) => s.edges);
  const planName = useGraph(
    (s) => (s.activeId ? s.trees[s.activeId]?.name : undefined) ?? 'Untitled Plan',
  );
  const activeId = useGraph((s) => s.activeId);
  const renameTree = useGraph((s) => s.renameTree);
  const [editingName, setEditingName] = useState(false);
  // back where you came from: the plan's folder page, or the plans list
  const planFolder = useGraph((s) =>
    s.activeId ? s.trees[s.activeId]?.folder : undefined,
  );
  const backHref = planFolder
    ? `#/f/${encodeURIComponent(planFolder)}`
    : '#/plans';
  const undo = useGraph((s) => s.undo);
  const redo = useGraph((s) => s.redo);
  const canUndo = useGraph((s) => s.past.length > 0);
  const canRedo = useGraph((s) => s.future.length > 0);
  const clear = useGraph((s) => s.clear);
  const load = useGraph((s) => s.load);
  const favorites = useGraph((s) => s.favorites);
  const toggleFavorite = useGraph((s) => s.toggleFavorite);
  const favSet = new Set(favorites);
  const fileRef = useRef<HTMLInputElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const exportJson = () => {
    const url = URL.createObjectURL(
      // name travels with the file so importing on the Plans page keeps it
      new Blob([JSON.stringify({ name: planName, nodes, edges }, null, 2)], {
        type: 'application/json',
      }),
    );
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${
        planName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
        'plan'
      }.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { nodes, edges } = JSON.parse(await file.text());
      if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error();
      if (
        useGraph.getState().nodes.length &&
        !confirm('Replace the current plan with the imported graph?')
      )
        return;
      load(nodes, edges);
      setTimeout(() => fitView({ padding: 0.2 }), 0);
    } catch {
      alert('Invalid graph JSON.');
    }
  };

  const q = query.trim().toLowerCase();
  const groups = Object.entries(MOVE_LIBRARY)
    .map(
      ([category, moves]) =>
        [
          category,
          q ? moves.filter((m) => moveMatches(m, q)) : moves,
        ] as const,
    )
    .filter(([, moves]) => moves.length > 0);
  const favMoves = q
    ? favorites.filter((m) => moveMatches(m, q))
    : favorites;

  // a move row: drag/click to add, plus a heart to (un)favorite
  const moveRow = (move: string) => (
    <div key={move} className="group/mv flex items-center pr-1 hover:bg-[#EAE5D3]">
      <button
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', move);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        onClick={() => addAtCenter(move)}
        className="flex-1 cursor-grab px-3 py-1.5 text-left text-[13px] tracking-tight text-neutral-700 hover:text-black active:cursor-grabbing"
        title="Drag onto canvas, or click to add"
      >
        {move}
      </button>
      <button
        onClick={() => toggleFavorite(move)}
        title={favSet.has(move) ? 'Unfavorite' : 'Favorite'}
        className={`px-1.5 text-[12px] leading-none transition-opacity ${
          favSet.has(move)
            ? 'text-red-500 opacity-100'
            : 'text-neutral-400 opacity-0 hover:text-red-500 group-hover/mv:opacity-100'
        }`}
      >
        {favSet.has(move) ? '♥' : '♡'}
      </button>
    </div>
  );

  const addAtCenter = (label: string) => {
    const p = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addMove(
      { x: Math.round(p.x / 24) * 24, y: Math.round(p.y / 24) * 24 },
      label,
    );
  };

  if (!open) {
    return (
      <div className="z-20 flex w-10 shrink-0 flex-col border-r border-neutral-900 bg-[#F7F4E8]">
        <a
          href={backHref}
          className="flex h-10 w-full items-center justify-center border-b border-neutral-900 font-mono text-[17px] leading-none text-neutral-900 hover:bg-neutral-900 hover:text-[#F3EFE2]"
          title={planFolder ? `Back to ${planFolder}` : 'All plans'}
        >
          ←
        </a>
        <button
          className="flex w-full flex-1 items-start justify-center pt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-500 hover:bg-[#EFEBDC] hover:text-black"
          onClick={() => setOpen(true)}
          title="Open move library"
        >
          <span className="[writing-mode:vertical-rl]">Move Library »</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="z-20 flex w-64 shrink-0 flex-col border-r border-neutral-900 bg-[#F7F4E8]">
      <div className="shrink-0 border-b border-[#DCD6C1] px-3 py-2.5">
        <a
          href={backHref}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-900 bg-[#F3EFE2] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]"
        >
          ← {planFolder ?? 'All Plans'}
        </a>
        {editingName ? (
          <input
            className="mt-0.5 w-full bg-transparent font-serif text-[18px] leading-snug text-neutral-900 outline-none"
            defaultValue={planName}
            autoFocus
            onFocus={(e) => e.target.select()}
            onBlur={(e) => {
              if (activeId) renameTree(activeId, e.target.value.trim() || planName);
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditingName(false);
            }}
          />
        ) : (
          <button
            className="mt-0.5 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-left font-serif text-[18px] leading-snug text-neutral-900"
            title="Rename plan"
            onClick={() => setEditingName(true)}
          >
            {planName}
          </button>
        )}
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
          {nodes.length} nodes · {edges.length} links
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <button className={actionBtn} disabled={!canUndo} onClick={undo} title="Undo (⌘Z)">
            Undo
          </button>
          <button className={actionBtn} disabled={!canRedo} onClick={redo} title="Redo (⇧⌘Z)">
            Redo
          </button>
          <button className={actionBtn} onClick={exportJson}>
            Export
          </button>
          <button className={actionBtn} onClick={() => fileRef.current?.click()}>
            Import
          </button>
          <button
            className={actionBtn}
            onClick={() => {
              if (confirm('Clear the entire canvas?')) clear();
            }}
          >
            Clear
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            importJson(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#DCD6C1] px-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Move Library
        </span>
        <button
          className="h-6 w-6 rounded-full border border-neutral-900 font-mono text-[11px] leading-none text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]"
          onClick={() => setOpen(false)}
          title="Collapse"
        >
          «
        </button>
      </div>
      <div className="shrink-0 border-b border-[#DCD6C1] px-3 py-2">
        <input
          className="h-8 w-full rounded-full border border-neutral-900 bg-[#FBF9F0] px-3.5 font-mono text-[11px] text-neutral-900 outline-none placeholder:text-neutral-400"
          placeholder="Search moves…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* starred moves pinned to the top for quick reach while building */}
        {favMoves.length > 0 && (
          <details open className="group">
            <summary className="sticky top-0 z-10 flex cursor-pointer list-none items-center justify-between border-b border-[#E7E1CE] bg-[#F7F4E8] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:bg-[#EFEBDC] hover:text-black [&::-webkit-details-marker]:hidden">
              <span className="text-red-500">♥ Favorites</span>
              <span className="flex items-center gap-2 text-neutral-400">
                {favMoves.length}
                <span className="transition-transform group-open:rotate-90">›</span>
              </span>
            </summary>
            {favMoves.map(moveRow)}
          </details>
        )}
        {groups.map(([category, moves]) => (
          // ponytail: native <details> accordion — collapsed by default kills the
          // scrolling; the q-suffixed key remounts so searches always open and
          // clearing the search re-collapses everything
          <details
            key={category + (q ? '-search' : '')}
            open={Boolean(q)}
            className="group"
          >
            <summary className="sticky top-0 flex cursor-pointer list-none items-center justify-between border-b border-[#E7E1CE] bg-[#F7F4E8] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:bg-[#EFEBDC] hover:text-black [&::-webkit-details-marker]:hidden">
              <span>{category}</span>
              <span className="flex items-center gap-2 text-neutral-400">
                {moves.length}
                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </span>
            </summary>
            {moves.map(moveRow)}
          </details>
        ))}
        {groups.length === 0 && (
          <p className="px-3 py-4 font-mono text-[11px] text-neutral-400">
            No moves match “{query.trim()}”.
          </p>
        )}
      </div>
      <p className="shrink-0 border-t border-[#DCD6C1] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
        Drag onto canvas · click to add
      </p>
    </aside>
  );
}
