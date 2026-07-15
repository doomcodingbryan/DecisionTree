import { edgeLabelFor } from './data/moves.ts';
import type { TransitionEdge } from './store';

// Splice a new node between a parent and one existing child: the parent→child
// edge is repointed to newId→child (so the transition INTO the child, and its
// label, is preserved), and a fresh parent→newId edge is added, auto-labelled
// from the inserted move's category.
export function spliceBetween(
  edges: TransitionEdge[],
  parentId: string,
  childId: string,
  newId: string,
  newLabel: string,
  newEdgeId: string,
): TransitionEdge[] {
  return [
    ...edges.map((e) =>
      e.source === parentId && e.target === childId
        ? { ...e, source: newId }
        : e,
    ),
    {
      id: newEdgeId,
      source: parentId,
      sourceHandle: 'bottom',
      target: newId,
      targetHandle: 'top',
      type: 'transition',
      data: { label: edgeLabelFor(newLabel) },
    } as TransitionEdge,
  ];
}
