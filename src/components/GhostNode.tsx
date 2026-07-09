import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useGraph, type GhostNode as GhostNodeType } from '../store';
import { ALL_MOVES } from '../data/moves';

// Half-opacity suggestion card. ✓ materializes it as a real move exactly
// where the ghost sits; ✗ dismisses the suggestion for this session. The
// `custom` variant is a pick-your-own card with a search input.
export default function GhostNode({
  data,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<GhostNodeType>) {
  const addChild = useGraph((s) => s.addChild);
  const dismiss = useGraph((s) => s.dismissSuggestion);
  const spawn = (label?: string) =>
    addChild(data.parentId, label, {
      x: positionAbsoluteX,
      y: positionAbsoluteY,
    });

  if (data.custom) return <CustomGhost spawn={spawn} />;

  return (
    <div
      className="relative opacity-50 transition-opacity hover:opacity-90"
      style={{
        width: 208,
        height: 88,
        background: '#0A0A0A',
        border: '1px dashed #525252',
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-7 items-center border-b border-dashed border-neutral-800 bg-neutral-950 px-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Suggested
        </span>
      </div>
      <span
        className="absolute left-3 top-10 max-w-[176px] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] tracking-tight text-neutral-300"
        title={data.label}
      >
        {data.label}
      </span>
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          className="nodrag flex h-6 w-6 items-center justify-center border border-neutral-700 bg-neutral-950 font-mono text-[11px] leading-none text-neutral-300 hover:border-red-500 hover:text-red-400"
          title="Dismiss suggestion"
          onClick={(e) => {
            e.stopPropagation();
            dismiss(data.parentId, data.label);
          }}
        >
          ✗
        </button>
        <button
          className="nodrag flex h-6 w-6 items-center justify-center border border-white bg-white font-mono text-[11px] leading-none text-black hover:bg-neutral-200"
          title="Add this move"
          onClick={(e) => {
            e.stopPropagation();
            spawn(data.label);
          }}
        >
          ✓
        </button>
      </div>
      <GhostHandle />
    </div>
  );
}

function CustomGhost({ spawn }: { spawn: (label?: string) => void }) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  // the card survives a spawn (parent stays selected), so reset it
  const pick = (label?: string) => {
    spawn(label);
    setQuery('');
    setHighlight(0);
  };
  const q = query.trim().toLowerCase();
  const options = q
    ? ALL_MOVES.filter((m) => m.toLowerCase().includes(q)).slice(0, 6)
    : [];

  return (
    <div
      className="relative opacity-50 transition-opacity focus-within:opacity-95 hover:opacity-90"
      style={{
        width: 208,
        height: 88,
        background: '#0A0A0A',
        border: '1px dashed #525252',
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-7 items-center border-b border-dashed border-neutral-800 bg-neutral-950 px-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Your Move
        </span>
      </div>
      <input
        className="nodrag absolute left-3 top-10 w-[176px] bg-transparent text-[15px] text-white outline-none placeholder:text-neutral-600"
        placeholder="Type a move…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // picked from the list, the typed name, or blank when empty
            pick(options[highlight] ?? (query.trim() || undefined));
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, options.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          }
        }}
      />
      <span className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
        ↵ adds · blank if empty
      </span>
      {options.length > 0 && (
        <ul className="nodrag nowheel absolute left-0 top-full z-50 mt-1 w-full border border-neutral-700 bg-neutral-950 font-mono text-[11px] shadow-2xl">
          {options.map((move, i) => (
            <li key={move}>
              <button
                className={`block w-full px-2 py-1 text-left ${
                  i === highlight
                    ? 'bg-white text-black'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
                // onMouseDown fires before the input's onBlur, so the pick wins
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(move);
                }}
                onMouseEnter={() => setHighlight(i)}
              >
                {move}
              </button>
            </li>
          ))}
        </ul>
      )}
      <GhostHandle />
    </div>
  );
}

function GhostHandle() {
  return (
    <Handle
      id="top"
      type="target"
      position={Position.Top}
      isConnectable={false}
      style={{ visibility: 'hidden' }}
    />
  );
}
