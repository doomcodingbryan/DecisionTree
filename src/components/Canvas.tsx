import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { OnNodesChange } from '@xyflow/react';
import {
  branchOffset,
  useGraph,
  type GhostNode as GhostNodeType,
  type MoveNode as MoveNodeType,
  type TransitionEdge as TransitionEdgeType,
} from '../store';
import { sampleEdges, sampleNodes } from '../data/sampleGraph';
import { edgeLabelFor } from '../data/moves';
import { getSuggestions } from '../data/transitions';
import GhostNode from './GhostNode';
import MoveLibrary from './MoveLibrary';
import MoveNode from './MoveNode';
import Toolbar from './Toolbar';
import TransitionEdge from './TransitionEdge';

const nodeTypes = { move: MoveNode, ghost: GhostNode };
const edgeTypes = { transition: TransitionEdge };
const getFitPadding = () => (window.innerWidth < 700 ? 0.75 : 0.35);
// no arrowheads: edges run top→bottom and end on a port dot, WBC-style
const defaultEdgeOptions = { type: 'transition' };

export default function Canvas({ treeId }: { treeId: string }) {
  const exists = useGraph((s) => Boolean(s.trees[treeId]));
  const activeId = useGraph((s) => s.activeId);
  const openTree = useGraph((s) => s.openTree);

  useEffect(() => {
    if (exists) openTree(treeId);
    else window.location.hash = '#/'; // unknown id → back to the library
  }, [exists, openTree, treeId]);

  // ⌘Z / ⇧⌘Z (or Ctrl) — skipped while typing, where the browser's own
  // undo should win
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
        return;
      e.preventDefault();
      (e.shiftKey ? useGraph.getState().redo : useGraph.getState().undo)();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (activeId !== treeId) {
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen bg-black text-white">
        <MoveLibrary />
        <Flow />
      </div>
    </ReactFlowProvider>
  );
}

function Flow() {
  const nodes = useGraph((s) => s.nodes);
  const edges = useGraph((s) => s.edges);
  const onNodesChange = useGraph((s) => s.onNodesChange);
  const onEdgesChange = useGraph((s) => s.onEdgesChange);
  const onConnect = useGraph((s) => s.onConnect);
  const addMove = useGraph((s) => s.addMove);
  const dismissed = useGraph((s) => s.dismissed);
  const snapshot = useGraph((s) => s.snapshot);
  const { screenToFlowPosition, getViewport, fitBounds } = useReactFlow();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Ghost suggestions for the hovered node: derived at render time, never
  // stored — accepting one calls addChild, so the real graph stays clean.
  // Hovering a ghost keeps its parent anchored; a grace period covers the
  // pointer's trip across the gap between parent and ghost.
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverEnter = (id: string) => {
    clearTimeout(hoverTimer.current);
    setAnchorId(id);
  };
  const hoverLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      // don't dismiss while someone is typing in the pick-your-own card
      if (document.activeElement?.closest('.react-flow__node-ghost')) return;
      setAnchorId(null);
    }, 350);
  };
  const anchor = nodes.find((n) => n.id === anchorId);
  let ghostNodes: GhostNodeType[] = [];
  let ghostEdges: TransitionEdgeType[] = [];
  if (anchor) {
    const children = edges.filter((e) => e.source === anchor.id);
    const taken = new Set(
      children.map((e) => nodes.find((n) => n.id === e.target)?.data.label),
    );
    // 2 recommendations + 1 pick-your-own card
    const picks = getSuggestions(anchor.data.label)
      .map((s) => s.to)
      .filter((m) => !taken.has(m) && !dismissed.has(`${anchor.id}→${m}`))
      .slice(0, 2);
    // fan ghosts into the first free slots below the anchor — the natural
    // slot may already hold an unrelated node
    const occupied = (p: { x: number; y: number }) =>
      nodes.some(
        (n) =>
          Math.abs(n.position.x - p.x) < 224 &&
          Math.abs(n.position.y - p.y) < 104,
      );
    // nearest free slot: directly below or ±240 on this row, then the next
    // rows down — keeps ghosts beside their parent on crowded canvases
    // instead of fanning wide (into the sidebar or offscreen)
    const placedGhosts: { x: number; y: number }[] = [];
    const isFree = (p: { x: number; y: number }) =>
      !occupied(p) && !placedGhosts.some((q) => q.x === p.x && q.y === p.y);
    const nextFreeSlot = () => {
      for (let row = 1; row <= 3; row++) {
        for (let i = 0; i < 3; i++) {
          const p = {
            x: anchor.position.x + branchOffset(i),
            y: anchor.position.y + 160 * row,
          };
          if (isFree(p)) {
            placedGhosts.push(p);
            return p;
          }
        }
      }
      // fully boxed in: fall back to the widening fan on the first row
      for (let i = 3; ; i++) {
        const p = {
          x: anchor.position.x + branchOffset(i),
          y: anchor.position.y + 160,
        };
        if (isFree(p)) {
          placedGhosts.push(p);
          return p;
        }
      }
    };
    ghostNodes = [...picks, 'custom'].map((label) => ({
      id: `ghost-${anchor.id}-${label}`,
      type: 'ghost' as const,
      position: nextFreeSlot(),
      data:
        label === 'custom'
          ? { label: '', parentId: anchor.id, custom: true }
          : { label, parentId: anchor.id },
      draggable: false,
      selectable: false,
      // explicit size: ghosts aren't in the store, so React Flow's measured
      // dimensions are never applied back — without this they stay hidden
      width: 208,
      height: 88,
    }));
    ghostEdges = ghostNodes.map((g) => ({
      id: `ghost-edge-${g.id}`,
      source: anchor.id,
      sourceHandle: 'bottom',
      target: g.id,
      targetHandle: 'top',
      type: 'transition',
      data: {
        label: g.data.custom ? undefined : edgeLabelFor(g.data.label),
        ghost: true,
      },
    }));
  }

  // Pan ghosts into view when a click selects a node whose suggestion cards
  // fall offscreen. Click only — panning on selection would also fire on
  // drag-start and yank the canvas mid-drag.
  const ghostsRef = useRef(ghostNodes);
  ghostsRef.current = ghostNodes;
  const panToGhosts = (node: { position: { x: number; y: number } }) => {
    requestAnimationFrame(() => {
      const ghosts = ghostsRef.current;
      const wrap = wrapRef.current;
      if (!ghosts.length || !wrap) return;
      const { x, y, zoom } = getViewport();
      const { width, height } = wrap.getBoundingClientRect();
      const offscreen = ghosts.some((g) => {
        const sx = g.position.x * zoom + x;
        const sy = g.position.y * zoom + y;
        return (
          sx < 0 || sy < 0 || sx + 208 * zoom > width || sy + 88 * zoom > height
        );
      });
      if (!offscreen) return;
      const xs = [node.position.x, ...ghosts.map((g) => g.position.x)];
      const ys = [node.position.y, ...ghosts.map((g) => g.position.y)];
      fitBounds(
        {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs) + 208,
          height: Math.max(...ys) - Math.min(...ys) + 88,
        },
        { padding: 0.25, duration: 300 },
      );
    });
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const label = e.dataTransfer.getData('text/plain');
    if (!label) return;
    const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    // center the 208x88 node on the cursor, then snap to the 24px grid
    addMove(
      {
        x: Math.round((p.x - 104) / 24) * 24,
        y: Math.round((p.y - 44) / 24) * 24,
      },
      label,
    );
  };

  return (
    <div className="relative h-full flex-1" ref={wrapRef}>
      <ReactFlow
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStart={snapshot}
        onSelectionDragStart={snapshot}
        onNodeClick={(_, node) => {
          if (node.type === 'move') panToGhosts(node);
        }}
        onNodeMouseEnter={(_, node) =>
          hoverEnter(node.type === 'ghost' ? node.data.parentId : node.id)
        }
        onNodeMouseLeave={hoverLeave}
        onPaneClick={() => setAnchorId(null)}
        nodes={[...nodes, ...ghostNodes] as (MoveNodeType | GhostNodeType)[]}
        edges={[...edges, ...ghostEdges]}
        // ghosts aren't in the store; applyNodeChanges drops changes for
        // unknown ids, so the narrower handler type is safe here
        onNodesChange={
          onNodesChange as unknown as OnNodesChange<MoveNodeType | GhostNodeType>
        }
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ stroke: '#F5F5F5', strokeWidth: 1.4 }}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        snapGrid={[24, 24]}
        deleteKeyCode={['Backspace', 'Delete']}
        zoomOnDoubleClick={false}
        panOnScroll
        zoomActivationKeyCode={['Meta', 'Control']}
        minZoom={0.15}
        maxZoom={1.6}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        className="game-plan-flow"
        style={{ background: '#030303' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255,255,255,0.12)"
        />
        <BlueprintFrame />
        <FitOnFirstPaint />
        <Toolbar />
        <Controls showInteractive={false} position="bottom-left" />
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>
    </div>
  );
}

