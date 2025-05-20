"use client";

import { layoutElements } from "@/lib/layout-utils";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import type { MangaProject } from "@/types/entities"; // Import entity types
import { type NodeData, NodeType } from "@/types/nodes";
import * as d3 from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type DefaultEdgeOptions,
  type Edge,
  MarkerType,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node"; // Import the new custom node
// Import specific function from the abstract data service
import { SideNav } from "@/components/sidenav/SideNav";
import { getProjectWithRelations } from "@/services/db";
import { useLiveQuery } from "dexie-react-hooks"; // Import Dexie hook
import { useParams } from "next/navigation";

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
    color: "hsl(var(--primary) / 0.7)",
  },
  style: {
    strokeWidth: 1.5,
    stroke: "hsl(var(--border))",
  },
  type: "smoothstep", // Use smoothstep for potentially better routing visually
};

export function transformProjectToFlow(project: MangaProject | null): {
  nodes: Node<NodeData>[];
  edges: Edge[];
} {
  if (!project) {
    console.warn("transformProjectToFlow called with null project.");
    return { nodes: [], edges: [] };
  }

  // Define dynamic node dimensions based on node type
  const nodeDimensions: Record<NodeType, { width: number; height: number }> = {
    project: { width: 320, height: 350 },
    chapter: { width: 300, height: 320 },
    scene: { width: 300, height: 280 },
    panel: { width: 280, height: 260 },
    dialogue: { width: 260, height: 220 },
    character: { width: 280, height: 380 }, // Characters often have images
  };

  // First create a flat list of all nodes with hierarchy information
  const hierarchyNodes: Array<{
    id: string;
    parentId: string | null;
    type: NodeData["type"];
    label: string;
    properties: any;
    depth: number;
  }> = [];

  // Add project node
  hierarchyNodes.push({
    id: project.id,
    parentId: null,
    type: "project",
    label: project.title,
    properties: project,
    depth: 0,
  });

  // Add characters (positioned separately)
  (project.characters ?? []).forEach((character) => {
    hierarchyNodes.push({
      id: character.id,
      parentId: null, // Characters will be positioned separately
      type: "character",
      label: character.name,
      properties: character,
      depth: 1,
    });
  });

  // Add chapters and their children
  (project.chapters ?? []).forEach((chapter) => {
    hierarchyNodes.push({
      id: chapter.id,
      parentId: project.id,
      type: "chapter",
      label: `Ch. ${chapter.chapterNumber}: ${chapter.title}`,
      properties: chapter,
      depth: 1,
    });

    (chapter.scenes ?? []).forEach((scene) => {
      hierarchyNodes.push({
        id: scene.id,
        parentId: chapter.id,
        type: "scene",
        label: scene.title,
        properties: scene,
        depth: 2,
      });

      (scene.panels ?? []).forEach((panel) => {
        hierarchyNodes.push({
          id: panel.id,
          parentId: scene.id,
          type: "panel",
          label: `Panel ${panel.order + 1}`,
          properties: panel,
          depth: 3,
        });

        (panel.dialogues ?? []).forEach((dialogue) => {
          hierarchyNodes.push({
            id: dialogue.id,
            parentId: panel.id,
            type: "dialogue",
            label: `Dialogue ${dialogue.order + 1}`,
            properties: dialogue,
            depth: 4,
          });
        });
      });
    });
  });

  // Create D3 hierarchy for the main story tree (excluding characters)
  const storyNodes = hierarchyNodes.filter((n) => n.type !== "character");
  const root = d3
    .stratify<(typeof storyNodes)[0]>()
    .id((d) => d.id)
    .parentId((d) => d.parentId)(storyNodes);

  // Calculate tree layout with proper spacing
  const margin = { top: 50, right: 120, bottom: 150, left: 120 };

  const treeLayout = d3
    .tree<(typeof storyNodes)[0]>()
    .nodeSize([400, 350]) // [width, height] spacing between nodes - swapped for vertical layout
    .separation((a, b) => {
      const baseSeparation = a.depth === b.depth ? 1.2 : 1.5;
      if (a.data.type === "project" || b.data.type === "project") {
        return baseSeparation * 1.4;
      }
      if (a.data.type === "chapter" && b.data.type === "chapter") {
        return baseSeparation * 1.3;
      }
      return baseSeparation;
    });

  // Get the tree data
  const treeData = treeLayout(root);

  // For top-to-bottom layout, we keep x and y as they are
  // No coordinate swapping needed for vertical layout

  // Position characters in a row at the top
  const characterNodes = hierarchyNodes.filter((n) => n.type === "character");

  // Calculate the top position for characters
  const characterStartX = margin.left;
  const characterStartY = margin.top;
  const characterColumnWidth = nodeDimensions.character.width + 80;
  const charactersPerRow = 3;

  // Convert to ReactFlow nodes with calculated positions
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];

  // Add story nodes with dynamic sizing based on node type
  treeData.descendants().forEach((d) => {
    const nodeType = d.data.type as NodeType;
    const { width, height } = nodeDimensions[nodeType];

    nodes.push({
      id: d.id!,
      type: d.data.type,
      position: {
        x: d.x - width / 2, // Center node horizontally
        y: d.y,
      },
      data: {
        label: d.data.label,
        type: d.data.type,
        properties: d.data.properties,
      },
      style: {
        width,
        height,
      },
    });

    if (d.parent && d.data.type !== "character") {
      // Skip character connections
      edges.push({
        id: `e-${d.parent.id}-${d.id}`,
        source: d.parent.id!,
        target: d.id!,
        animated: d.data.type === "character",
        type: "smoothstep",
      });
    }
  });

  // Add character nodes in a horizontal row at the top
  characterNodes.forEach((char, i) => {
    const row = Math.floor(i / charactersPerRow);
    const col = i % charactersPerRow;
    const { width, height } = nodeDimensions.character;

    nodes.push({
      id: char.id,
      type: char.type,
      position: {
        x: characterStartX + col * characterColumnWidth,
        y: characterStartY + row * (height + 50),
      },
      data: {
        label: char.label,
        type: char.type,
        properties: char.properties,
      },
      style: {
        width,
        height,
      },
    });
  });

  // Calculate the bounding box to center the layout (excluding characters)
  const storyNodeX = nodes
    .filter((n) => n.type !== "character")
    .map((n) => n.position.x);
  const storyNodeY = nodes
    .filter((n) => n.type !== "character")
    .map((n) => n.position.y);
  const minX = Math.min(...storyNodeX);
  const maxX = Math.max(...storyNodeX);
  const minY = Math.min(...storyNodeY);

  // Calculate character grid height
  const characterRowCount = Math.ceil(characterNodes.length / charactersPerRow);
  const characterAreaHeight =
    characterRowCount * (nodeDimensions.character.height + 50);

  // Apply offset for centered layout with more space between character grid and project nodes
  const offsetX = -minX + margin.left;
  const offsetY = -minY + margin.top + characterAreaHeight + 150; // Extra gap between characters and project

  // Apply final positioning (only to story nodes)
  nodes.forEach((node) => {
    if (node.type !== "character") {
      node.position.x += offsetX;
      node.position.y += offsetY;
    }
  });

  return { nodes, edges };
}

