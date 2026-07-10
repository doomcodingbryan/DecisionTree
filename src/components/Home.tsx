import { useState } from 'react';
import { useGraph, type Tree } from '../store';
import { sampleEdges, sampleNodes } from '../data/sampleGraph';

const openPlan = (id: string) => {
  window.location.hash = `#/t/${id}`;
};

const btn =
  'h-10 border px-4 font-mono text-[11px] uppercase tracking-[0.16em]';
const btnPrimary = `${btn} border-black bg-black text-white hover:bg-neutral-800`;
const btnGhost = `${btn} border-neutral-300 bg-white text-neutral-900 hover:border-neutral-500 hover:bg-neutral-50`;

export default function Home() {
  const trees = useGraph((s) => s.trees);
  const createTree = useGraph((s) => s.createTree);
  const plans = Object.values(trees).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div
      className="min-h-screen bg-[#FAFAFA] text-neutral-900"
      style={{
        backgroundImage:
          'radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-8 top-8 h-8 w-8 border-l-2 border-t-2 border-neutral-300" />
        <div className="absolute bottom-8 right-8 h-8 w-8 border-b-2 border-r-2 border-neutral-300" />
        <div className="absolute right-8 top-20 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:block">
          GAME PLAN / LIBRARY
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          White Belt Club Style
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[32px] tracking-tight">Your Game Plans</h1>
          <button
            className={btnPrimary}
            onClick={() => openPlan(createTree())}
          >
            + New Plan
          </button>
        </div>
        {plans.length === 0 ? (
          <div className="mt-16 border border-neutral-300 bg-white/90 px-6 py-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              No Plans Yet
            </p>
            <p className="mt-2 text-[24px] tracking-tight">
              Start mapping your A-game.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                className={btnPrimary}
                onClick={() =>
                  openPlan(
                    createTree('Sample Game Plan', sampleNodes, sampleEdges),
                  )
                }
              >
                Start from Sample
              </button>
              <button className={btnGhost} onClick={() => openPlan(createTree())}>
                Blank Plan
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((tree) => (
              <PlanCard key={tree.id} tree={tree} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PlanCard({ tree }: { tree: Tree }) {
  const renameTree = useGraph((s) => s.renameTree);
  const deleteTree = useGraph((s) => s.deleteTree);
  const [editing, setEditing] = useState(false);

  const commit = (value: string) => {
    renameTree(tree.id, value.trim() || tree.name);
    setEditing(false);
  };

  return (
    <li className="group relative border border-neutral-300 bg-white transition-colors hover:border-indigo-400">
      <div className="flex h-8 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          Plan
        </span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="h-5 w-5 border border-neutral-300 font-mono text-[10px] leading-none text-neutral-500 hover:border-neutral-500 hover:text-black"
            title="Rename"
            onClick={() => setEditing(true)}
          >
            ✎
          </button>
          <button
            className="h-5 w-5 border border-neutral-300 font-mono text-[10px] leading-none text-neutral-500 hover:border-red-500 hover:text-red-500"
            title="Delete"
            onClick={() => {
              if (confirm(`Delete "${tree.name}"?`)) deleteTree(tree.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div
        className="block w-full cursor-pointer px-4 py-4 text-left"
        onClick={() => {
          if (!editing) openPlan(tree.id);
        }}
      >
        {editing ? (
          <input
            className="w-full bg-transparent text-[17px] tracking-tight text-neutral-900 outline-none"
            defaultValue={tree.name}
            autoFocus
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[17px] tracking-tight">
            {tree.name}
          </span>
        )}
        <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          {tree.nodes.length} moves · {tree.edges.length} links
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          Updated {new Date(tree.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </li>
  );
}
