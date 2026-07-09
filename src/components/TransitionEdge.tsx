import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { useState } from 'react';
import { useGraph, type TransitionEdge as TransitionEdgeType } from '../store';

export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<TransitionEdgeType>) {
  const [editing, setEditing] = useState(false);
  const setLabel = useGraph((s) => s.setLabel);
  const ghost = data?.ghost ?? false;
  const edgeColor = selected ? '#FFFFFF' : '#525252';

  // labelX/labelY = curve midpoint; siblings sharing one outlet diverge per
  // target, so their chips don't stack
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const commit = (value: string) => {
    setLabel(id, value.trim().toLowerCase() || undefined);
    setEditing(false);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? 1.8 : 1.2,
          strokeDasharray: ghost ? '6 4' : undefined,
          opacity: ghost ? 0.5 : 1,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: ghost ? 'none' : 'all',
            opacity: ghost ? 0.5 : 1,
          }}
        >
          {editing ? (
            <input
              className="w-24 border border-neutral-500 bg-neutral-950 px-2 py-[3px] font-mono text-[10px] lowercase tracking-[0.08em] text-white outline-none"
              style={{ borderRadius: 5 }}
              defaultValue={data?.label}
              autoFocus
              onFocus={(e) => e.target.select()}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
          ) : ghost && !data?.label ? null : (
            <button
              className={`border px-2 py-[3px] font-mono text-[10px] lowercase tracking-[0.08em] ${
                selected
                  ? 'border-neutral-400 bg-neutral-900 text-white'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400'
              } ${data?.label ? '' : 'opacity-30 hover:opacity-100'}`}
              style={{ borderRadius: 5 }}
              onDoubleClick={() => setEditing(true)}
              title="Double-click to label this transition"
            >
              {data?.label ?? '+'}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
