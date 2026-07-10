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

  if (data.custom)
    return <CustomGhost spawn={spawn} suggested={data.suggested ?? []} />;

  return (
    <div
      // nopan: undraggable nodes don't get it from React Flow, and without it
      // the pan handler swallows mousedown before React handlers see it
      className="nopan relative opacity-50 transition-opacity hover:opacity-90"
      style={{
        width: 208,
        height: 88,
        background: '#FFFFFF',
        border: '1px dashed #A3A3A3',
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-7 items-center border-b border-dashed border-neutral-200 bg-neutral-50 px-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Suggested
        </span>
      </div>
      <span
        className="absolute left-3 top-10 max-w-[176px] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] tracking-tight text-neutral-700"
        title={data.label}
      >
        {data.label}
      </span>
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          className="nodrag flex h-6 w-6 items-center justify-center border border-neutral-300 bg-white font-mono text-[11px] leading-none text-neutral-500 hover:border-red-500 hover:text-red-500"
          title="Dismiss suggestion"
          onClick={(e) => {
            e.stopPropagation();
            dismiss(data.parentId, data.label);
          }}
        >
          ✗
        </button>
        <button
          className="nodrag flex h-6 w-6 items-center justify-center border border-black bg-black font-mono text-[11px] leading-none text-white hover:bg-neutral-800"
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

function CustomGhost({
  spawn,
  suggested,
}: {
  spawn: (label?: string) => void;
  suggested: string[];
}) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [focused, setFocused] = useState(false);
  // the card survives a spawn (parent stays anchored), so reset it
  const pick = (label?: string) => {
    spawn(label);
    setQuery('');
    setHighlight(0);
  };
  const q = query.trim().toLowerCase();
  // empty query → the suggestions that didn't fit on the two cards
  const options = q
    ? ALL_MOVES.filter((m) => m.toLowerCase().includes(q)).slice(0, 6)
    : suggested;

  return (
    <div
      className="nopan relative opacity-50 transition-opacity focus-within:opacity-95 hover:opacity-90"
      style={{
        width: 208,
        height: 88,
        background: '#FFFFFF',
        border: '1px dashed #A3A3A3',
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-7 items-center border-b border-dashed border-neutral-200 bg-neutral-50 px-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Your Move
        </span>
      </div>
      <input
        className="nodrag absolute left-3 top-10 w-[176px] bg-transparent text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400"
        placeholder="Type a move…"
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
      <span className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
        ↵ adds · blank if empty
      </span>
      {focused && options.length > 0 && (
        <ul className="nodrag nowheel absolute left-0 top-full z-50 mt-1 w-full border border-neutral-300 bg-white font-mono text-[11px] shadow-xl">
          {!q && (
            <li className="px-2 pt-2 text-[9px] uppercase tracking-[0.18em] text-neutral-400">
              Suggested next
            </li>
          )}
          {options.map((move, i) => (
            <li key={move}>
              <button
                className={`block w-full px-2 py-1 text-left ${
                  i === highlight
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
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
