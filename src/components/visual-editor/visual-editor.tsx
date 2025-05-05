
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
// Import from the abstract data service
import { getDefaultProject } from '@/services/data-service';

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

// --- Function to transform Project data into Flow elements ---
function transformProjectToFlow(project: MangaProject | null): { nodes: Node<NodeData>[], edges: Edge[] } {
    if (!project) {
        console.warn("transformProjectToFlow called with null project.");
        return { nodes: [], edges: [] };
    }
    console.log("Transforming project data to flow elements:", project.id);
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    // Project Node
    nodes.push({
        id: project.id,
        type: 'project',
        position: { x: 0, y: 0 }, // Layout will handle final position
        data: { label: project.title, type: 'project', properties: project }
    });

    // Character Nodes
    (project.characters ?? []).forEach(character => {
        nodes.push({
            id: character.id,
            type: 'character',
            position: { x: 0, y: 0 },
            data: { label: character.name, type: 'character', properties: character }
        });
         // Edge to project (for display only, mark for layout ignore)
        // Removing this edge to prevent characters from being linked in the main layout
        /*
        edges.push({
             id: `e-${project.id}-char-${character.id}`,
             source: project.id,
             target: character.id,
             type: 'step', // Simple edge type
             style: { stroke: 'hsl(var(--muted-foreground) / 0.3)', strokeDasharray: '4 4', strokeWidth: 1 },
             animated: false,
             markerEnd: undefined,
             data: { noLayout: true } // Mark edge to ignore in layout
        });
        */
    });

    // Chapters, Scenes, Panels, Dialogues
    (project.chapters ?? []).forEach(chapter => {
        nodes.push({
            id: chapter.id,
            type: 'chapter',
            position: { x: 0, y: 0 },
            data: { label: `Ch. ${chapter.chapterNumber}: ${chapter.title}`, type: 'chapter', properties: chapter }
        });
        edges.push({ id: `e-${project.id}-${chapter.id}`, source: project.id, target: chapter.id });

        (chapter.scenes ?? []).forEach(scene => {
            nodes.push({
                id: scene.id,
                type: 'scene',
                position: { x: 0, y: 0 },
                data: { label: scene.title, type: 'scene', properties: scene }
            });
            edges.push({ id: `e-${chapter.id}-${scene.id}`, source: chapter.id, target: scene.id });

            (scene.panels ?? []).forEach(panel => {
                nodes.push({
                    id: panel.id,
                    type: 'panel',
                    position: { x: 0, y: 0 },
                    data: { label: `Panel ${panel.order + 1}`, type: 'panel', properties: panel }
                });
                edges.push({ id: `e-${scene.id}-${panel.id}`, source: scene.id, target: panel.id });

                // Edges from panel characters to the panel node (noLayout)
                // Removing these visual links as well to keep characters separate
                /*
                (panel.characterIds ?? []).forEach(charId => {
                     edges.push({
                         id: `e-char-${charId}-panel-${panel.id}`,
                         source: charId, // Character node ID
                         target: panel.id, // Panel node ID
                         type: 'step',
                         style: { stroke: 'hsl(var(--muted-foreground) / 0.3)', strokeDasharray: '4 4', strokeWidth: 1 },
                         animated: false,
                         markerEnd: undefined,
                         data: { noLayout: true }
                     });
                });
                */


                (panel.dialogues ?? []).forEach(dialogue => {
                    nodes.push({
                        id: dialogue.id,
                        type: 'dialogue',
                        position: { x: 0, y: 0 },
                        data: { label: `Dialogue ${dialogue.order + 1}`, type: 'dialogue', properties: dialogue }
                    });
                    edges.push({ id: `e-${panel.id}-${dialogue.id}`, source: panel.id, target: dialogue.id });

                    // Optional: Edge from speaker to dialogue (noLayout)
                    // Removing these visual links
                    /*
                    if (dialogue.speakerId) {
                         edges.push({
                             id: `e-speaker-${dialogue.speakerId}-dialogue-${dialogue.id}`,
                             source: dialogue.speakerId, // Character node ID
                             target: dialogue.id, // Dialogue node ID
                             type: 'step',
                             style: { stroke: 'hsl(var(--muted-foreground) / 0.2)', strokeDasharray: '2 2', strokeWidth: 1 },
                             animated: false,
                             markerEnd: undefined,
                             data: { noLayout: true }
                         });
                     }
                    */
                });
            });
        });
    });

    console.log("Transformation complete:", { nodes: nodes.length, edges: edges.length });
    return { nodes, edges };
}


