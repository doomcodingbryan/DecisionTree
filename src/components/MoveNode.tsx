import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState, type CSSProperties } from 'react';
import { useGraph, type MoveNode as MoveNodeType } from '../store';
import { ALL_MOVES } from '../data/moves';

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
      {/* + reveals on hover: spawn a connected child from the bottom outlet */}
      <button
        className="nodrag absolute bottom-1 right-1 hidden h-4 w-4 items-center justify-center pb-[2px] text-sm font-bold leading-none text-white group-hover:flex"
        style={{ background: '#000000' }}
        onClick={(e) => {
          e.stopPropagation();
          addChild(id);
        }}
        title="Add connected move"
      >
        +
      </button>
      {/* directional ports: top = inlet (target), bottom = outlet (source) */}
      <Handle id="top" type="target" position={Position.Top} style={portStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={portStyle} />
    </div>
  );
}
