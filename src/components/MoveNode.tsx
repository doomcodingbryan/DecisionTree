import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useGraph, type MoveNode as MoveNodeType } from '../store';
import { ALL_MOVES, moveMatches } from '../data/moves';
import { getSuggestions } from '../data/transitions';
import { getVideos, saveVideo } from '../video';
import { MoveVideoModal } from './Home';

const nodeWidth = 208;

const portStyle: CSSProperties = {
  width: 10,
  height: 10,
  left: '50%',
  background: '#F3EFE2',
  border: '2px solid #171717',
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
  const aiActive = useGraph((s) => s.aiFor === id);
  const toggleAi = useGraph((s) => s.toggleAi);
  const exits = getSuggestions(data.label).length;
  // same localStorage map the Library page writes — attach there, watch here
  const [videos, setVideos] = useState(getVideos);
  const [watching, setWatching] = useState(false);
  const videoId = videos[data.label];
  // favorites live in the store, so the heart stays in sync with the sidebar
  const fav = useGraph((s) => s.favorites.includes(data.label));
  const toggleFavorite = useGraph((s) => s.toggleFavorite);

  const q = query.trim().toLowerCase();
  const suggestions = (
    q ? ALL_MOVES.filter((m) => moveMatches(m, q)) : ALL_MOVES
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
        border: '1px solid #171717',
        borderRadius: 10,
        boxShadow: selected
          ? '0 0 0 1.5px #171717, 0 0 0 6px rgba(82,229,216,0.45)'
          : '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className={`flex h-7 items-center justify-between border-b px-2.5 ${
          selected
            ? 'border-neutral-900/25 bg-[#52E5D8] rounded-t-[9px]'
            : 'border-[#DCD6C1] bg-[#EFEBDC] rounded-t-[9px]'
        }`}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Move
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
            {exits} exits
          </span>
          {/* solid heart when favorited, hover-revealed otherwise */}
          <button
            className={`nodrag text-[11px] leading-none transition-opacity ${
              fav
                ? 'text-red-500 opacity-100'
                : 'text-neutral-400 opacity-0 hover:text-red-500 group-hover:opacity-100'
            }`}
            title={fav ? 'Unfavorite this move' : 'Favorite this move'}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(data.label);
            }}
          >
            {fav ? '♥' : '♡'}
          </button>
          {/* solid when a video is attached; a hover-revealed attach affordance otherwise */}
          <button
            className={`nodrag font-mono text-[10px] leading-none transition-opacity ${
              videoId
                ? 'text-neutral-900'
                : 'text-neutral-400 opacity-0 hover:text-neutral-900 group-hover:opacity-100'
            }`}
            title={videoId ? 'Watch technique video' : 'Attach a technique video'}
            onClick={(e) => {
              e.stopPropagation();
              setWatching(true);
            }}
          >
            ▶
          </button>
        </span>
      </div>
      <div className="px-3 pb-2.5 pt-2">
        {editing ? (
          <input
            className="nodrag w-full bg-transparent font-serif text-[15px] tracking-tight text-neutral-900 outline-none placeholder:text-neutral-400"
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
            className="block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[15px] tracking-tight text-neutral-900"
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
              data.notes ? 'text-neutral-500' : 'text-[#B3AC94]'
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
        <ul className="nodrag nowheel absolute left-2 right-2 top-full z-50 mt-1 max-h-52 overflow-auto border border-neutral-900 bg-[#FBF9F0] font-mono text-[11px] shadow-xl">
          {suggestions.map((move, i) => (
            <li key={move}>
              <button
                className={`block w-full px-2 py-1 text-left ${
                  i === highlight
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-[#EAE5D3] hover:text-black'
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
      {/* node click still fires after this, panning the fresh cards into view.
          Visible while selected too — hover-only would hide it on touch. */}
      <button
        className={`nodrag absolute bottom-1 left-full ml-2 flex h-7 items-center justify-center rounded-full border border-neutral-900 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-900 transition-opacity ${
          aiActive
            ? 'bg-[#52E5D8] opacity-100'
            : `bg-[#F3EFE2] hover:bg-[#52E5D8] ${
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`
        }`}
        title={aiActive ? 'Hide suggestions' : 'Suggest next moves'}
        onClick={() => toggleAi(id)}
      >
        Next
      </button>
      <Handle id="top" type="target" position={Position.Top} style={portStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={portStyle} />
      {/* portal: React Flow's node transform would trap the fixed overlay */}
      {watching &&
        createPortal(
          <MoveVideoModal
            move={data.label}
            videoId={videoId}
            onAttach={(move, vid) => {
              saveVideo(move, vid);
              setVideos(getVideos());
            }}
            onClose={() => setWatching(false)}
          />,
          document.body,
        )}
    </div>
  );
}
