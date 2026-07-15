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
import { edgeLabelFor } from './data/moves';
import { spliceBetween } from './insert';

export type MoveNode = Node<{ label: string; notes?: string }, 'move'>;
// ghost = rendered-only suggestion; never stored, so `ghost` on an edge only
// ever appears on derived ghost edges. `custom` marks the pick-your-own card,
// whose dropdown offers the `suggested` moves not shown as cards.
export type GhostNode = Node<
  {
    label: string;
    parentId: string;
    custom?: boolean;
    suggested?: string[];
    // when set, accepting splices the move between parent and this child
    // (the parent's current next node) instead of appending a branch
    insertBeforeId?: string;
    // a branch-off-the-parent card shown beside a mid-chain node's child
    newPath?: boolean;
  },
  'ghost'
>;
export type TransitionEdge = Edge<
  { label?: string; ghost?: boolean },
  'transition'
>;

// fan children left/right below the parent: 0, -240, 240, -480, 480, …
export const branchOffset = (siblings: number) =>
  siblings === 0
    ? 0
    : (siblings % 2 === 1 ? -1 : 1) * Math.ceil(siblings / 2) * 240;
export type Folder = { name: string; info?: string };
export type Tree = {
  id: string;
  name: string;
  // ponytail: a tree points at its folder by name; the list lives in `folders`
  folder?: string;
  nodes: MoveNode[];
  edges: TransitionEdge[];
  updatedAt: number;
};

type GraphPatch = Partial<{
  nodes: MoveNode[];
  edges: TransitionEdge[];
  lastAddedId: string | null;
}>;

type Snapshot = { nodes: MoveNode[]; edges: TransitionEdge[] };

