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
  useGraph,
  type GhostNode as GhostNodeType,
  type MoveNode as MoveNodeType,
  type TransitionEdge as TransitionEdgeType,
} from '../store';
import { sampleEdges, sampleNodes } from '../data/sampleGraph';
import { edgeLabelFor, MOVE_CATEGORY } from '../data/moves';
import { getSuggestions } from '../data/transitions';
import GhostNode from './GhostNode';
import MoveLibrary from './MoveLibrary';
import MoveNode from './MoveNode';
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
    else window.location.hash = '#/plans'; // unknown id → back to the library
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
    return <div className="h-screen w-screen bg-[#F3EFE2]" />;
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen bg-[#F3EFE2] text-neutral-900">
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

  // Ghost cards: derived at render time, never stored — accepting one calls
  // addChild, so the real graph stays clean. Hovering a node offers the
  // pick-your-own card; the node's AI button toggles its two recommendation
  // cards. Hovering a ghost keeps its parent anchored; a grace period covers
  // the pointer's trip across the gap between parent and ghost.
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const aiFor = useGraph((s) => s.aiFor);
  const toggleAi = useGraph((s) => s.toggleAi);
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
  const hoverAnchor = nodes.find((n) => n.id === anchorId);
  const aiAnchor = nodes.find((n) => n.id === aiFor);
  const ghostNodes: GhostNodeType[] = [];
  let ghostEdges: TransitionEdgeType[] = [];
  if (hoverAnchor || aiAnchor) {
    // deep chains surface submissions first (time to finish)
    const poolFor = (anchor: MoveNodeType) => {
      const taken = new Set(
        edges
          .filter((e) => e.source === anchor.id)
          .map((e) => nodes.find((n) => n.id === e.target)?.data.label),
      );
      let pool = getSuggestions(anchor.data.label)
        .map((s) => s.to)
        .filter((m) => !taken.has(m) && !dismissed.has(`${anchor.id}→${m}`));
      if (chainDepth(anchor.id, edges) >= 2) {
        pool = [
          ...pool.filter((m) => MOVE_CATEGORY[m] === 'Submissions'),
          ...pool.filter((m) => MOVE_CATEGORY[m] !== 'Submissions'),
        ];
      }
      return pool;
    };
    // ghost cards drop straight down from their parent — centered, one row
    // at a time, until the band is clear of real nodes and other ghosts
    const placed: { x: number; y: number }[] = [];
    const blocked = (p: { x: number; y: number }) =>
      [...nodes.map((n) => n.position), ...placed].some(
        (q) => Math.abs(q.x - p.x) < 224 && Math.abs(q.y - p.y) < 104,
      );
    const dropIn = (parent: MoveNodeType, offsets: number[]) => {
      const slot = (dx: number, row: number) => ({
        x: parent.position.x + dx,
        y: parent.position.y + 160 * row,
      });
      let row = 1;
      while (offsets.some((dx) => blocked(slot(dx, row)))) row++;
      return offsets.map((dx) => {
        const p = slot(dx, row);
        placed.push(p);
        return p;
      });
    };
    const ghost = (
      id: string,
      position: { x: number; y: number },
      data: GhostNodeType['data'],
    ): GhostNodeType => ({
      id,
      type: 'ghost' as const,
      position,
      data,
      draggable: false,
      selectable: false,
      // explicit size: ghosts aren't in the store, so React Flow's measured
      // dimensions are never applied back — without this they stay hidden
      width: 208,
      height: 88,
    });
    // the pick-your-own card yields while the node's AI cards are up
    if (hoverAnchor && aiAnchor?.id !== hoverAnchor.id) {
      const [p] = dropIn(hoverAnchor, [0]);
      ghostNodes.push(
        ghost(`ghost-${hoverAnchor.id}-custom`, p, {
          label: '',
          parentId: hoverAnchor.id,
          custom: true,
          suggested: poolFor(hoverAnchor).slice(0, 6),
        }),
      );
    }
    if (aiAnchor) {
      const picks = poolFor(aiAnchor).slice(0, 2);
      if (picks.length) {
        // symmetric pair centered under the parent
        const spots = dropIn(aiAnchor, picks.length === 2 ? [-120, 120] : [0]);
        picks.forEach((label, i) =>
          ghostNodes.push(
            ghost(`ghost-${aiAnchor.id}-${label}`, spots[i], {
              label,
              parentId: aiAnchor.id,
            }),
          ),
        );
      }
    }
    ghostEdges = ghostNodes.map((g) => ({
      id: `ghost-edge-${g.id}`,
      source: g.data.parentId,
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
  const panToGhosts = (node: {
    id: string;
    position: { x: number; y: number };
  }) => {
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
        // panning slides the canvas under the pointer, which un-hovers the
        // anchor mid-animation — re-assert it once the pan lands
      ).then(() => hoverEnter(node.id));
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
        onPaneClick={() => {
          setAnchorId(null);
          toggleAi(null);
        }}
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
        connectionLineStyle={{ stroke: '#0D9488', strokeWidth: 1.4 }}
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
        style={{ background: '#F3EFE2' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(23,23,23,0.18)"
        />
        <BlueprintFrame />
        <FitOnFirstPaint />
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

// How many moves deep a node sits, walking the first incoming edge per node,
// cycle-guarded. ponytail: a hint for ranking, not real graph analysis.
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

function BlueprintFrame() {
  // z-0 keeps the corner marks under React Flow panels (z-5), so they never
  // draw through the toolbar
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute left-8 top-8 h-8 w-8 border-l-2 border-t-2 border-[#B7B098]" />
      <div className="absolute bottom-8 right-8 h-8 w-8 border-b-2 border-r-2 border-[#B7B098]" />
      <div className="absolute right-8 top-20 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:block">
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
      <div className="border border-neutral-900 bg-[#FBF9F0]/90 px-6 py-5 backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Empty Plan
        </p>
        <p className="mt-2 font-serif text-[24px] tracking-tight text-neutral-900">
          Start mapping your A-game.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="pointer-events-auto h-10 rounded-full border border-black bg-black px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white hover:bg-neutral-800"
            onClick={loadSample}
          >
            Load Sample
          </button>
          <button
            className="pointer-events-auto h-10 rounded-full border border-neutral-900 bg-[#F3EFE2] px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-900 hover:bg-[#E7E1CD]"
            onClick={add}
          >
            Add Move
          </button>
        </div>
      </div>
    </div>
  );
}
