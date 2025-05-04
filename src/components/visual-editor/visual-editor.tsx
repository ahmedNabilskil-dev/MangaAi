'use client';

import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Controls,
  Background,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeTypes,
  type DefaultEdgeOptions,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NodeData } from '@/types/nodes'; // Ensure this type exists and is defined

// Import custom node components when they are created
// import ProjectNode from './custom-nodes/project-node';
// import ChapterNode from './custom-nodes/chapter-node';
// import SceneNode from './custom-nodes/scene-node';
// import PanelNode from './custom-nodes/panel-node';
// import DialogNode from './custom-nodes/dialog-node';
// import CharacterNode from './custom-nodes/character-node';

const initialNodes: Node<NodeData>[] = [
  { id: 'project-1', type: 'project', position: { x: 250, y: 5 }, data: { label: 'My First Manga Project', type: 'project', properties: {} } },
];
const initialEdges: Edge[] = [];

// Define custom node types here once created
// const nodeTypes: NodeTypes = {
//   project: ProjectNode,
//   chapter: ChapterNode,
//   scene: SceneNode,
//   panel: PanelNode,
//   dialog: DialogNode,
//   character: CharacterNode,
// };

// Placeholder for node types until custom nodes are implemented
const nodeTypes: NodeTypes = {
    project: (props) => <div style={{ padding: 10, border: '1px solid #777', borderRadius: 5, background: '#eee' }}>{props.data.label} (Project)</div>,
    chapter: (props) => <div style={{ padding: 10, border: '1px solid #f59e0b', borderRadius: 5, background: '#fef3c7' }}>{props.data.label} (Chapter)</div>,
    scene: (props) => <div style={{ padding: 10, border: '1px solid #10b981', borderRadius: 5, background: '#d1fae5' }}>{props.data.label} (Scene)</div>,
    panel: (props) => <div style={{ padding: 10, border: '1px solid #6366f1', borderRadius: 5, background: '#e0e7ff' }}>{props.data.label} (Panel)</div>,
    dialog: (props) => <div style={{ padding: 10, border: '1px solid #ec4899', borderRadius: 5, background: '#fce7f3' }}>{props.data.label} (Dialog)</div>,
    character: (props) => <div style={{ padding: 10, border: '1px solid #8b5cf6', borderRadius: 5, background: '#f5f3ff' }}>{props.data.label} (Character)</div>,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: 'hsl(var(--primary))',
    },
    style: {
        strokeWidth: 2,
        stroke: 'hsl(var(--primary))',
    },
};


interface VisualEditorProps {
    onNodeClick: (data: NodeData) => void;
}

export default function VisualEditor({ onNodeClick }: VisualEditorProps) {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    onNodeClick(node.data);
  }, [onNodeClick]);


  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="bg-background"
        onNodeClick={handleNodeClick} // Pass the handler
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background color="hsl(var(--border))" gap={16} />
      </ReactFlow>
    </div>
  );
}
