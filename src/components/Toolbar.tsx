import { Panel, useReactFlow } from '@xyflow/react';
import { useRef } from 'react';
import { useGraph } from '../store';

const btn =
  'bg-black px-3 py-2 text-sm font-bold text-white hover:bg-neutral-700';

export default function Toolbar() {
  const { fitView } = useReactFlow();
  const clear = useGraph((s) => s.clear);
  const load = useGraph((s) => s.load);
  const fileRef = useRef<HTMLInputElement>(null);

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
      load(nodes, edges);
      setTimeout(() => fitView({ padding: 0.2 }), 0);
    } catch {
      alert('Invalid graph JSON.');
    }
  };

  return (
    <Panel position="top-left" className="flex gap-1">
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
  );
}
