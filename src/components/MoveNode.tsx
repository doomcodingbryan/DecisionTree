import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState, type CSSProperties } from 'react';
import { useGraph, type MoveNode as MoveNodeType } from '../store';
import { ALL_MOVES } from '../data/moves';
import { getSuggestions } from '../data/transitions';

const nodeWidth = 208;

const portStyle: CSSProperties = {
  width: 10,
  height: 10,
  left: '50%',
  background: '#FFFFFF',
  border: '2px solid #737373',
  borderRadius: '50%',
};

// stdlib-free textarea autosize
const fitHeight = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

export default function MoveNode({ id, data, selected }: NodeProps<MoveNodeType>) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState(data.label);
  const [highlight, setHighlight] = useState(0);
  const [editingNotes, setEditingNotes] = useState(false);
  const renameNode = useGraph((s) => s.renameNode);
  const setNotes = useGraph((s) => s.setNotes);
  const isNew = useGraph((s) => s.lastAddedId === id);
  const exits = getSuggestions(data.label).length;

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
        width: nodeWidth,
        minHeight: 88,
        background: '#FFFFFF',
        border: selected ? '1px solid #4F46E5' : '1px solid #D4D4D4',
        boxShadow: selected
          ? '0 0 0 1px #4F46E5, 0 0 0 5px rgba(79,70,229,0.12)'
          : '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className={`flex h-7 items-center justify-between border-b px-2.5 ${
          selected
            ? 'border-indigo-100 bg-indigo-50'
            : 'border-neutral-200 bg-neutral-100'
        }`}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Move
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
          {exits} exits
        </span>
      </div>
      <div className="px-3 pb-2.5 pt-2">
        {editing ? (
          <input
            className="nodrag w-full bg-transparent text-[15px] tracking-tight text-neutral-900 outline-none placeholder:text-neutral-400"
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
        ) : (
          <span
            className="block overflow-hidden text-ellipsis whitespace-nowrap text-[15px] tracking-tight text-neutral-900"
            onDoubleClick={(e) => {
              e.stopPropagation();
              openEditor();
            }}
            title={data.label}
          >
            {data.label}
          </span>
        )}
        {editingNotes ? (
          <textarea
            className="nodrag nowheel mt-1 block w-full resize-none overflow-hidden bg-transparent text-[11px] leading-relaxed text-neutral-600 outline-none placeholder:text-neutral-400"
            rows={2}
            defaultValue={data.notes}
            placeholder="Notes…"
            autoFocus
            onFocus={(e) => fitHeight(e.target)}
            onInput={(e) => fitHeight(e.currentTarget)}
            onBlur={(e) => {
              setNotes(id, e.target.value.trim() || undefined);
              setEditingNotes(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingNotes(false);
            }}
          />
        ) : (
          <p
            className={`mt-1 whitespace-pre-wrap break-words text-[11px] leading-relaxed ${
              data.notes ? 'text-neutral-500' : 'text-neutral-300'
            }`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingNotes(true);
            }}
            title="Double-click to edit notes"
          >
            {data.notes ?? 'Double-click to add notes…'}
          </p>
        )}
      </div>
      {editing && suggestions.length > 0 && (
        <ul className="nodrag nowheel absolute left-2 right-2 top-full z-50 mt-1 max-h-52 overflow-auto border border-neutral-300 bg-white font-mono text-[11px] shadow-xl">
          {suggestions.map((move, i) => (
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
      <Handle id="top" type="target" position={Position.Top} style={portStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={portStyle} />
    </div>
  );
}
