# BJJ Decision Tree

Interactive node-graph editor for Brazilian Jiu-Jitsu decision trees. Each node
is a position/move, each edge a transition.

## Run

```bash
npm install
npm run dev
```

## Use

- **Add Move** drops a node at the viewport center.
- Double-click a node label to rename it.
- Double-click a node's top-left corner to toggle the red start badge.
- Drag from any black square handle to another node to create a transition.
- Double-click an edge's waypoint circle (or its weight label) to set/edit the
  numeric weight; empty clears it.
- Delete/Backspace removes the selection.
- The graph auto-saves to localStorage; Export/Import moves it as JSON.

## Adding a new node or edge type

1. Add the component in `src/components/` (see `MoveNode.tsx` /
   `TransitionEdge.tsx` for the shape — nodes get `NodeProps`, edges
   `EdgeProps`).
2. Register it in the `nodeTypes` / `edgeTypes` maps in
   `src/components/Canvas.tsx`.
3. Extend the type unions in `src/store.ts` (`MoveNode`, `TransitionEdge`) so
   the store and JSON import/export stay typed.

State lives in one Zustand store (`src/store.ts`); it is the single source of
truth and persists to localStorage under the key `bjj-graph`.
