import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { MOVE_LIBRARY } from '../data/moves';
import { useGraph } from '../store';

export default function MoveLibrary() {
  const [open, setOpen] = useState(() => window.innerWidth >= 1024);
  const [query, setQuery] = useState('');
  const addMove = useGraph((s) => s.addMove);
  const { screenToFlowPosition } = useReactFlow();

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
      <button
        className="z-20 flex w-10 shrink-0 items-start justify-center border-r border-neutral-800 bg-black pt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-500 hover:bg-neutral-950 hover:text-white"
        onClick={() => setOpen(true)}
        title="Open move library"
      >
        <span className="[writing-mode:vertical-rl]">Move Library »</span>
      </button>
    );
  }

  return (
    <aside className="z-20 flex w-64 shrink-0 flex-col border-r border-neutral-800 bg-black">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-800 px-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Move Library
        </span>
        <button
          className="h-6 w-6 border border-neutral-800 font-mono text-[11px] leading-none text-neutral-400 hover:border-neutral-500 hover:text-white"
          onClick={() => setOpen(false)}
          title="Collapse"
        >
          «
        </button>
      </div>
      <input
        className="h-10 shrink-0 border-b border-neutral-800 bg-neutral-950 px-3 font-mono text-[11px] text-white outline-none placeholder:text-neutral-600"
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
            <summary className="sticky top-0 flex cursor-pointer list-none items-center justify-between border-b border-neutral-900 bg-black px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:text-white [&::-webkit-details-marker]:hidden">
              <span>{category}</span>
              <span className="flex items-center gap-2 text-neutral-600">
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
                className="block w-full cursor-grab px-3 py-1.5 text-left text-[13px] tracking-tight text-neutral-300 hover:bg-neutral-900 hover:text-white active:cursor-grabbing"
                title="Drag onto canvas, or click to add"
              >
                {move}
              </button>
            ))}
          </details>
        ))}
        {groups.length === 0 && (
          <p className="px-3 py-4 font-mono text-[11px] text-neutral-600">
            No moves match “{query.trim()}”.
          </p>
        )}
      </div>
      <p className="shrink-0 border-t border-neutral-800 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">
        Drag onto canvas · click to add
      </p>
    </aside>
  );
}
