import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
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
  const setWeight = useGraph((s) => s.setWeight);

  // wx/wy = edge center; for siblings sharing one outlet this diverges per
  // target, so their circles + weight labels don't stack
  const [path, wx, wy] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0, // hard 90° corners
  });

  const commit = (value: string) => {
    const n = Number(value);
    setWeight(id, value.trim() === '' || Number.isNaN(n) ? undefined : n);
    setEditing(false);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{ stroke: '#000000', strokeWidth: selected ? 2.5 : 1.5 }}
      />
      <circle
        cx={wx}
        cy={wy}
        r={7}
        fill="#000000"
        style={{ pointerEvents: 'all' }}
        onDoubleClick={() => setEditing(true)}
      />
      {!editing && data?.weight != null && (
        <text
          x={wx + 12}
          y={wy + 1}
          style={{
            fill: '#000000',
            fontStyle: 'italic',
            fontSize: 13,
            pointerEvents: 'all',
            userSelect: 'none',
          }}
          onDoubleClick={() => setEditing(true)}
        >
          {data.weight}
        </text>
      )}
      {editing && (
        <EdgeLabelRenderer>
          <input
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(${wx + 12}px, ${wy - 9}px)`,
              width: 56,
              fontStyle: 'italic',
              fontSize: 13,
              background: '#FFFFFF',
              outline: '2px solid #000000',
              pointerEvents: 'all',
            }}
            type="number"
            step="any"
            defaultValue={data?.weight}
            autoFocus
            onFocus={(e) => e.target.select()}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        </EdgeLabelRenderer>
      )}
    </>
  );
}
