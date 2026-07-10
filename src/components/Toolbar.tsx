import { Panel, useReactFlow } from '@xyflow/react';
import { useRef } from 'react';
import { useGraph } from '../store';
import { sampleEdges, sampleNodes } from '../data/sampleGraph';

const btn =
  'h-9 border border-neutral-300 bg-white px-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-800 hover:border-neutral-500 hover:bg-neutral-50 hover:text-black disabled:pointer-events-none disabled:opacity-35 sm:px-3 sm:text-[10px]';
const getFitPadding = () => (window.innerWidth < 700 ? 0.75 : 0.35);

export default function Toolbar() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const clear = useGraph((s) => s.clear);
  const load = useGraph((s) => s.load);
  const addMove = useGraph((s) => s.addMove);
  const nodes = useGraph((s) => s.nodes);
  const edges = useGraph((s) => s.edges);
  const planName = useGraph(
    (s) => (s.activeId ? s.trees[s.activeId]?.name : undefined) ?? 'Untitled Plan',
  );
  const undo = useGraph((s) => s.undo);
  const redo = useGraph((s) => s.redo);
  const canUndo = useGraph((s) => s.past.length > 0);
  const canRedo = useGraph((s) => s.future.length > 0);
  const fileRef = useRef<HTMLInputElement>(null);

  const addCenteredMove = () => {
    const p = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addMove({ x: Math.round(p.x / 24) * 24, y: Math.round(p.y / 24) * 24 });
  };

  const loadSample = () => {
    if (nodes.length && !confirm('Replace the current plan with the sample?'))
      return;
    load(sampleNodes, sampleEdges);
    setTimeout(() => fitView({ padding: getFitPadding() }), 0);
  };

  const exportJson = () => {
    const { nodes, edges } = useGraph.getState();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
        type: 'application/json',
      }),
    );
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'bjj-graph.json',
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { nodes, edges } = JSON.parse(await file.text());
      if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error();
      if (
        useGraph.getState().nodes.length &&
        !confirm('Replace the current plan with the imported graph?')
      )
        return;
      load(nodes, edges);
      setTimeout(() => fitView({ padding: 0.2 }), 0);
    } catch {
      alert('Invalid graph JSON.');
    }
  };

  return (
    <>
      <Panel
        position="top-left"
        className="flex max-w-[calc(100%-2rem)] flex-wrap items-stretch gap-2"
      >
        <div className="flex min-h-12 w-full max-w-full flex-wrap border border-neutral-300 bg-white/90 backdrop-blur sm:w-auto">
          <div className="flex min-w-44 flex-col justify-center border-b border-neutral-200 px-3 py-2 sm:border-b-0 sm:border-r sm:py-0">
            <a
              href="#/"
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black"
            >
              ← All Plans
            </a>
            <span className="max-w-52 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] tracking-tight text-neutral-900">
              {planName}
            </span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-1 p-1.5 sm:w-auto">
            <button className={btn} onClick={addCenteredMove}>
              Add
            </button>
            <button
              className={btn}
              onClick={() => fitView({ padding: getFitPadding() })}
            >
              Fit
            </button>
            <button
              className={btn}
              disabled={!canUndo}
              onClick={undo}
              title="Undo (⌘Z)"
            >
              Undo
            </button>
            <button
              className={btn}
              disabled={!canRedo}
              onClick={redo}
              title="Redo (⇧⌘Z)"
            >
              Redo
            </button>
            <button className={btn} onClick={loadSample}>
              Sample
            </button>
            <button className={btn} onClick={exportJson}>
              Export
            </button>
            <button className={btn} onClick={() => fileRef.current?.click()}>
              Import
            </button>
            <button
              className={btn}
              onClick={() => {
                if (confirm('Clear the entire canvas?')) clear();
              }}
            >
              Clear
            </button>
          </div>
          <div className="hidden items-center gap-3 border-l border-neutral-200 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:flex">
            <span>{nodes.length} nodes</span>
            <span className="h-4 w-px bg-neutral-300" />
            <span>{edges.length} links</span>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            importJson(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </Panel>
    </>
  );
}