// --- Main Component ---
function VisualEditorInternal() {
  const { id } = useParams();
  const {
    nodes: storeNodes, // Rename store state to avoid conflict
    edges: storeEdges,
    setNodes,
    setEdges,
    setSelectedNode,
    refreshCounter, // Use counter to trigger data refresh
    setViewportInitialized,
    viewportInitialized,
    refreshFlowData, // Get the refresh trigger
  } = useVisualEditorStore();

  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLayoutDone = useRef(false); // Track if initial layout applied

  // --- Use useLiveQuery to observe Dexie data ---
  // This automatically updates when the underlying Dexie data changes
  const projectData = useLiveQuery(async () => {
    setIsLoading(true); // Set loading state when query starts
    setError(null);
    isInitialLayoutDone.current = false; // Reset layout flag on each refresh
    try {
      const project = await getProjectWithRelations(id as string); // Fetch using abstract service (which uses Dexie)
      if (!project) {
        setError("No project found or error loading project.");
        return null;
      }
      return project;
    } catch (err: any) {
      setError(
        `Error loading project data: ${err.message || "Failed to fetch"}`
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectData && !isLoading) {
      const { nodes: initialNodes, edges: initialEdges } =
        transformProjectToFlow(projectData);

      // Apply layout only if nodes exist and initial layout isn't done
      if (initialNodes.length > 0 && !isInitialLayoutDone.current) {
        const layoutEdges = initialEdges.filter((edge) => !edge.data?.noLayout);
        const { nodes: layoutedNodes, edges: _ } = layoutElements(
          initialNodes,
          layoutEdges
        ); // Use layout utility
        setNodes(layoutedNodes);
        setEdges(initialEdges); // Keep original edges (including noLayout ones) for rendering
        isInitialLayoutDone.current = true; // Mark initial layout as done

        // Fit view after initial layout
        const timer = setTimeout(() => {
          if (!viewportInitialized) {
            fitView({ padding: 0.2, duration: 600 });
            setViewportInitialized(true);
          }
        }, 200); // Increased delay slightly
        return () => clearTimeout(timer);
      } else if (isInitialLayoutDone.current) {
        // If layout already done, just update store nodes/edges if project data changed
        // This avoids re-running layout unnecessarily after minor updates triggered by refresh

        setNodes(initialNodes);
        setEdges(initialEdges);
      } else if (initialNodes.length === 0) {
        setNodes([]);
        setEdges([]);
      }
    } else if (!isLoading && !error && projectData === null) {
      setNodes([]);
      setEdges([]);
      isInitialLayoutDone.current = false;
    }
  }, [
    projectData,
    isLoading,
    error,
    setNodes,
    setEdges,
    fitView,
    setViewportInitialized,
  ]);

  // --- Handlers remain mostly the same, using Zustand store ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // TODO: Persist node changes to Dexie (e.g., position changes)
      // For now, just update the Zustand store visually
      setNodes(applyNodeChanges(changes, storeNodes));
    },
    [setNodes, storeNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // TODO: Persist edge changes if needed (e.g., deletion)
      setEdges(applyEdgeChanges(changes, storeEdges));
    },
    [setEdges, storeEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const newEdge = { ...connection, type: "smoothstep" }; // Ensure edge type
      // TODO: Persist this new edge connection to Dexie if needed
      // For now, just update the store visually
      setEdges(addEdge(newEdge, storeEdges));
      // Trigger layout refresh after connection?
      // refreshFlowData(); // Uncomment if layout needs update after connection
    },
    [setEdges, storeEdges, refreshFlowData] // Add refreshFlowData if needed
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading Flow Data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={reactFlowWrapper}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
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
        translateExtent={[
          [-Infinity, -Infinity],
          [Infinity, Infinity],
        ]} // Allow panning anywhere initially
      >
        <Controls showInteractive={false} position="bottom-right" />
        <Background color="hsl(var(--border) / 0.3)" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

// Wrap the internal component with ReactFlowProvider
export default function VisualEditor() {
  return (
    <ReactFlowProvider>
      <div className="relative h-full w-full">
        <SideNav />
        <VisualEditorInternal />
      </div>
    </ReactFlowProvider>
  );
}
