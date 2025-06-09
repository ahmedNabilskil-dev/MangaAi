"use client";

import { layoutElements } from "@/lib/layout-utils";
import { getProjectWithRelations } from "@/services/db";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import type { MangaProject } from "@/types/entities";
import { type NodeData, NodeType } from "@/types/nodes";
import * as d3 from "d3";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";

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
  type: "smoothstep",
};

const nodeDimensions: Record<NodeType, { width: number; height: number }> = {
  project: { width: 320, height: 350 },
  chapter: { width: 300, height: 320 },
  scene: { width: 300, height: 280 },
  panel: { width: 280, height: 260 },
  dialogue: { width: 260, height: 220 },
  character: { width: 280, height: 380 },
};

function createNodeKey(node: any, type: NodeType): string {
  switch (type) {
    case "project":
      return `project-${node.id}-${node.title}-${node.updatedAt || ""}`;
    case "chapter":
      return `chapter-${node.id}-${node.title}-${node.chapterNumber}-${
        node.updatedAt || ""
      }`;
    case "scene":
      return `scene-${node.id}-${node.title}-${node.updatedAt || ""}`;
    case "panel":
      return `panel-${node.id}-${node.order}-${node.updatedAt || ""}`;
    case "dialogue":
      return `dialogue-${node.id}-${node.order}-${node.text || ""}-${
        node.updatedAt || ""
      }`;
    case "character":
      return `character-${node.id}-${node.name}-${node.updatedAt || ""}`;
    default:
      return `${type}-${node.id}`;
  }
}

const transformProjectToFlowOptimized = (
  project: MangaProject | null,
  existingNodes: Node<NodeData>[] = []
): {
  nodes: Node<NodeData>[];
  edges: Edge[];
  hasStructuralChanges: boolean;
} => {
  if (!project) {
    return { nodes: [], edges: [], hasStructuralChanges: true };
  }

  const existingPositions = new Map<
    string,
    { x: number; y: number; key: string }
  >();
  const existingNodeKeys = new Map<string, string>();

  existingNodes.forEach((node) => {
    existingPositions.set(node.id, {
      x: node.position.x,
      y: node.position.y,
      key: (node.data as any).dataKey || "",
    });
    existingNodeKeys.set(node.id, (node.data as any).dataKey || "");
  });

  const hierarchyNodes: Array<{
    id: string;
    parentId: string | null;
    type: NodeData["type"];
    label: string;
    properties: any;
    depth: number;
    dataKey: string;
  }> = [];

  const projectKey = createNodeKey(project, "project");
  hierarchyNodes.push({
    id: project.id,
    parentId: null,
    type: "project",
    label: project.title,
    properties: project,
    depth: 0,
    dataKey: projectKey,
  });

  (project.characters ?? []).forEach((character) => {
    const charKey = createNodeKey(character, "character");
    hierarchyNodes.push({
      id: character.id,
      parentId: project.id,
      type: "character",
      label: character.name,
      properties: character,
      depth: 1,
      dataKey: charKey,
    });
  });

  (project.chapters ?? []).forEach((chapter) => {
    const chapterKey = createNodeKey(chapter, "chapter");
    hierarchyNodes.push({
      id: chapter.id,
      parentId: project.id,
      type: "chapter",
      label: `Ch. ${chapter.chapterNumber}: ${chapter.title}`,
      properties: chapter,
      depth: 1,
      dataKey: chapterKey,
    });

    (chapter.scenes ?? []).forEach((scene) => {
      const sceneKey = createNodeKey(scene, "scene");
      hierarchyNodes.push({
        id: scene.id,
        parentId: chapter.id,
        type: "scene",
        label: scene.title,
        properties: scene,
        depth: 2,
        dataKey: sceneKey,
      });

      (scene.panels ?? []).forEach((panel) => {
        const panelKey = createNodeKey(panel, "panel");
        hierarchyNodes.push({
          id: panel.id,
          parentId: scene.id,
          type: "panel",
          label: `Panel ${panel.order + 1}`,
          properties: panel,
          depth: 3,
          dataKey: panelKey,
        });

        (panel.dialogues ?? []).forEach((dialogue) => {
          const dialogueKey = createNodeKey(dialogue, "dialogue");
          hierarchyNodes.push({
            id: dialogue.id,
            parentId: panel.id,
            type: "dialogue",
            label: `Dialogue ${dialogue.order + 1}`,
            properties: dialogue,
            depth: 4,
            dataKey: dialogueKey,
          });
        });
      });
    });
  });

  const currentNodeIds = new Set(hierarchyNodes.map((n) => n.id));
  const existingNodeIds = new Set(existingNodes.map((n) => n.id));

  const hasNewNodes = hierarchyNodes.some((n) => !existingNodeIds.has(n.id));
  const hasDeletedNodes = existingNodes.some((n) => !currentNodeIds.has(n.id));
  const hasDataChanges = hierarchyNodes.some((n) => {
    const existingKey = existingNodeKeys.get(n.id);
    console.log(n.dataKey == existingKey);
    return existingKey && existingKey !== n.dataKey;
  });

  const hasStructuralChanges = hasNewNodes || hasDeletedNodes || hasDataChanges;
  let shouldRecalculateLayout =
    hasStructuralChanges || existingNodes.length === 0;

  const storyNodes = hierarchyNodes.filter((n) => n.type !== "character");
  const root = d3
    .stratify<(typeof storyNodes)[0]>()
    .id((d) => d.id)
    .parentId((d) => d.parentId)(storyNodes);

  const margin = { top: 50, right: 120, bottom: 150, left: 120 };
  const treeLayout = d3
    .tree<(typeof storyNodes)[0]>()
    .nodeSize([400, 350])
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

  const treeData = treeLayout(root);

  const characterNodes = hierarchyNodes.filter((n) => n.type === "character");
  const characterStartX = margin.left;
  const characterStartY = margin.top;
  const characterColumnWidth = nodeDimensions.character.width + 80;
  const charactersPerRow = 3;

  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];

  treeData.descendants().forEach((d) => {
    const nodeType = d.data.type as NodeType;
    const { width, height } = nodeDimensions[nodeType];
    const existingPos = existingPositions.get(d.id!);
    const currentDataKey = d.data.dataKey;

    const shouldUseExistingPos =
      existingPos &&
      existingPos.key === currentDataKey &&
      !shouldRecalculateLayout;

    const position = shouldUseExistingPos
      ? { x: existingPos.x, y: existingPos.y }
      : { x: d.x - width / 2, y: d.y };

    nodes.push({
      id: d.id!,
      type: d.data.type,
      position,
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
      edges.push({
        id: `e-${d.parent.id}-${d.id}`,
        source: d.parent.id!,
        target: d.id!,
        type: "smoothstep",
      });
    }
  });

  characterNodes.forEach((char, i) => {
    const row = Math.floor(i / charactersPerRow);
    const col = i % charactersPerRow;
    const { width, height } = nodeDimensions.character;
    const existingPos = existingPositions.get(char.id);
    const currentDataKey = char.dataKey;

    const shouldUseExistingPos =
      existingPos &&
      existingPos.key === currentDataKey &&
      !shouldRecalculateLayout;

    const position = shouldUseExistingPos
      ? { x: existingPos.x, y: existingPos.y }
      : {
          x: characterStartX + col * characterColumnWidth,
          y: characterStartY + row * (height + 50),
        };

    (nodes as any).push({
      id: char.id,
      type: char.type,
      position,
      data: {
        label: char.label,
        type: char.type,
        properties: char.properties,
        dataKey: currentDataKey,
      },
      style: {
        width,
        height,
      },
    });
  });

  if (shouldRecalculateLayout) {
    const storyNodePositions = nodes
      .filter((n) => n.type !== "character")
      .map((n) => n.position);

    if (storyNodePositions.length > 0) {
      const minX = Math.min(...storyNodePositions.map((p) => p.x));
      const minY = Math.min(...storyNodePositions.map((p) => p.y));

      const characterRowCount = Math.ceil(
        characterNodes.length / charactersPerRow
      );
      const characterAreaHeight =
        characterRowCount * (nodeDimensions.character.height + 50);

      const offsetX = -minX + margin.left;
      const offsetY = -minY + margin.top + characterAreaHeight + 150;

      nodes.forEach((node) => {
        if (node.type !== "character") {
          node.position.x += offsetX;
          node.position.y += offsetY;
        }
      });
    }
  }

  return { nodes, edges, hasStructuralChanges };
};

