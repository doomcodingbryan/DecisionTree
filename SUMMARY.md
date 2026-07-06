# BJJ Decision Tree — Build Summary

Interactive node-graph editor for Brazilian Jiu-Jitsu decision trees. Each node
is a position/move; each edge is a transition ("from Guard, 68% of the time you
pass to Closed Guard"). Top-down dataflow layout, brutalist/minimal styling.

## Stack

- **Vite + React + TypeScript**
- **@xyflow/react** (React Flow) — the canvas
- **Tailwind v4** — styling (`@tailwindcss/vite`)
- **Zustand** — single graph store, persisted to `localStorage` (key `bjj-graph`)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build
```

## Data model

- **Node**: `{ id, type: 'move', position, data: { label, isStart? } }`
- **Edge**: `{ id, source, target, sourceHandle, targetHandle, type: 'transition', data: { weight? } }`

Flow is directional: `sourceHandle` is always a node's **bottom** outlet,
`targetHandle` its **top** inlet.

## Features

- Pan/zoom canvas (Cmd/Ctrl+scroll or pinch), flat `#E4E4E4` background, no grid.
- **Add first move** via the empty-state button; every other node is added from
  a node's on-hover **`+`** button, which spawns a *connected* child below it.
- Double-click a label to rename inline.
- Drag from a node's bottom outlet to another node's top inlet to create a
  transition (strict top-to-bottom — no side connections).
- Double-click an edge's waypoint circle (or its weight) to set/edit the numeric
  weight; empty clears it. Weight sits at edge-center so sibling branches don't
  overlap.
- Double-click a node's top-right corner to toggle the red **start** marker.
- Delete/Backspace removes the selection; deleting a node removes its edges.
- Toolbar: **Export / Import** (JSON download + load) and **Clear** (confirm).
- New nodes **bounce in** (`animate-pop`); tracked via a non-persisted
  `lastAddedId`.

## Files

| File | Role |
|------|------|
| `src/store.ts` | Zustand store — single source of truth; nodes/edges + all mutations; `persist` handles localStorage |
| `src/components/Canvas.tsx` | React Flow setup, snap grid, empty state |
| `src/components/MoveNode.tsx` | The node: label, ports, start marker, `+` button |
| `src/components/TransitionEdge.tsx` | Orthogonal edge, waypoint circle, weight label/editor |
| `src/components/Toolbar.tsx` | Export / Import / Clear |
| `README.md` | How to run + how to add a new node/edge type later |

## Design

Flat, minimal, brutalist: no rounded corners, shadows, or gradients. Modeled on
a dataflow/patcher UI — small light-gray nodes with dark top-left labels, small
black square ports on the top (inlet) and bottom (outlet) edges, hairline black
edges (1.5px) with a small black waypoint circle + italic weight. Red square =
start node. Blue outline = selection.

### Notable decisions

- **Two directional ports, not four symmetric handles.** Enforces a readable
  top-to-bottom pipeline and makes source/target unambiguous. (Realigned here
  from an earlier 4-handle any-direction model.)
- **One inlet / one outlet**, not the inspiration's multiple typed ports — a
  BJJ position has one flow in / one out, so typed multi-ports would be
  visual mimicry without meaning.
- **Orthogonal (step) edges**, not the inspiration's straight diagonals — easy
  to switch if we want to get closer to the reference.

## Out of scope (v0)

Ingesting real match data / auto-computing weights, auth / backend / multi-user,
move taxonomy or belt logic, auto-layout, mobile-specific layout.