type GraphState = {
  trees: Record<string, Tree>;
  activeId: string | null;
  // working copy of the active tree, edited by the canvas
  nodes: MoveNode[];
  edges: TransitionEdge[];
  lastAddedId: string | null;
  createTree: (
    name?: string,
    nodes?: MoveNode[],
    edges?: TransitionEdge[],
  ) => string;
  openTree: (id: string) => void;
  renameTree: (id: string, name: string) => void;
  deleteTree: (id: string) => void;
  folders: Folder[];
  createFolder: (name: string, info?: string) => void;
  updateFolder: (name: string, next: string, info?: string) => void;
  deleteFolder: (name: string) => void;
  setTreeFolder: (id: string, folder?: string) => void;
  onNodesChange: (changes: NodeChange<MoveNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<TransitionEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addMove: (position: { x: number; y: number }, label?: string) => void;
  addChild: (
    parentId: string,
    label?: string,
    position?: { x: number; y: number },
  ) => void;
  insertChild: (
    parentId: string,
    childId: string,
    label?: string,
    position?: { x: number; y: number },
  ) => void;
  dismissed: Set<string>;
  dismissSuggestion: (parentId: string, label: string) => void;
  // node whose AI recommendation cards are shown (one at a time; null clears)
  aiFor: string | null;
  toggleAi: (id: string | null) => void;
  // session-only undo history for the active tree
  past: Snapshot[];
  future: Snapshot[];
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
  renameNode: (id: string, label: string) => void;
  setNotes: (id: string, notes?: string) => void;
  setLabel: (id: string, label?: string) => void;
  clear: () => void;
  load: (nodes: MoveNode[], edges: TransitionEdge[]) => void;
};

// One-time import of the pre-multi-tree 'bjj-graph' localStorage graph.
// ponytail: the old key is left behind; harmless, and deleting it before the
// new key is first persisted would risk losing the graph.
const legacyTrees = (): Record<string, Tree> => {
  try {
    const s = JSON.parse(localStorage.getItem('bjj-graph') ?? '')?.state;
    if (!s?.nodes?.length) return {};
    const id = crypto.randomUUID();
    return {
      [id]: {
        id,
        name: 'My Game Plan',
        nodes: s.nodes,
        edges: s.edges ?? [],
        updatedAt: Date.now(),
      },
    };
  } catch {
    return {};
  }
};

export const useGraph = create<GraphState>()(
  persist(
    (set, get) => {
      // Push the current graph onto the undo stack (capped at 50). Snapshots
      // within one synchronous tick coalesce — deleting a node fires separate
      // node-remove and edge-remove changes that must undo as one step.
      let snappedThisTick = false;
      const snapshot = () => {
        if (snappedThisTick) return;
        const s = get();
        const top = s.past[s.past.length - 1];
        if (top && top.nodes === s.nodes && top.edges === s.edges) return;
        snappedThisTick = true;
        queueMicrotask(() => {
          snappedThisTick = false;
        });
        set({
          past: [...s.past.slice(-49), { nodes: s.nodes, edges: s.edges }],
          future: [],
        });
      };

      // apply a working-copy patch and mirror it into the active tree
      const commit = (patch: GraphPatch) =>
        set((s) => {
          const nodes = patch.nodes ?? s.nodes;
          const edges = patch.edges ?? s.edges;
          const tree = s.activeId ? s.trees[s.activeId] : undefined;
          return {
            ...patch,
            trees: tree
              ? {
                  ...s.trees,
                  [tree.id]: { ...tree, nodes, edges, updatedAt: Date.now() },
                }
              : s.trees,
          };
        });

      return {
        trees: legacyTrees(),
        activeId: null,
        nodes: [],
        edges: [],
        lastAddedId: null,
        createTree: (name = 'Untitled Plan', nodes = [], edges = []) => {
          const id = crypto.randomUUID();
          set({
            trees: {
              ...get().trees,
              [id]: { id, name, nodes, edges, updatedAt: Date.now() },
            },
          });
          return id;
        },
        openTree: (id) => {
          const tree = get().trees[id];
          if (!tree) return;
          set({
            activeId: id,
            nodes: tree.nodes,
            edges: tree.edges,
            lastAddedId: null,
            aiFor: null,
            past: [], // history belongs to one tree
            future: [],
          });
        },
        renameTree: (id, name) => {
          const tree = get().trees[id];
          if (!tree) return;
          set({
            trees: {
              ...get().trees,
              [id]: { ...tree, name, updatedAt: Date.now() },
            },
          });
        },
        deleteTree: (id) => {
          const trees = { ...get().trees };
          delete trees[id];
          set(
            get().activeId === id
              ? {
                  trees,
                  activeId: null,
                  nodes: [],
                  edges: [],
                  lastAddedId: null,
                  past: [],
                  future: [],
                }
              : { trees },
          );
        },
        folders: [],
        createFolder: (name, info) => {
          const n = name.trim();
          if (!n || get().folders.some((f) => f.name === n)) return;
          set({
            folders: [
              ...get().folders,
              { name: n, info: info?.trim() || undefined },
            ],
          });
        },
        updateFolder: (name, next, info) => {
          const n = next.trim();
          if (!n || get().folders.some((f) => f.name === n && n !== name))
            return;
          set({
            folders: get().folders.map((f) =>
              f.name === name ? { name: n, info: info?.trim() || undefined } : f,
            ),
            trees: Object.fromEntries(
              Object.entries(get().trees).map(([id, t]): [string, Tree] => [
                id,
                t.folder === name ? { ...t, folder: n } : t,
              ]),
            ),
          });
        },
        deleteFolder: (name) => {
          set({
            folders: get().folders.filter((f) => f.name !== name),
            trees: Object.fromEntries(
              Object.entries(get().trees).map(([id, t]): [string, Tree] => [
                id,
                t.folder === name ? { ...t, folder: undefined } : t,
              ]),
            ),
          });
        },
        // no updatedAt bump — filing a plan isn't an edit, cards keep their order
        setTreeFolder: (id, folder) => {
          const tree = get().trees[id];
          if (!tree) return;
          set({ trees: { ...get().trees, [id]: { ...tree, folder } } });
        },
        onNodesChange: (changes) => {
          if (changes.some((c) => c.type === 'remove')) snapshot();
          commit({ nodes: applyNodeChanges(changes, get().nodes) });
        },
        onEdgesChange: (changes) => {
          if (changes.some((c) => c.type === 'remove')) snapshot();
          commit({ edges: applyEdgeChanges(changes, get().edges) });
        },
        onConnect: (connection) => {
          snapshot();
          const target = get().nodes.find((n) => n.id === connection.target);
          commit({
            edges: addEdge(
              {
                ...connection,
                type: 'transition',
                // auto-label the chip from the target move's category
                data: { label: target && edgeLabelFor(target.data.label) },
              },
              get().edges,
            ) as TransitionEdge[],
          });
        },
        addMove: (position, label = 'New Move') => {
          snapshot();
          const id = crypto.randomUUID();
          commit({
            nodes: [
              ...get().nodes,
              { id, type: 'move', position, data: { label } },
            ],
            lastAddedId: id,
          });
        },
        addChild: (parentId, label = 'New Move', position) => {
          const parent = get().nodes.find((n) => n.id === parentId);
          if (!parent) return;
          snapshot();
          const siblings = get().edges.filter((e) => e.source === parentId).length;
          const id = crypto.randomUUID();
          commit({
            nodes: [
              ...get().nodes,
              {
                id,
                type: 'move',
                position: position ?? {
                  x: parent.position.x + branchOffset(siblings),
                  y: parent.position.y + 160,
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
                data: { label: edgeLabelFor(label) },
              } as TransitionEdge,
            ],
            lastAddedId: id,
          });
        },
        insertChild: (parentId, childId, label = 'New Move', position) => {
          const parent = get().nodes.find((n) => n.id === parentId);
          if (!parent) return;
          snapshot();
          const id = crypto.randomUUID();
          commit({
            nodes: [
              ...get().nodes,
              {
                id,
                type: 'move',
                // beside the parent's row by default — the down-slot is taken
                // by the existing child we're inserting in front of
                position: position ?? {
                  x: parent.position.x + 240,
                  y: parent.position.y + 160,
                },
                data: { label },
              },
            ],
            edges: spliceBetween(
              get().edges,
              parentId,
              childId,
              id,
              label,
              crypto.randomUUID(),
            ),
            lastAddedId: id,
          });
        },
        renameNode: (id, label) => {
          snapshot();
          commit({
            nodes: get().nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, label } } : n,
            ),
          });
        },
        setNotes: (id, notes) => {
          snapshot();
          commit({
            nodes: get().nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, notes } } : n,
            ),
          });
        },
        setLabel: (id, label) => {
          snapshot();
          commit({
            edges: get().edges.map((e) =>
              e.id === id ? { ...e, data: { ...e.data, label } } : e,
            ),
          });
        },
        dismissed: new Set<string>(),
        dismissSuggestion: (parentId, label) => {
          const dismissed = new Set(get().dismissed);
          dismissed.add(`${parentId}→${label}`);
          set({ dismissed });
        },
        aiFor: null,
        toggleAi: (id) => set({ aiFor: get().aiFor === id ? null : id }),
        clear: () => {
          snapshot();
          commit({ nodes: [], edges: [], lastAddedId: null });
        },
        load: (nodes, edges) => {
          snapshot();
          commit({ nodes, edges, lastAddedId: null });
        },
        past: [],
        future: [],
        snapshot,
        undo: () => {
          const s = get();
          const prev = s.past[s.past.length - 1];
          if (!prev) return;
          set({
            past: s.past.slice(0, -1),
            future: [...s.future, { nodes: s.nodes, edges: s.edges }],
          });
          commit({ nodes: prev.nodes, edges: prev.edges, lastAddedId: null });
        },
        redo: () => {
          const s = get();
          const next = s.future[s.future.length - 1];
          if (!next) return;
          set({
            past: [...s.past, { nodes: s.nodes, edges: s.edges }],
            future: s.future.slice(0, -1),
          });
          commit({ nodes: next.nodes, edges: next.edges, lastAddedId: null });
        },
      };
    },
    {
      name: 'bjj-trees',
      version: 1,
      // v0 folders were bare name strings
      migrate: (s: unknown) => {
        const state = s as { folders?: (string | Folder)[] };
        return {
          ...state,
          folders: (state?.folders ?? []).map((f) =>
            typeof f === 'string' ? { name: f } : f,
          ),
        };
      },
      partialize: (s) => ({ trees: s.trees, folders: s.folders }),
    },
  ),
);