function VisualEditorInternal() {
  const { id } = useParams();
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes,
    setEdges,
    setSelectedNode,
    setViewportInitialized,
    viewportInitialized,
  } = useVisualEditorStore();

  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLayoutDone = useRef(false);
  const lastProjectDataRef = useRef<MangaProject | null>(null);

  const projectData = useLiveQuery(async () => {
    try {
      const project = await getProjectWithRelations(id as string);
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
    }
  }, [id]);

  const transformationResult = useMemo(() => {
    if (!projectData) return null;
    return transformProjectToFlowOptimized(projectData, storeNodes);
  }, [projectData, storeNodes]);

  useEffect(() => {
    if (!projectData) {
      setIsLoading(!error);
      return;
    }

    setIsLoading(false);
    setError(null);

    if (!transformationResult) return;

    const {
      nodes: newNodes,
      edges: newEdges,
      hasStructuralChanges,
    } = transformationResult;

    if (hasStructuralChanges || storeNodes.length === 0) {
      if (newNodes.length > 0) {
        const layoutEdges = newEdges.filter((edge) => !edge.data?.noLayout);
        const needsLayout =
          hasStructuralChanges || !isInitialLayoutDone.current;

        if (needsLayout) {
          const { nodes: layoutedNodes } = layoutElements(
            newNodes,
            layoutEdges
          );
          setNodes(layoutedNodes);
        } else {
          setNodes(newNodes);
        }

        setEdges(newEdges);

        if (!isInitialLayoutDone.current) {
          isInitialLayoutDone.current = true;
          const timer = setTimeout(() => {
            if (!viewportInitialized) {
              fitView({ padding: 0.2, duration: 600 });
              setViewportInitialized(true);
            }
          }, 200);
          return () => clearTimeout(timer);
        }
      }
    }

    lastProjectDataRef.current = projectData;
  }, [
    projectData,
    transformationResult,
    error,
    storeNodes.length,
    setNodes,
    setEdges,
    fitView,
    setViewportInitialized,
    viewportInitialized,
  ]);

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
      const newEdge = { ...connection, type: "smoothstep" };
      setEdges(addEdge(newEdge, storeEdges));
    },
    [setEdges, storeEdges]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<NodeData>) => {
      event.stopPropagation();
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
        nodes={storeNodes}
        edges={storeEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={false}
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/30"
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        selectNodesOnDrag={false}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls showInteractive={false} position="bottom-right" />
        <Background color="hsl(var(--border) / 0.3)" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function VisualEditor() {
  return (
    <div className="relative h-full w-full">
      <VisualEditorInternal />
    </div>
  );
}
