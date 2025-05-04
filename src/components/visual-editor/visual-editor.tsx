
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
  useStoreApi, // Import useStoreApi
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NodeData, NodeType } from '@/types/nodes';
import { useVisualEditorStore } from '@/store/visual-editor-store';
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
        description: 'A journey through a world made of code. This project follows the brave Alex and the mischievous Bugsy.',
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
        briefDescription: 'A brave sorting algorithm, always trying to optimize.',
        mangaProjectId: projectId,
        imgUrl: 'https://picsum.photos/seed/alex/200/300', // Placeholder image
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const char2Id = 'char-sample-2';
    const sampleChar2: Character = {
        id: char2Id,
        name: 'Bugsy the Error',
        role: 'antagonist',
        briefDescription: 'A mischievous runtime error, loves causing chaos.',
        mangaProjectId: projectId,
        imgUrl: 'https://picsum.photos/seed/bugsy/200/300', // Placeholder image
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
        summary: 'Alex begins their journey, encountering the Compiler and the first signs of trouble.',
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
        panelContext: { action: 'Alex stands nervously before the intimidating Compiler gate, circuits humming.', lighting: 'Bright, sterile', effects: [], dramaticPurpose: 'Introduce main character and setting', narrativePosition: 'Beginning' },
        sceneId: scene1Id,
        characterIds: [char1Id],
        imageUrl: 'https://picsum.photos/seed/panel1/400/200', // Placeholder image
        isAiGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

     const dialogue1Id = 'dlg-sample-1';
     const sampleDialogue1: PanelDialogue = {
         id: dialogue1Id,
         content: "Here goes nothing... Hope I pass validation.",
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
         panelContext: { action: 'Bugsy appears with a glitchy shimmer, laughing mischievously at Alex.', lighting: 'Dim, flickering', effects: ['glitch', 'distortion'], dramaticPurpose: 'Introduce antagonist', narrativePosition: 'Middle' },
         sceneId: scene2Id,
         characterIds: [char1Id, char2Id],
         imageUrl: 'https://picsum.photos/seed/panel2/400/200', // Placeholder image
         isAiGenerated: false,
         createdAt: new Date(),
         updatedAt: new Date(),
     };

     const dialogue2Id = 'dlg-sample-2';
     const sampleDialogue2: PanelDialogue = {
         id: dialogue2Id,
         content: "Hehehe! Tripped you up! Can't catch me!",
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
        position: { x: 0, y: 0 }, // Initial position, layout will overwrite
        data: {
            label: sampleProject.title,
            type: 'project',
            properties: sampleProject, // Pass full data
        }
    });

    // Character Nodes (no layout edges needed)
    [sampleChar1, sampleChar2].forEach(character => {
         nodes.push({
             id: character.id,
             type: 'character',
             position: { x: 0, y: 0 }, // Initial position
             data: { label: character.name, type: 'character', properties: character }
         });
         // Edge to project (for display only, mark for layout ignore)
         edges.push({
             id: `e-${projectId}-char-${character.id}`, source: projectId, target: character.id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.3)', strokeDasharray: '4 4', strokeWidth: 1 }, data: { noLayout: true } // Mark edge to ignore in layout
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
        data: { label: `Panel ${samplePanel1.order + 1}`, type: 'panel', properties: samplePanel1 } // Use order for label
    });
    edges.push({ id: `e-${scene1Id}-${panel1Id}`, source: scene1Id, target: panel1Id });

    // Dialogue 1 Node & Edge to Panel 1
     nodes.push({
        id: sampleDialogue1.id,
        type: 'dialogue',
        position: { x: 0, y: 0 },
        data: { label: `Dialogue ${sampleDialogue1.order + 1}`, type: 'dialogue', properties: sampleDialogue1 } // Use order for label
    });
    edges.push({ id: `e-${panel1Id}-${dialogue1Id}`, source: panel1Id, target: dialogue1Id });

     // Edge from Character 1 to Panel 1 (for display only, mark noLayout)
     edges.push({
         id: `e-char-${char1Id}-panel-${panel1Id}`, source: char1Id, target: panel1Id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.3)', strokeDasharray: '4 4', strokeWidth: 1 }, animated: false, markerEnd: undefined, data: { noLayout: true }
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
        data: { label: `Panel ${samplePanel2.order + 1}`, type: 'panel', properties: samplePanel2 } // Use order for label
    });
    edges.push({ id: `e-${scene2Id}-${panel2Id}`, source: scene2Id, target: panel2Id });

    // Dialogue 2 Node & Edge to Panel 2
     nodes.push({
        id: sampleDialogue2.id,
        type: 'dialogue',
        position: { x: 0, y: 0 },
        data: { label: `Dialogue ${sampleDialogue2.order + 1}`, type: 'dialogue', properties: sampleDialogue2 } // Use order for label
    });
    edges.push({ id: `e-${panel2Id}-${dialogue2Id}`, source: panel2Id, target: dialogue2Id });

     // Edges from Characters to Panel 2 (for display only, mark noLayout)
     edges.push({
        id: `e-char-${char1Id}-panel-${panel2Id}`, source: char1Id, target: panel2Id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.3)', strokeDasharray: '4 4', strokeWidth: 1 }, animated: false, markerEnd: undefined, data: { noLayout: true }
     });
     edges.push({
        id: `e-char-${char2Id}-panel-${panel2Id}`, source: char2Id, target: panel2Id, type: 'step', style: { stroke: 'hsl(var(--muted-foreground) / 0.3)', strokeDasharray: '4 4', strokeWidth: 1 }, animated: false, markerEnd: undefined, data: { noLayout: true }
     });


    console.log("Sample data generated:", { nodes: nodes.length, edges: edges.length });
    // Return raw data, layout will be applied in the component
    return { nodes, edges };
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
    refreshCounter, // Use counter to trigger layout refresh
    setViewportInitialized,
    viewportInitialized
  } = useVisualEditorStore();

  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true); // Track initial mount

  // Generate sample data on mount and update store
  useEffect(() => {
    // Only generate sample data if nodes are currently empty (prevents overwriting)
    if (isInitialMount.current && nodes.length === 0) {
        console.log("Generating and setting sample data on mount...");
        const { nodes: sampleNodes, edges: sampleEdges } = generateSampleProjectData();
        // Apply layout immediately
        const { nodes: layoutedNodes, edges: layoutedEdges } = layoutElements(sampleNodes, sampleEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        isInitialMount.current = false; // Mark initial mount as done
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

   // Apply layout whenever nodes or edges change significantly (triggered by refreshCounter)
    useEffect(() => {
        // Skip initial mount layout if sample data generation handled it
        if (isInitialMount.current) return;

        if (nodes.length > 0) {
            console.log("Applying layout due to data change (refreshCounter)...");
            // Pass only edges relevant for layout (filter out noLayout edges)
            const layoutEdges = edges.filter(edge => !edge.data?.noLayout);
            const { nodes: layoutedNodes, edges: finalEdges } = layoutElements(nodes, layoutEdges);
            setNodes(layoutedNodes);
            // Set the original edges back, as layout function doesn't modify them
            setEdges(edges);

             // Optionally fit view after layout, maybe with a delay
            // if (!viewportInitialized) {
            //     const timer = setTimeout(() => {
            //         console.log("Fitting view after layout update...");
            //         fitView({ padding: 0.2, duration: 600 });
            //         setViewportInitialized(true);
            //     }, 150);
            //     return () => clearTimeout(timer);
            // }
        }
    // Only re-run layout when refreshCounter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshCounter]);


  // --- Handlers remain mostly the same, using Zustand store ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
        setNodes(applyNodeChanges(changes, nodes));
    },
    [setNodes, nodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
       setEdges(applyEdgeChanges(changes, edges));
    },
    [setEdges, edges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
        const newEdge = { ...connection, type: 'smoothstep' }; // Ensure edge type
        // Don't apply layout on simple connect, wait for refresh trigger if needed
        setEdges(addEdge(newEdge, edges));
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

  // Fit view on initial load after nodes are set
  useEffect(() => {
      if (!viewportInitialized && nodes.length > 0 && reactFlowWrapper.current) {
          const timer = setTimeout(() => {
              console.log("Fitting view on initial load...");
              fitView({ padding: 0.2, duration: 600 });
              setViewportInitialized(true);
          }, 100); // Short delay for initial render
          return () => clearTimeout(timer);
      }
  }, [nodes, viewportInitialized, fitView, setViewportInitialized]);


  return (
    <div ref={reactFlowWrapper} style={{ height: '100%', width: '100%', position: 'relative' }}>
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
        className="bg-gradient-to-br from-background to-blue-50/30" // Softer gradient
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        selectNodesOnDrag={false}
        // Improve performance slightly
        nodesDraggable={true} // Allow dragging for manual adjustments
        nodesConnectable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        // Ensure nodes aren't positioned off-screen initially by layout
        minZoom={0.1}
        maxZoom={2}
        translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]} // Allow panning anywhere initially
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable position="bottom-left" nodeColor={(node) => {
                // Match MiniMap colors to the actual node background colors
                switch (node.type) {
                    case 'project': return 'rgb(233 213 255)'; // purple-100
                    case 'chapter': return 'rgb(219 234 254)'; // blue-100
                    case 'scene': return 'rgb(220 252 231)'; // green-100
                    case 'panel': return 'rgb(254 249 195)'; // yellow-100
                    case 'dialogue': return 'rgb(253 231 239)'; // pink-100
                    case 'character': return 'rgb(224 231 255)'; // indigo-100
                    default: return '#e2e8f0'; // Default gray
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