function FitOnFirstPaint() {
  const { fitView } = useReactFlow();
  const nodeCount = useGraph((s) => s.nodes.length);
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current || nodeCount === 0) return;
    didFit.current = true;
    const frame = requestAnimationFrame(() => {
      fitView({ padding: getFitPadding() });
    });
    return () => cancelAnimationFrame(frame);
  }, [fitView, nodeCount]);

  return null;
}

function BlueprintFrame() {
  // z-0 keeps the corner marks under React Flow panels (z-5), so they never
  // draw through the toolbar
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute left-8 top-8 h-8 w-8 border-l-2 border-t-2 border-neutral-800" />
      <div className="absolute bottom-8 right-8 h-8 w-8 border-b-2 border-r-2 border-neutral-800" />
      <div className="absolute right-8 top-20 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600 sm:block">
        GAME PLAN / CANVAS
      </div>
    </div>
  );
}

function EmptyState() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const addMove = useGraph((s) => s.addMove);
  const load = useGraph((s) => s.load);
  const add = () => {
    const p = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addMove({ x: Math.round(p.x / 24) * 24, y: Math.round(p.y / 24) * 24 });
  };
  const loadSample = () => {
    load(sampleNodes, sampleEdges);
    setTimeout(() => fitView({ padding: getFitPadding() }), 0);
  };
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="border border-neutral-800 bg-black/85 px-6 py-5 backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Empty Plan
        </p>
        <p className="mt-2 text-[24px] tracking-tight text-white">
          Start mapping your A-game.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="pointer-events-auto h-10 border border-white bg-white px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-black hover:bg-neutral-200"
            onClick={loadSample}
          >
            Load Sample
          </button>
          <button
            className="pointer-events-auto h-10 border border-neutral-700 bg-neutral-950 px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white hover:border-neutral-500 hover:bg-neutral-900"
            onClick={add}
          >
            Add Move
          </button>
        </div>
      </div>
    </div>
  );
}