// --- Main Component ---
function VisualEditorInternal() {
  const {
    nodes: storeNodes, // Rename store state to avoid conflict
    edges: storeEdges,
    selectedNode,
    setNodes,
    setEdges,
    setSelectedNode,
    refreshCounter, // Use counter to trigger data refresh
    setViewportInitialized,
    viewportInitialized,
    refreshFlowData // Get the refresh trigger
  } = useVisualEditorStore();

  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<MangaProject | null>(null);
  const isInitialLayoutDone = useRef(false); // Track if initial layout applied

  // --- Fetch Project Data Effect ---
   useEffect(() => {
       const fetchData = async () => {
           console.log("Fetching project data (triggered by refreshCounter:", refreshCounter, ")");
           setIsLoading(true);
           setError(null);
            isInitialLayoutDone.current = false; // Reset layout flag on each refresh
           try {
               const project = await getDefaultProject(); // Fetch using abstract service
               if (!project) {
                   setError("No project found.");
                   setProjectData(null);
               } else {
                   setProjectData(project);
               }
           } catch (err: any) {
               console.error("Error loading project data:", err);
               setError(`Error loading project data: ${err.message || 'Failed to fetch'}`);
               setProjectData(null);
           } finally {
               setIsLoading(false);
           }
       };

       fetchData();
   }, [refreshCounter]); // Re-run fetch when refreshCounter changes


   // --- Transform Data and Layout Effect ---
   useEffect(() => {
       if (projectData && !isLoading) { // Only process if projectData exists and not loading
           console.log("Project data loaded, transforming to flow elements...");
           const { nodes: initialNodes, edges: initialEdges } = transformProjectToFlow(projectData);

           // Apply layout only if nodes exist and initial layout isn't done
           if (initialNodes.length > 0 && !isInitialLayoutDone.current) {
                console.log("Applying initial layout...");
                const layoutEdges = initialEdges.filter(edge => !edge.data?.noLayout); // Exclude noLayout edges from layouting
                const { nodes: layoutedNodes, edges: _ } = layoutElements(initialNodes, layoutEdges); // Use layout utility
                setNodes(layoutedNodes);
                setEdges(initialEdges); // Keep original edges (including noLayout ones) for rendering
                isInitialLayoutDone.current = true; // Mark initial layout as done

                // Fit view after initial layout
                 const timer = setTimeout(() => {
                    if (!viewportInitialized) {
                       console.log("Fitting view after initial layout...");
                       fitView({ padding: 0.2, duration: 600 });
                       setViewportInitialized(true);
                    }
                 }, 200); // Increased delay slightly
                 return () => clearTimeout(timer);

           } else if (isInitialLayoutDone.current) {
                // If layout already done, just update store nodes/edges if project data changed
                // This avoids re-running layout unnecessarily after minor updates triggered by refresh
                console.log("Updating store without re-layouting (layout already done)...");
                setNodes(initialNodes);
                setEdges(initialEdges);
           } else if (initialNodes.length === 0) {
                // Handle case where transformation results in no nodes
                setNodes([]);
                setEdges([]);
           }

       } else if (!isLoading && !error && !projectData) {
            // Handle case where data fetching finished but resulted in null project
            setNodes([]);
            setEdges([]);
            isInitialLayoutDone.current = false; // Reset layout flag
       }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [projectData, isLoading, error, setNodes, setEdges, fitView, setViewportInitialized]);


   // --- Handlers remain mostly the same, using Zustand store ---
   const onNodesChange: OnNodesChange = useCallback(
     (changes) => {
         setNodes(applyNodeChanges(changes, storeNodes));
     },
     [setNodes, storeNodes]
   );

   const onEdgesChange: OnEdgesChange = useCallback(
     (changes) => {
        setEdges(applyEdgeChanges(changes, storeEdges));
     },
     [setEdges, storeEdges]
   );

   const onConnect: OnConnect = useCallback(
     (connection) => {
         const newEdge = { ...connection, type: 'smoothstep' }; // Ensure edge type
         // TODO: Persist this new edge connection
         // For now, just update the store visually
         setEdges(addEdge(newEdge, storeEdges));
         // Trigger layout refresh after connection?
         // refreshFlowData(); // Uncomment if layout needs update after connection
     },
     [setEdges, storeEdges, refreshFlowData] // Add refreshFlowData if needed
   );

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    console.log("Node clicked, updating store:", node.id, node.data.type);
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handlePaneClick = useCallback(() => {
      console.log("Pane clicked, clearing selection.");
      setSelectedNode(null);
  }, [setSelectedNode]);


  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading Flow Data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-destructive">{error}</div>;
  }

  return (
    <div ref={reactFlowWrapper} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={storeNodes} // Use nodes from Zustand store for rendering
        edges={storeEdges} // Use edges from Zustand store
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes} // Use custom nodes
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={false} // Fit view is handled by useEffect
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/30" // Adjusted gradient for dark mode
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
                // Match MiniMap colors to the actual node background colors (using HSL from globals.css)
                 switch (node.type) {
                    case 'project': return 'hsl(270 50% 90%)'; // Approx purple-100
                    case 'chapter': return 'hsl(210 50% 90%)'; // Approx blue-100
                    case 'scene': return 'hsl(140 40% 90%)'; // Approx green-100
                    case 'panel': return 'hsl(45 70% 90%)'; // Approx yellow-100
                    case 'dialogue': return 'hsl(330 50% 90%)'; // Approx pink-100
                    case 'character': return 'hsl(230 50% 90%)'; // Approx indigo-100
                    default: return 'hsl(var(--muted))';
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
