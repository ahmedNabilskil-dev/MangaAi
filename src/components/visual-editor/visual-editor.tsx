
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NodeData, NodeType } from '@/types/nodes';
// Removed useQuery import
import { useVisualEditorStore } from '@/store/visual-editor-store';
// Removed in-memory service import
import { layoutElements } from '@/lib/layout-utils';
import CustomNode from './custom-node'; // Import the new custom node
import type { MangaProject, Character, Chapter, Scene, Panel, PanelDialogue } from '@/types/entities'; // Import entity types
import { MangaStatus } from '@/types/enums'; // Import enum


// Use the new CustomNode for all types
const nodeTypes: NodeTypes = {
    project: CustomNode,
    chapter: CustomNode,
    scene: CustomNode,
    panel: CustomNode,
    dialogue: CustomNode,
    character: CustomNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: 'hsl(var(--primary) / 0.7)',
    },
    style: {
        strokeWidth: 1.5,
        stroke: 'hsl(var(--border))',
    },
    type: 'smoothstep', // Use smoothstep for potentially better routing visually
};

// --- Sample Data Generation ---
function generateSampleProjectData(): { nodes: Node<NodeData>[], edges: Edge[] } {
    console.log("Generating sample project data...");
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    // --- Create Sample Entities ---
    const projectId = 'proj-sample-1';
    const sampleProject: MangaProject = {
        id: projectId,
        title: 'Adventures in CodeLand',
        description: 'A journey through a world made of code.',
        status: MangaStatus.DRAFT,
        genre: 'Fantasy Comedy',
        creatorId: 'user-sample',
        viewCount: 10,
        likeCount: 2,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const char1Id = 'char-sample-1';
    const sampleChar1: Character = {
        id: char1Id,
        name: 'Alex the Algorithm',
        role: 'protagonist',
        briefDescription: 'A brave sorting algorithm.',
        mangaProjectId: projectId,
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const char2Id = 'char-sample-2';
    const sampleChar2: Character = {
        id: char2Id,
        name: 'Bugsy the Error',
        role: 'antagonist',
        briefDescription: 'A mischievous runtime error.',
        mangaProjectId: projectId,
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const chapter1Id = 'chap-sample-1';
    const sampleChapter1: Chapter = {
        id: chapter1Id,
        chapterNumber: 1,
        title: 'The First Compile',
        mangaProjectId: projectId,
        isAiGenerated: false,
        isPublished: false,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const scene1Id = 'scene-sample-1';
    const sampleScene1: Scene = {
        id: scene1Id,
        order: 0,
        title: 'Meeting the Compiler',
        sceneContext: { setting: 'Initialization Vector', mood: 'Anticipation', presentCharacters: [sampleChar1.name] },
        chapterId: chapter1Id,
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const panel1Id = 'panel-sample-1';
    const samplePanel1: Panel = {
        id: panel1Id,
        order: 0,
        panelContext: { action: 'Alex stands nervously before the Compiler gate', lighting: 'Bright, sterile' },
        sceneId: scene1Id,
        characterIds: [char1Id],
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

     const dialogue1Id = 'dlg-sample-1';
     const sampleDialogue1: PanelDialogue = {
         id: dialogue1Id,
         content: "Here goes nothing...",
         order: 0,
         panelId: panel1Id,
         speakerId: char1Id,
         isAiGenerated: false,
         createdAt: new Date(),
         updatedAt: new Date(),
     };

    const scene2Id = 'scene-sample-2';
    const sampleScene2: Scene = {
        id: scene2Id,
        order: 1,
        title: 'The First Bug',
        sceneContext: { setting: 'Memory Heap', mood: 'Confusing', presentCharacters: [sampleChar1.name, sampleChar2.name] },
        chapterId: chapter1Id,
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

     const panel2Id = 'panel-sample-2';
     const samplePanel2: Panel = {
         id: panel2Id,
         order: 0,
         panelContext: { action: 'Bugsy appears, laughing', lighting: 'Dim, glitchy' },
         sceneId: scene2Id,
         characterIds: [char1Id, char2Id],
         isAiGenerated: false,
         createdAt: new Date(),
         updatedAt: new Date(),
     };

     const dialogue2Id = 'dlg-sample-2';
     const sampleDialogue2: PanelDialogue = {
         id: dialogue2Id,
         content: "Hehehe! Tripped you up!",
         order: 0,
         panelId: panel2Id,
         speakerId: char2Id,
         isAiGenerated: false,
         createdAt: new Date(),
         updatedAt: new Date(),
     };


    // --- Convert to Flow Elements ---

    // Project Node
    nodes.push({
        id: sampleProject.id,
        type: 'project',
        position: { x: 0, y: 0 },
        data: {
            label: sampleProject.title,
            type: 'project',
            properties: sampleProject, // Pass full data
        }
    });

    // Character Nodes & Edges to Project
    [sampleChar1, sampleChar2].forEach(character => {
         nodes.push({
             id: character.id,
             type: 'character',
             position: { x: 0, y: 0 },
             data: { label: character.name, type: 'character', properties: character }
         });
         edges.push({
             id: `e-${projectId}-char-${character.id}`, source: projectId, target: character.id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.5)', strokeDasharray: '4 4', strokeWidth: 1 }
         });
     });

    // Chapter Node & Edge to Project
    nodes.push({
        id: sampleChapter1.id,
        type: 'chapter',
        position: { x: 0, y: 0 },
        data: { label: `Ch. ${sampleChapter1.chapterNumber}: ${sampleChapter1.title}`, type: 'chapter', properties: sampleChapter1 }
    });
    edges.push({ id: `e-${projectId}-${chapter1Id}`, source: projectId, target: chapter1Id });

    // Scene 1 Node & Edge to Chapter 1
    nodes.push({
        id: sampleScene1.id,
        type: 'scene',
        position: { x: 0, y: 0 },
        data: { label: sampleScene1.title, type: 'scene', properties: sampleScene1 }
    });
    edges.push({ id: `e-${chapter1Id}-${scene1Id}`, source: chapter1Id, target: scene1Id });

    // Panel 1 Node & Edge to Scene 1
    nodes.push({
        id: samplePanel1.id,
        type: 'panel',
        position: { x: 0, y: 0 },
        data: { label: samplePanel1.panelContext.action, type: 'panel', properties: samplePanel1 }
    });
    edges.push({ id: `e-${scene1Id}-${panel1Id}`, source: scene1Id, target: panel1Id });

    // Dialogue 1 Node & Edge to Panel 1
     nodes.push({
        id: sampleDialogue1.id,
        type: 'dialogue',
        position: { x: 0, y: 0 },
        data: { label: `"${sampleDialogue1.content}"`, type: 'dialogue', properties: sampleDialogue1 }
    });
    edges.push({ id: `e-${panel1Id}-${dialogue1Id}`, source: panel1Id, target: dialogue1Id });

     // Edge from Character 1 to Panel 1
     edges.push({
         id: `e-char-${char1Id}-panel-${panel1Id}`, source: char1Id, target: panel1Id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.5)', strokeDasharray: '4 4', strokeWidth: 1 }, animated: false, markerEnd: undefined,
     });


    // Scene 2 Node & Edge to Chapter 1
     nodes.push({
        id: sampleScene2.id,
        type: 'scene',
        position: { x: 0, y: 0 },
        data: { label: sampleScene2.title, type: 'scene', properties: sampleScene2 }
    });
    edges.push({ id: `e-${chapter1Id}-${scene2Id}`, source: chapter1Id, target: scene2Id });

    // Panel 2 Node & Edge to Scene 2
    nodes.push({
        id: samplePanel2.id,
        type: 'panel',
        position: { x: 0, y: 0 },
        data: { label: samplePanel2.panelContext.action, type: 'panel', properties: samplePanel2 }
    });
    edges.push({ id: `e-${scene2Id}-${panel2Id}`, source: scene2Id, target: panel2Id });

    // Dialogue 2 Node & Edge to Panel 2
     nodes.push({
        id: sampleDialogue2.id,
        type: 'dialogue',
        position: { x: 0, y: 0 },
        data: { label: `"${sampleDialogue2.content}"`, type: 'dialogue', properties: sampleDialogue2 }
    });
    edges.push({ id: `e-${panel2Id}-${dialogue2Id}`, source: panel2Id, target: dialogue2Id });

     // Edges from Characters to Panel 2
     edges.push({
        id: `e-char-${char1Id}-panel-${panel2Id}`, source: char1Id, target: panel2Id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.5)', strokeDasharray: '4 4', strokeWidth: 1 }, animated: false, markerEnd: undefined,
     });
     edges.push({
        id: `e-char-${char2Id}-panel-${panel2Id}`, source: char2Id, target: panel2Id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.5)', strokeDasharray: '4 4', strokeWidth: 1 }, animated: false, markerEnd: undefined,
     });


    console.log("Sample data generated:", { nodes: nodes.length, edges: edges.length });
    return layoutElements(nodes, edges); // Apply layout
}


// --- Main Component ---
function VisualEditorInternal() {
  const {
    nodes,
    edges,
    selectedNode,
    setNodes,
    setEdges,
    setSelectedNode,
    refreshCounter, // Still use counter for potential future refresh logic
    setViewportInitialized,
    viewportInitialized
  } = useVisualEditorStore();

  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // Use state for local sample data
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const [localEdges, setLocalEdges] = useState<Edge[]>([]);

  // Generate sample data on mount and update store
  useEffect(() => {
    console.log("Generating and setting sample data on mount...");
    const { nodes: sampleNodes, edges: sampleEdges } = generateSampleProjectData();
    setLocalNodes(sampleNodes); // Use local state first
    setLocalEdges(sampleEdges);
    setNodes(sampleNodes); // Update Zustand store as well
    setEdges(sampleEdges);

    // Fit view after data is likely rendered
    if (!viewportInitialized && sampleNodes.length > 0) {
        const timer = setTimeout(() => {
            console.log("Fitting view for sample data...");
            fitView({ padding: 0.2, duration: 600 });
            setViewportInitialized(true);
        }, 150); // Delay to allow initial render
        return () => clearTimeout(timer);
    }
  // Run only once on mount: empty dependency array
  // Adding other dependencies like setNodes/setEdges causes re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView, setViewportInitialized, viewportInitialized]);


  // --- Handlers remain mostly the same, using Zustand store ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
        const updatedNodes = applyNodeChanges(changes, nodes);
        setNodes(updatedNodes); // Update store
        setLocalNodes(updatedNodes); // Update local state if needed for direct render
    },
    [setNodes, nodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
        const updatedEdges = applyEdgeChanges(changes, edges);
        setEdges(updatedEdges); // Update store
        setLocalEdges(updatedEdges); // Update local state
    },
    [setEdges, edges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
        const newEdge = { ...connection, type: 'smoothstep' }; // Ensure edge type
        const updatedEdges = addEdge(newEdge, edges);
        setEdges(updatedEdges);
        setLocalEdges(updatedEdges);
    },
    [setEdges, edges]
  );

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    console.log("Node clicked, updating store:", node.id, node.data.type);
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handlePaneClick = useCallback(() => {
      console.log("Pane clicked, clearing selection.");
      setSelectedNode(null);
  }, [setSelectedNode]);


  return (
    <div ref={reactFlowWrapper} style={{ height: '100%', width: '100%', position: 'relative' }}>
        {/* Removed loading/error states related to data fetching */}
        {/* Removed refreshing indicator */}
      <ReactFlow
        nodes={nodes} // Use nodes from Zustand store for rendering
        edges={edges} // Use edges from Zustand store
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes} // Use custom nodes
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={false} // Fit view is handled by useEffect
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gradient-to-br from-background to-blue-50" // Example gradient background
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        selectNodesOnDrag={false}
        // Improve performance slightly
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable position="bottom-left" nodeColor={(node) => {
                switch (node.type) {
                    case 'project': return 'rgb(192, 132, 252)'; // purple-400
                    case 'chapter': return 'rgb(96, 165, 250)'; // blue-400
                    case 'scene': return 'rgb(74, 222, 128)'; // green-400
                    case 'panel': return 'rgb(250, 204, 21)'; // yellow-400
                    case 'dialogue': return 'rgb(244, 114, 182)'; // pink-400
                    case 'character': return 'rgb(129, 140, 248)'; // indigo-400
                    default: return '#e2e8f0';
                }
        }}/>
        <Background color="hsl(var(--border) / 0.3)" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

// Wrap the internal component with ReactFlowProvider
export default function VisualEditor() {
    return (
        <ReactFlowProvider>
            <VisualEditorInternal />
        </ReactFlowProvider>
    );
}
