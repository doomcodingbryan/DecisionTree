import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';

export type MoveNode = Node<{ label: string; isStart?: boolean }, 'move'>;
export type TransitionEdge = Edge<{ weight?: number }, 'transition'>;

type GraphState = {
  nodes: MoveNode[];
  edges: TransitionEdge[];
  lastAddedId: string | null;
  onNodesChange: (changes: NodeChange<MoveNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<TransitionEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addMove: (position: { x: number; y: number }) => void;
  addChild: (parentId: string, label?: string) => void;
  renameNode: (id: string, label: string) => void;
  toggleStart: (id: string) => void;
  setWeight: (id: string, weight?: number) => void;
  clear: () => void;
  load: (nodes: MoveNode[], edges: TransitionEdge[]) => void;
};

export const useGraph = create<GraphState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      lastAddedId: null,
      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) }),
      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) }),
      onConnect: (connection) =>
        set({
          edges: addEdge(
            { ...connection, type: 'transition', data: {} },
            get().edges,
          ) as TransitionEdge[],
        }),
      addMove: (position) => {
        const id = crypto.randomUUID();
        set({
          nodes: [
            ...get().nodes,
            { id, type: 'move', position, data: { label: 'New Move' } },
          ],
          lastAddedId: id,
        });
      },
      addChild: (parentId, label = 'New Move') => {
        const parent = get().nodes.find((n) => n.id === parentId);
        if (!parent) return;
        // fan siblings out horizontally so they don't stack
        const siblings = get().edges.filter((e) => e.source === parentId).length;
        const id = crypto.randomUUID();
        set({
          nodes: [
            ...get().nodes,
            {
              id,
              type: 'move',
              position: {
                x: parent.position.x + siblings * 220,
                y: parent.position.y + 140,
              },
              data: { label },
            },
          ],
          edges: [
            ...get().edges,
            {
              id: crypto.randomUUID(),
              source: parentId,
              sourceHandle: 'bottom',
              target: id,
              targetHandle: 'top',
              type: 'transition',
              data: {},
            } as TransitionEdge,
          ],
          lastAddedId: id,
        });
      },
      renameNode: (id, label) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, label } } : n,
          ),
        }),
      toggleStart: (id) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, isStart: !n.data.isStart } }
              : n,
          ),
        }),
      setWeight: (id, weight) =>
        set({
          edges: get().edges.map((e) =>
            e.id === id ? { ...e, data: { ...e.data, weight } } : e,
          ),
        }),
      clear: () => set({ nodes: [], edges: [] }),
      load: (nodes, edges) => set({ nodes, edges }),
    }),
    {
      name: 'bjj-graph',
      partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
    },
  ),
);
