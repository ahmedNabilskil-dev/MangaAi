
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
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NodeData, NodeType } from '@/types/nodes';
import { useQuery } from '@tanstack/react-query';
import { useVisualEditorStore } from '@/store/visual-editor-store';
// Import the in-memory service layer function
import { getProject } from '@/services/in-memory';
import { DEFAULT_PROJECT_ID } from '@/config/constants'; // Import default project ID
import { layoutElements } from '@/lib/layout-utils';
import { Pencil } from 'lucide-react';
import type { MangaProject, Character } from '@/types/entities'; // Import entity types

// Import or define custom node components (kept as is)
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
        position: 'relative',
    }}>
         {selected && <Pencil size={12} style={{ position: 'absolute', top: '4px', right: '4px', color: 'hsl(var(--primary))' }} />}
        <strong style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize', fontWeight: '500' }}>{data.type}</strong>
        {data.label || `(${data.type})`}
    </div>
);

// Define custom node types mapping (kept as is)
const nodeTypes: NodeTypes = {
    project: DefaultNodeComponent,
    chapter: DefaultNodeComponent,
    scene: DefaultNodeComponent,
    panel: DefaultNodeComponent,
    dialogue: DefaultNodeComponent,
    character: DefaultNodeComponent,
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
};

// --- Main Component ---
function VisualEditorInternal() {
  const {
    nodes,
    edges,
    selectedNode,
    setNodes,
    setEdges,
    setSelectedNode,
    refreshCounter,
    setViewportInitialized,
    viewportInitialized
  } = useVisualEditorStore();

  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Query Key depends on the refresh counter
  const queryKey = ['projectFlowData', refreshCounter];

  // Use the default project ID from the constants file
  const currentProjectId = DEFAULT_PROJECT_ID;

  const { data: projectData, isLoading, error, isFetching } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!currentProjectId) {
          console.warn("Default Project ID is not defined.");
          throw new Error("Default Project ID is not configured.");
      }
      console.log("Fetching flow data for project:", currentProjectId);
      // Use in-memory service to get project data
      const project = await getProject(currentProjectId);
      if (!project) {
        // Should not happen with the initialized default project, but good to check
        throw new Error(`Project ${currentProjectId} not found in memory.`);
      }
      // Convert the fetched in-memory project structure into React Flow elements
      const { nodes: fetchedNodes, edges: fetchedEdges } = convertInMemoryProjectToFlowElements(project);
      console.log("Converted flow elements:", { fetchedNodes, fetchedEdges });
      return layoutElements(fetchedNodes, fetchedEdges); // Apply layout
    },
    enabled: !!currentProjectId, // Only run query if projectId is valid
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
    refetchOnWindowFocus: false,
  });

 // Effect to update store when data is fetched/refreshed
 useEffect(() => {
    if (projectData) {
        console.log("Applying fetched and layouted data to store.");
        setNodes(projectData.nodes);
        setEdges(projectData.edges);

        const initialLoad = refreshCounter === 0;
        if (initialLoad && !viewportInitialized && projectData.nodes.length > 0) {
             const timer = setTimeout(() => {
                console.log("Fitting view on initial load...");
                fitView({ padding: 0.2, duration: 600 });
                setViewportInitialized(true);
             }, 150);
             return () => clearTimeout(timer);
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

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    console.log("Node clicked, updating store:", node.id, node.data.type);
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handlePaneClick = useCallback(() => {
      console.log("Pane clicked, clearing selection.");
      setSelectedNode(null);
  }, [setSelectedNode]);

   // Display loading or error states
   if (!currentProjectId) {
       return <div className="flex items-center justify-center h-full w-full bg-background text-destructive-foreground p-4 text-center">Error: Default Project ID not configured.</div>;
   }

   if (isLoading && refreshCounter === 0) {
        return <div className="flex items-center justify-center h-full w-full bg-background text-muted-foreground">Loading Editor...</div>;
   }

   if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-destructive text-destructive-foreground p-4 text-center">
                <p className="font-semibold mb-2">Error loading project data:</p>
                <p className="text-sm mb-4">{error.message}</p>
                <p className="text-xs">Could not load data from the in-memory store.</p>
            </div>
        );
   }

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
        fitView={false} // Fit view is handled by useEffect now
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        selectNodesOnDrag={false}
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


// --- Helper Function: Convert In-Memory Project Data to Flow Elements ---
// This function is very similar to the Firebase one, just using the in-memory data structure
function convertInMemoryProjectToFlowElements(project: MangaProject): { nodes: Node<NodeData>[], edges: Edge[] } {
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    if (!project || !project.id) return { nodes, edges };

    // 1. Project Node
    nodes.push({
        id: project.id,
        type: 'project',
        position: { x: 0, y: 0 }, // Layout engine will position
        data: {
            label: project.title || 'Project',
            type: 'project',
            // Pass the full project data, excluding the nested arrays handled below
            properties: { ...project, chapters: undefined, characters: undefined },
        }
    });

    // 7. Characters linked to Project (Character Nodes)
     project.characters?.forEach((character) => {
         if (!character || !character.id) return;
         const charId = character.id;
         nodes.push({
             id: charId,
             type: 'character',
             position: { x: 0, y: 0 }, // Layout will position
             data: {
                 label: character.name || 'Character',
                 type: 'character',
                 properties: character, // Pass full character data
             }
         });
         // Link character to project
         edges.push({
             id: `e-${project.id}-char-${charId}`,
             source: project.id,
             target: charId,
             type: 'step',
             style: { stroke: 'hsl(var(--muted-foreground) / 0.5)', strokeDasharray: '4 4', strokeWidth: 1 }
         });
     });


    // 2. Chapters and connect to Project
    project.chapters?.forEach((chapter) => {
        if (!chapter || !chapter.id) return;
        const chapterId = chapter.id;
        nodes.push({
            id: chapterId,
            type: 'chapter',
            position: { x: 0, y: 0 },
            data: {
                label: `Ch. ${chapter.chapterNumber}: ${chapter.title}` || `Chapter ${chapter.chapterNumber}`,
                type: 'chapter',
                properties: { ...chapter, scenes: undefined }, // Pass chapter data without scenes
            }
        });
        edges.push({
            id: `e-${project.id}-${chapterId}`,
            source: project.id,
            target: chapterId,
        });

        // 3. Scenes and connect to Chapter
        chapter.scenes?.forEach((scene) => {
             if (!scene || !scene.id) return;
             const sceneId = scene.id;
             nodes.push({
                 id: sceneId,
                 type: 'scene',
                 position: { x: 0, y: 0 },
                 data: {
                     label: scene.title || `Scene ${scene.order + 1}`,
                     type: 'scene',
                     properties: { ...scene, panels: undefined }, // Pass scene data without panels
                 }
             });
             edges.push({
                 id: `e-${chapterId}-${sceneId}`,
                 source: chapterId,
                 target: sceneId,
             });

             // 4. Panels and connect to Scene
             scene.panels?.forEach((panel) => {
                 if (!panel || !panel.id) return;
                 const panelId = panel.id;
                 nodes.push({
                     id: panelId,
                     type: 'panel',
                     position: { x: 0, y: 0 },
                     data: {
                         label: panel.panelContext?.action || `Panel ${panel.order + 1}`,
                         type: 'panel',
                         properties: { ...panel, dialogues: undefined, characters: undefined }, // Pass panel data without dialogues/chars
                     }
                 });
                 edges.push({
                     id: `e-${sceneId}-${panelId}`,
                     source: sceneId,
                     target: panelId,
                 });

                 // 5. Dialogues and connect to Panel
                 panel.dialogues?.forEach((dialogue) => {
                     if (!dialogue || !dialogue.id) return;
                     const dialogueId = dialogue.id;
                     nodes.push({
                         id: dialogueId,
                         type: 'dialogue',
                         position: { x: 0, y: 0 },
                         data: {
                             label: dialogue.content ? `"${dialogue.content.substring(0, 20)}..."` : `Dialogue ${dialogue.order + 1}`,
                             type: 'dialogue',
                             properties: { ...dialogue, speaker: undefined }, // Pass dialogue data without speaker object
                         }
                     });
                     edges.push({
                         id: `e-${panelId}-${dialogueId}`,
                         source: panelId,
                         target: dialogueId,
                     });
                 });

                 // 6. Characters linked to Panels (Edges from Character to Panel)
                 panel.characterIds?.forEach(charId => {
                     // Check if character node exists before adding edge
                     if (nodes.some(n => n.id === charId && n.type === 'character')) {
                         edges.push({
                             id: `e-char-${charId}-panel-${panelId}`,
                             source: charId, // Character node ID
                             target: panelId,
                             type: 'step', // Optional styling
                             style: { stroke: 'hsl(var(--muted-foreground) / 0.5)', strokeDasharray: '4 4', strokeWidth: 1 },
                             animated: false,
                             markerEnd: undefined, // No arrow for character links
                         });
                     }
                 });
             });
        });
    });

    return { nodes, edges };
}
