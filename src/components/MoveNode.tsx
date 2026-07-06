import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState, type CSSProperties } from 'react';
import { useGraph, type MoveNode as MoveNodeType } from '../store';
import { ALL_MOVES } from '../data/moves';
import { getSuggestions } from '../data/transitions';

// small square ports, left-aligned on the top/bottom edges (dataflow style)
const portStyle: CSSProperties = {
  width: 12,
  height: 12,
  left: 22,
  background: '#000000',
  border: 'none',
  borderRadius: 0,
};

export default function MoveNode({ id, data, selected }: NodeProps<MoveNodeType>) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState(data.label);
  const [highlight, setHighlight] = useState(0);
  const renameNode = useGraph((s) => s.renameNode);
  const toggleStart = useGraph((s) => s.toggleStart);
  const addChild = useGraph((s) => s.addChild);
  const isNew = useGraph((s) => s.lastAddedId === id);

  const q = query.trim().toLowerCase();
  const suggestions = (
    q ? ALL_MOVES.filter((m) => m.toLowerCase().includes(q)) : ALL_MOVES
  ).slice(0, 8);

  const commit = (value: string) => {
    renameNode(id, value.trim() || data.label);
    setEditing(false);
  };
  const openEditor = () => {
    setQuery(data.label);
    setHighlight(0);
    setEditing(true);
  };

  // "add connected move" popover: recommended next moves, else search the library
  const [adding, setAdding] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addHi, setAddHi] = useState(0);
  const recommended = getSuggestions(data.label).map((s) => s.to);
  const aq = addQuery.trim().toLowerCase();
  const addOptions = aq
    ? ALL_MOVES.filter((m) => m.toLowerCase().includes(aq)).slice(0, 8)
    : recommended.length
      ? recommended
      : ALL_MOVES.slice(0, 8);
  const spawn = (label?: string) => {
    addChild(id, label?.trim() || undefined);
    setAdding(false);
    setAddQuery('');
    setAddHi(0);
  };

  return (
    <div
      className={`group relative ${isNew ? 'animate-pop' : ''}`}
      style={{
        width: 168,
        height: 64,
        background: '#D4D4D4',
        outline: selected ? '2px solid #2563EB' : 'none', // blue selection, like the reference
      }}
    >
      {/* start marker: small red square, top-right; double-click toggles */}
      <div
        className="absolute right-1.5 top-1.5 h-3 w-3"
        style={{ background: data.isStart ? '#E5241C' : 'transparent' }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          toggleStart(id);
        }}
        title="Double-click to toggle start"
      />
      {editing ? (
        <>
          <input
            className="nodrag absolute left-2.5 top-2.5 w-[128px] bg-transparent text-[13px] font-medium text-neutral-900 outline-none"
            value={query}
            autoFocus
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onBlur={() => commit(query)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit(suggestions[highlight] ?? query);
              } else if (e.key === 'Escape') {
                setEditing(false);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              }
            }}
          />
          {suggestions.length > 0 && (
            <ul className="nodrag nowheel absolute left-2.5 top-10 z-50 max-h-48 w-[144px] overflow-auto border border-black bg-white text-[12px]">
              {suggestions.map((move, i) => (
                <li key={move}>
                  <button
                    className={`block w-full px-2 py-1 text-left ${
                      i === highlight ? 'bg-neutral-900 text-white' : 'text-neutral-900 hover:bg-neutral-100'
                    }`}
                    // onMouseDown fires before the input's onBlur, so the pick wins
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(move);
                    }}
                    onMouseEnter={() => setHighlight(i)}
                  >
                    {move}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <span
          className="absolute left-2.5 top-2.5 text-[13px] font-medium text-neutral-900"
          onDoubleClick={(e) => {
            e.stopPropagation();
            openEditor();
          }}
        >
          {data.label}
        </span>
      )}
      {/* + reveals on hover: opens the "add connected move" popover (recommendations) */}
      <button
        className={`nodrag absolute bottom-1 right-1 h-4 w-4 items-center justify-center pb-[2px] text-sm font-bold leading-none text-white group-hover:flex ${
          adding ? 'flex' : 'hidden'
        }`}
        style={{ background: '#000000' }}
        onClick={(e) => {
          e.stopPropagation();
          setAddQuery('');
          setAddHi(0);
          setAdding((a) => !a);
        }}
        title="Add connected move"
      >
        +
      </button>
      {adding && (
        <div className="nodrag nowheel absolute right-0 top-full z-50 mt-1 w-48 border border-black bg-white text-[12px]">
          <input
            className="w-full border-b border-neutral-300 px-2 py-1 outline-none"
            placeholder={recommended.length ? 'Suggested next…' : 'Search moves…'}
            value={addQuery}
            autoFocus
            onChange={(e) => {
              setAddQuery(e.target.value);
              setAddHi(0);
            }}
            onBlur={() => setAdding(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                spawn(addOptions[addHi] ?? addQuery);
              } else if (e.key === 'Escape') {
                setAdding(false);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAddHi((h) => Math.min(h + 1, addOptions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAddHi((h) => Math.max(h - 1, 0));
              }
            }}
          />
          <ul className="max-h-44 overflow-auto">
            {!addQuery && recommended.length > 0 && (
              <li className="px-2 pt-1 text-[10px] uppercase tracking-wide text-neutral-400">
                Suggested next
              </li>
            )}
            {addOptions.map((move, i) => (
              <li key={move}>
                <button
                  className={`block w-full px-2 py-1 text-left ${
                    i === addHi ? 'bg-neutral-900 text-white' : 'text-neutral-900 hover:bg-neutral-100'
                  }`}
                  // onMouseDown fires before the input's onBlur, so the pick wins
                  onMouseDown={(e) => {
                    e.preventDefault();
                    spawn(move);
                  }}
                  onMouseEnter={() => setAddHi(i)}
                >
                  {move}
                </button>
              </li>
            ))}
            <li>
              <button
                className="block w-full border-t border-neutral-200 px-2 py-1 text-left text-neutral-500 hover:bg-neutral-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                  spawn();
                }}
              >
                + Blank move
              </button>
            </li>
          </ul>
        </div>
      )}
      {/* directional ports: top = inlet (target), bottom = outlet (source) */}
      <Handle id="top" type="target" position={Position.Top} style={portStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={portStyle} />
    </div>
  );
}
