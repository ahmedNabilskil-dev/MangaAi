'use client';

import React, { useCallback, useEffect, useRef } from 'react';
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
  ReactFlowProvider, // Wrap with provider if useReactFlow is used outside main component
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NodeData, NodeType } from '@/types/nodes';
import { useQuery } from '@tanstack/react-query';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import Zustand store
import { getProject } from '@/services/strapi'; // Import service to fetch project data
import { layoutElements } from '@/lib/layout-utils'; // Import layout function
import { Pencil } from 'lucide-react';

// Import or define custom node components
const DefaultNodeComponent = ({ data, selected }: { data: NodeData, selected: boolean }) => (
    <div style={{
        padding: '10px 15px',
        border: `1px solid ${selected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
        borderRadius: 'var(--radius)',
        background: selected ? 'hsl(var(--accent))' : 'hsl(var(--card))',
        color: selected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--card-foreground))',
        fontSize: '12px',
        minWidth: '150px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'relative', // For potential absolute elements like icons
    }}>
         {selected && <Pencil size={12} style={{ position: 'absolute', top: '4px', right: '4px', color: 'hsl(var(--primary))' }} />}
        <strong style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize', fontWeight: '500' }}>{data.type}</strong>
        {data.label || `(${data.type})`}
        {/* Optionally display ID for debugging */}
        {/* {data.properties?.id && <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>ID: {data.properties.id.substring(0, 8)}...</div>} */}
    </div>
);


// Define custom node types mapping
const nodeTypes: NodeTypes = {
    project: DefaultNodeComponent,
    chapter: DefaultNodeComponent,
    scene: DefaultNodeComponent,
    panel: DefaultNodeComponent,
    dialogue: DefaultNodeComponent,
    character: DefaultNodeComponent,
    // Add more specific custom nodes as needed
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false, // Less distracting for structure view
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: 'hsl(var(--primary) / 0.7)',
    },
    style: {
        strokeWidth: 1.5,
        stroke: 'hsl(var(--border))', // Subtler edge color
    },
    // type: 'smoothstep', // Optional: change edge routing style
};

// --- Main Component ---
// No longer needs onNodeClick prop, handled by store
function VisualEditorInternal() {
  const {
    nodes,
    edges,
    selectedNode,
    setNodes,
    setEdges,
    setSelectedNode,
    refreshCounter, // Use counter to trigger refetch
    setViewportInitialized,
    viewportInitialized
  } = useVisualEditorStore();

  const { fitView, getViewport, setViewport } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Query Key depends on the refresh counter
  const queryKey = ['projectFlowData', refreshCounter];

  // Fetch initial/refreshed data using React Query
  // TODO: Get the current project ID dynamically
  const currentProjectId = 'proj-123'; // Placeholder
  const { data: projectData, isLoading, error, isFetching } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log("Fetching flow data for project:", currentProjectId);
      const project = await getProject(currentProjectId); // Fetch project with deep population
      if (!project) {
        throw new Error(`Project ${currentProjectId} not found.`);
      }
      // TODO: Convert the deeply populated project structure into React Flow nodes and edges
      // This requires a mapping function `convertProjectToFlowElements`
       const { nodes: fetchedNodes, edges: fetchedEdges } = convertProjectToFlowElements(project);
       console.log("Converted flow elements:", { fetchedNodes, fetchedEdges });
       return layoutElements(fetchedNodes, fetchedEdges); // Apply layout
    },
    enabled: !!currentProjectId, // Only run query if projectId is available
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
    refetchOnWindowFocus: false,
  });


 // Effect to update store when data is fetched/refreshed
 useEffect(() => {
    if (projectData) {
        console.log("Applying fetched and layouted data to store.");
        setNodes(projectData.nodes);
        setEdges(projectData.edges);

        // Fit view only after initial load or significant refresh
        const initialLoad = refreshCounter === 0; // Check if it's the initial load
        if (initialLoad && !viewportInitialized) {
             // Use timeout to allow nodes to render before fitting view
             const timer = setTimeout(() => {
                console.log("Fitting view on initial load...");
                fitView({ padding: 0.2, duration: 600 });
                setViewportInitialized(true); // Mark viewport as initialized
             }, 150);
             return () => clearTimeout(timer);
        } else if (!initialLoad) {
            // On subsequent refreshes, maybe don't auto-fit, or fit gently
            // fitView({ padding: 0.2, duration: 300, includeHiddenNodes: false });
        }
    }
 }, [projectData, setNodes, setEdges, fitView, refreshCounter, viewportInitialized, setViewportInitialized]);


  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [setNodes, nodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [setEdges, edges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges(addEdge(connection, edges)),
    [setEdges, edges]
  );

  // Handle node click to update the store's selected node
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    console.log("Node clicked, updating store:", node.id, node.data.type);
    setSelectedNode(node); // Store the entire selected node object
  }, [setSelectedNode]);

  // Handle pane click to clear selection
  const handlePaneClick = useCallback(() => {
      console.log("Pane clicked, clearing selection.");
      setSelectedNode(null);
  }, [setSelectedNode]);


   // Display loading or error states
   if (isLoading && refreshCounter === 0) { // Show initial loading
        return <div className="flex items-center justify-center h-full w-full bg-background text-muted-foreground">Loading Editor...</div>;
   }

   if (error) {
        return <div className="flex items-center justify-center h-full w-full bg-destructive text-destructive-foreground p-4">Error loading flow data: {error.message}</div>;
   }

   // Show subtle fetching indicator on refresh
   const isRefreshing = isFetching && refreshCounter > 0;


  return (
    <div ref={reactFlowWrapper} style={{ height: '100%', width: '100%', position: 'relative' }}>
       {isRefreshing && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-card text-card-foreground text-xs px-3 py-1 rounded-full shadow animate-pulse">
                Refreshing...
            </div>
        )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={false} // Disable automatic fitView, handled manually in useEffect
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick} // Clear selection on pane click
        // Only select nodes on click, not drag
        selectNodesOnDrag={false}
        // Keep viewport state across refreshes if desired
        // defaultViewport={viewport}
        // onMoveEnd={(_, viewport) => setViewport(viewport)}
      >
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable position="bottom-left" />
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


// --- Helper Function: Convert Strapi Project Data to Flow Elements ---
// This is a crucial function you need to implement based on your Strapi data structure
function convertProjectToFlowElements(project: MangaProject): { nodes: Node<NodeData>[], edges: Edge[] } {
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    if (!project) return { nodes, edges };

    // 1. Project Node
    nodes.push({
        id: project.id,
        type: 'project',
        position: { x: 0, y: 0 }, // Position will be set by layout
        data: {
            label: project.title || 'Project',
            type: 'project',
            properties: project, // Pass the full project data
        }
    });

    // 2. Chapters and connect to Project
    project.chapters?.forEach((chapter, chapIndex) => {
        const chapterId = chapter.id;
        nodes.push({
            id: chapterId,
            type: 'chapter',
            position: { x: 0, y: 0 },
            data: {
                label: `Ch. ${chapter.chapterNumber}: ${chapter.title}` || `Chapter ${chapter.chapterNumber}`,
                type: 'chapter',
                properties: chapter,
            }
        });
        edges.push({
            id: `e-${project.id}-${chapterId}`,
            source: project.id,
            target: chapterId,
        });

        // 3. Scenes and connect to Chapter
        chapter.scenes?.forEach((scene, sceneIndex) => {
             const sceneId = scene.id;
             nodes.push({
                 id: sceneId,
                 type: 'scene',
                 position: { x: 0, y: 0 },
                 data: {
                     label: scene.title || `Scene ${scene.order + 1}`,
                     type: 'scene',
                     properties: scene,
                 }
             });
             edges.push({
                 id: `e-${chapterId}-${sceneId}`,
                 source: chapterId,
                 target: sceneId,
             });

             // 4. Panels and connect to Scene
             scene.panels?.forEach((panel, panelIndex) => {
                 const panelId = panel.id;
                 nodes.push({
                     id: panelId,
                     type: 'panel',
                     position: { x: 0, y: 0 },
                     data: {
                          // Use action or order for label
                         label: panel.panelContext?.action || `Panel ${panel.order + 1}`,
                         type: 'panel',
                         properties: panel,
                     }
                 });
                 edges.push({
                     id: `e-${sceneId}-${panelId}`,
                     source: sceneId,
                     target: panelId,
                 });

                 // 5. Dialogues and connect to Panel
                 panel.dialogues?.forEach((dialogue, diaIndex) => {
                     const dialogueId = dialogue.id;
                     nodes.push({
                         id: dialogueId,
                         type: 'dialogue',
                         position: { x: 0, y: 0 },
                         data: {
                              // Show snippet of content
                             label: dialogue.content ? `"${dialogue.content.substring(0, 20)}..."` : `Dialogue ${dialogue.order + 1}`,
                             type: 'dialogue',
                             properties: dialogue,
                         }
                     });
                     edges.push({
                         id: `e-${panelId}-${dialogueId}`,
                         source: panelId,
                         target: dialogueId,
                         // Optional: style dialogue edges differently
                         // style: { strokeDasharray: '5,5', stroke: 'hsl(var(--muted-foreground))' },
                         // type: 'step', // Example edge type
                     });
                 });

                 // 6. Characters linked to Panels (Optional Nodes, or just data)
                 // Decide if characters should be nodes themselves, or just data within panels/project
                 // If they are nodes, link them here. Edges might go FROM character TO panel.
                 panel.characters?.forEach(char => {
                     // Example: Add edge if character node exists
                     // if (nodes.some(n => n.id === char.id && n.type === 'character')) {
                     //     edges.push({
                     //         id: `e-char-${char.id}-panel-${panelId}`,
                     //         source: char.id, // Character node ID
                     //         target: panelId,
                     //         type: 'step',
                     //         style: { stroke: 'hsl(var(--secondary))', strokeDasharray: '3 3' }
                     //     });
                     // }
                 });

             });
        });
    });

     // 7. Characters linked to Project (Optional Nodes)
     project.characters?.forEach((character) => {
         const charId = character.id;
         // Check if node already exists (e.g., if added via panel links)
         if (!nodes.some(n => n.id === charId)) {
             nodes.push({
                 id: charId,
                 type: 'character',
                 position: { x: 0, y: 0 }, // Layout will position
                 data: {
                     label: character.name || 'Character',
                     type: 'character',
                     properties: character,
                 }
             });
             // Link character to project
             edges.push({
                 id: `e-${project.id}-char-${charId}`,
                 source: project.id,
                 target: charId,
                 type: 'step', // Example style
                 style: { stroke: 'hsl(var(--secondary))', strokeDasharray: '3 3' }
             });
         }
     });


    return { nodes, edges };
}
