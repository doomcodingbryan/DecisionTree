import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState, type CSSProperties } from 'react';
import {
  useGraph,
  type MoveNode as MoveNodeType,
  type TransitionEdge as TransitionEdgeType,
} from '../store';
import { ALL_MOVES, MOVE_CATEGORY } from '../data/moves';
import { getSuggestions } from '../data/transitions';

const nodeWidth = 208;
const nodeHeight = 88;

const portStyle: CSSProperties = {
  width: 10,
  height: 10,
  left: '50%',
  background: '#525252',
  border: '2px solid #030303',
  borderRadius: '50%',
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
  const exits = getSuggestions(data.label).length;
  // graph clues, read non-reactively while the popover is open: children
  // already mapped are dropped, and deep chains surface submissions first
  let recommended = getSuggestions(data.label).map((s) => s.to);
  let taken: Set<string | undefined> | null = null;
  if (adding) {
    const { nodes, edges } = useGraph.getState();
    const takenSet = new Set(
      edges
        .filter((e) => e.source === id)
        .map((e) => nodes.find((n) => n.id === e.target)?.data.label),
    );
    taken = takenSet;
    recommended = recommended.filter((m) => !takenSet.has(m));
    if (chainDepth(id, edges) >= 2) {
      recommended = [
        ...recommended.filter((m) => MOVE_CATEGORY[m] === 'Submissions'),
        ...recommended.filter((m) => MOVE_CATEGORY[m] !== 'Submissions'),
      ];
    }
  }
  const aq = addQuery.trim().toLowerCase();
  const addOptions = (
    aq
      ? ALL_MOVES.filter((m) => m.toLowerCase().includes(aq))
      : recommended.length
        ? recommended
        : ALL_MOVES
  )
    .filter((m) => !taken?.has(m))
    .slice(0, 8);
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
        width: nodeWidth,
        height: nodeHeight,
        background: '#0A0A0A',
        border: '1px solid #3F3F46',
        boxShadow: selected
          ? '0 0 0 1px #FFFFFF, 0 0 0 5px rgba(255,255,255,0.08)'
          : '0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-7 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Move
        </span>
        <div
          className="h-3 w-3 border border-neutral-700"
          style={{ background: data.isStart ? '#E5241C' : '#050505' }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleStart(id);
          }}
          title="Double-click to toggle start"
        />
      </div>
      {editing ? (
        <>
          <input
            className="nodrag absolute left-3 top-10 w-[178px] bg-transparent text-[15px] text-white outline-none placeholder:text-neutral-600"
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
            <ul className="nodrag nowheel absolute left-3 top-[66px] z-50 max-h-52 w-[184px] overflow-auto border border-neutral-700 bg-neutral-950 font-mono text-[11px] shadow-2xl">
              {suggestions.map((move, i) => (
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
          className="absolute left-3 top-10 max-w-[176px] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] tracking-tight text-white"
          onDoubleClick={(e) => {
            e.stopPropagation();
            openEditor();
          }}
          title={data.label}
        >
          {data.label}
        </span>
      )}
      <span className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
        {exits} exits
      </span>
      <button
        className={`nodrag absolute bottom-2 right-2 h-6 w-6 items-center justify-center border border-neutral-700 bg-white pb-[1px] font-mono text-base leading-none text-black hover:bg-neutral-200 group-hover:flex ${
          adding ? 'flex' : 'hidden'
        }`}
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
        <div className="nodrag nowheel absolute right-0 top-full z-50 mt-2 w-56 border border-neutral-700 bg-neutral-950 font-mono text-[11px] shadow-2xl">
          <input
            className="w-full border-b border-neutral-800 bg-black px-2 py-2 text-white outline-none placeholder:text-neutral-600"
            placeholder={recommended.length ? 'Suggested next' : 'Search moves'}
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
              <li className="px-2 pt-2 text-[9px] uppercase tracking-[0.18em] text-neutral-500">
                Suggested next
              </li>
            )}
            {addOptions.map((move, i) => (
              <li key={move}>
                <button
                  className={`block w-full px-2 py-1 text-left ${
                    i === addHi
                      ? 'bg-white text-black'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
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
                className="block w-full border-t border-neutral-800 px-2 py-2 text-left text-neutral-500 hover:bg-neutral-900 hover:text-white"
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
      <Handle id="top" type="target" position={Position.Top} style={portStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={portStyle} />
    </div>
  );
}

// How many moves deep this node sits, walking the first incoming edge per
// node, cycle-guarded. ponytail: a hint for ranking, not real graph analysis.
function chainDepth(id: string, edges: TransitionEdgeType[]): number {
  const seen = new Set<string>([id]);
  let cur = id;
  let depth = 0;
  for (;;) {
    const incoming = edges.find((e) => e.target === cur);
    if (!incoming || seen.has(incoming.source)) return depth;
    seen.add(incoming.source);
    cur = incoming.source;
    depth++;
  }
}
