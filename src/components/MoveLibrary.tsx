import { useReactFlow } from '@xyflow/react';
import { useRef, useState } from 'react';
import { MOVE_LIBRARY } from '../data/moves';
import { useGraph } from '../store';

const actionBtn =
  'h-7 border border-neutral-300 bg-white px-2 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50 hover:text-black disabled:pointer-events-none disabled:opacity-35';

export default function MoveLibrary() {
  const [open, setOpen] = useState(() => window.innerWidth >= 1024);
  const [query, setQuery] = useState('');
  const addMove = useGraph((s) => s.addMove);
  const nodes = useGraph((s) => s.nodes);
  const edges = useGraph((s) => s.edges);
  const planName = useGraph(
    (s) => (s.activeId ? s.trees[s.activeId]?.name : undefined) ?? 'Untitled Plan',
  );
  const undo = useGraph((s) => s.undo);
  const redo = useGraph((s) => s.redo);
  const canUndo = useGraph((s) => s.past.length > 0);
  const canRedo = useGraph((s) => s.future.length > 0);
  const clear = useGraph((s) => s.clear);
  const load = useGraph((s) => s.load);
  const fileRef = useRef<HTMLInputElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const exportJson = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
        type: 'application/json',
      }),
    );
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'bjj-graph.json',
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
          q ? moves.filter((m) => m.toLowerCase().includes(q)) : moves,
        ] as const,
    )
    .filter(([, moves]) => moves.length > 0);

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
      <div className="z-20 flex w-10 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <a
          href="#/"
          className="flex h-10 w-full items-center justify-center border-b border-neutral-200 font-mono text-[13px] text-neutral-500 hover:bg-neutral-50 hover:text-black"
          title="All plans"
        >
          ←
        </a>
        <button
          className="flex w-full flex-1 items-start justify-center pt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-500 hover:bg-neutral-50 hover:text-black"
          onClick={() => setOpen(true)}
          title="Open move library"
        >
          <span className="[writing-mode:vertical-rl]">Move Library »</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="z-20 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="shrink-0 border-b border-neutral-200 px-3 py-2.5">
        <a
          href="#/"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black"
        >
          ← All Plans
        </a>
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] tracking-tight text-neutral-900">
          {planName}
        </p>
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
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-neutral-200 px-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Move Library
        </span>
        <button
          className="h-6 w-6 border border-neutral-300 font-mono text-[11px] leading-none text-neutral-500 hover:border-neutral-500 hover:text-black"
          onClick={() => setOpen(false)}
          title="Collapse"
        >
          «
        </button>
      </div>
      <input
        className="h-10 shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 font-mono text-[11px] text-neutral-900 outline-none placeholder:text-neutral-400"
        placeholder="Search moves…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex-1 overflow-y-auto">
        {groups.map(([category, moves]) => (
          // ponytail: native <details> accordion — collapsed by default kills the
          // scrolling; the q-suffixed key remounts so searches always open and
          // clearing the search re-collapses everything
          <details
            key={category + (q ? '-search' : '')}
            open={Boolean(q)}
            className="group"
          >
            <summary className="sticky top-0 flex cursor-pointer list-none items-center justify-between border-b border-neutral-100 bg-white px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black [&::-webkit-details-marker]:hidden">
              <span>{category}</span>
              <span className="flex items-center gap-2 text-neutral-400">
                {moves.length}
                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </span>
            </summary>
            {moves.map((move) => (
              <button
                key={move}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', move);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => addAtCenter(move)}
                className="block w-full cursor-grab px-3 py-1.5 text-left text-[13px] tracking-tight text-neutral-700 hover:bg-neutral-100 hover:text-black active:cursor-grabbing"
                title="Drag onto canvas, or click to add"
              >
                {move}
              </button>
            ))}
          </details>
        ))}
        {groups.length === 0 && (
          <p className="px-3 py-4 font-mono text-[11px] text-neutral-400">
            No moves match “{query.trim()}”.
          </p>
        )}
      </div>
      <p className="shrink-0 border-t border-neutral-200 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
        Drag onto canvas · click to add
      </p>
    </aside>
  );
}
