'use client';

import React, { useCallback, useState, useEffect } from 'react';
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
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NodeData } from '@/types/nodes';
import { useQuery } from '@tanstack/react-query'; // For fetching initial data
// Import custom node components when they are created
// import ProjectNode from './custom-nodes/project-node';
// ... other custom nodes

// Placeholder fetch function - replace with your actual API call
// e.g., fetch from Strapi or your backend that structures the flow data
async function fetchFlowData(): Promise<{ nodes: Node<NodeData>[], edges: Edge[] }> {
    console.log("Fetching flow data...");
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- START MOCK DATA ---
    // This should be replaced by data fetched from your backend (e.g., Strapi)
    // The backend would determine node positions and connections based on relationships
    const mockProjectId = 'proj-123';
    const mockChapterId1 = 'chap-abc';
    const mockSceneId1_1 = 'scene-xyz';

    const initialNodes: Node<NodeData>[] = [
      {
        id: mockProjectId,
        type: 'project', // Use the correct type string
        position: { x: 50, y: 50 },
        data: {
          label: 'My First Manga Project',
          type: 'project',
          properties: { // Include properties based on your MangaProject entity
            id: mockProjectId, // Crucial: Pass the ID here
            title: 'My First Manga Project',
            description: 'A cool story about...',
            status: 'draft',
            // ... other relevant properties fetched from backend
          }
        }
      },
      {
        id: mockChapterId1,
        type: 'chapter',
        position: { x: 300, y: 150 },
        data: {
            label: 'Chapter 1: The Beginning',
            type: 'chapter',
            properties: {
                id: mockChapterId1,
                title: 'Chapter 1: The Beginning',
                chapterNumber: 1,
                summary: 'Introduction to the world.',
                mangaProjectId: mockProjectId, // Include foreign key if useful client-side
                // ... other chapter properties
            }
        }
      },
      {
        id: mockSceneId1_1,
        type: 'scene',
        position: { x: 550, y: 250 },
        data: {
            label: 'Scene 1: Awakening',
            type: 'scene',
            properties: {
                id: mockSceneId1_1,
                title: 'Scene 1: Awakening',
                order: 1,
                description: 'The hero wakes up.',
                chapterId: mockChapterId1, // Include foreign key
                sceneContext: { setting: 'Bedroom', mood: 'Mysterious', presentCharacters: ['Hero'] },
                // ... other scene properties
            }
        }
      },
      // Add more nodes (panels, characters, dialogues) as needed based on fetched data
    ];

    const initialEdges: Edge[] = [
        { id: `e-${mockProjectId}-${mockChapterId1}`, source: mockProjectId, target: mockChapterId1, animated: true },
        { id: `e-${mockChapterId1}-${mockSceneId1_1}`, source: mockChapterId1, target: mockSceneId1_1, animated: true },
        // Add more edges based on relationships
    ];
    // --- END MOCK DATA ---


    return { nodes: initialNodes, edges: initialEdges };
}


// Define custom node types (using placeholders for now)
// TODO: Replace placeholders with actual custom node components
const PlaceholderNodeComponent = ({ data }: { data: NodeData }) => (
    <div style={{
        padding: '10px 15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        background: '#f9f9f9',
        fontSize: '12px',
        minWidth: '150px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
        <strong style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>{data.type}</strong>
        {data.label}
        {/* Displaying ID for debugging */}
        {data.properties?.id && <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>ID: {data.properties.id.substring(0, 8)}...</div>}
    </div>
);

const nodeTypes: NodeTypes = {
    project: PlaceholderNodeComponent,
    chapter: PlaceholderNodeComponent,
    scene: PlaceholderNodeComponent,
    panel: PlaceholderNodeComponent,
    dialogue: PlaceholderNodeComponent,
    character: PlaceholderNodeComponent,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: 'hsl(var(--primary))',
    },
    style: {
        strokeWidth: 1.5,
        stroke: 'hsl(var(--primary))',
    },
};

interface VisualEditorProps {
    onNodeClick: (data: NodeData) => void; // Pass the full NodeData
}

export default function VisualEditor({ onNodeClick }: VisualEditorProps) {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { fitView } = useReactFlow(); // Hook for controlling the view

  // Fetch initial data using React Query
  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['reactFlowData'], // Unique key for the query
    queryFn: fetchFlowData,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Optional: prevent refetching on window focus
  });

  // Update state when data is fetched
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
       // Fit view after initial nodes are set
       // Use a small timeout to ensure nodes are rendered
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 }); // Add padding and animation
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialData, fitView]);

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

  // Updated handler to pass the full node.data object
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    console.log("Node clicked:", node); // Log the full node object
    if (node.data) {
        onNodeClick(node.data); // Pass the entire data object
    } else {
        console.warn("Clicked node is missing data:", node);
    }
  }, [onNodeClick]);

   if (isLoading) {
        return <div className="flex items-center justify-center h-full w-full bg-background text-foreground">Loading Editor...</div>;
   }

   if (error) {
        return <div className="flex items-center justify-center h-full w-full bg-destructive text-destructive-foreground p-4">Error loading flow data: {error.message}</div>;
   }

  return (
    // Ensure the container has explicit height and width for React Flow
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        // fitView // Let the useEffect handle fitView after data load
        className="bg-background" // Use Tailwind class for background
        onNodeClick={handleNodeClick} // Use the updated handler
        // Add proOptions if needed, e.g., to hide the attribution
        // proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} /> {/* Optional: hide interactivity control */}
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background color="hsl(var(--border) / 0.5)" gap={20} size={1.5} /> {/* Use HSL color and adjust gap/size */}
      </ReactFlow>
    </div>
  );
}
