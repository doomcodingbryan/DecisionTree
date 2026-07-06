import {
  ConnectionLineType,
  Controls,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraph } from '../store';
import MoveNode from './MoveNode';
import Toolbar from './Toolbar';
import TransitionEdge from './TransitionEdge';

const nodeTypes = { move: MoveNode };
const edgeTypes = { transition: TransitionEdge };

export default function Canvas() {
  const nodes = useGraph((s) => s.nodes);
  const edges = useGraph((s) => s.edges);
  const onNodesChange = useGraph((s) => s.onNodesChange);
  const onEdgesChange = useGraph((s) => s.onEdgesChange);
  const onConnect = useGraph((s) => s.onConnect);

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#000000', strokeWidth: 1.5 }}
        defaultEdgeOptions={{ type: 'transition' }}
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode={['Backspace', 'Delete']}
        zoomOnDoubleClick={false}
        panOnScroll
        zoomActivationKeyCode={['Meta', 'Control']}
        style={{ background: '#E4E4E4' }}
      >
        <Toolbar />
        <Controls showInteractive={false} position="bottom-left" />
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>
    </div>
  );
}

function EmptyState() {
  const { screenToFlowPosition } = useReactFlow();
  const addMove = useGraph((s) => s.addMove);
  const add = () => {
    const p = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addMove({ x: Math.round(p.x / 20) * 20, y: Math.round(p.y / 20) * 20 });
  };
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
      <p className="text-xl text-neutral-600">Add your first move to begin.</p>
      <button
        className="pointer-events-auto bg-black px-4 py-2 text-sm font-bold text-white hover:bg-neutral-700"
        onClick={add}
      >
        + Add Move
      </button>
    </div>
  );
}
