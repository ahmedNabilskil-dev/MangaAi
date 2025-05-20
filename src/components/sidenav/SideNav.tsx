// components/side-nav/side-nav.tsx
"use client";

import { cn } from "@/lib/utils";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import type { NodeData } from "@/types/nodes";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  PanelLeft,
  PanelRight,
  PersonStandingIcon,
  Type,
} from "lucide-react";
import { useRef, useState } from "react";
import { Node, useReactFlow } from "reactflow";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TreeNode = {
  id: string;
  name: string;
  type: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  nodeRef?: Node<NodeData>;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  project: <Layers className="w-4 h-4" />,
  chapter: <FileText className="w-4 h-4" />,
  scene: <PanelLeft className="w-4 h-4" />,
  panel: <PanelRight className="w-4 h-4" />,
  dialogue: <Type className="w-4 h-4" />,
  character: <PersonStandingIcon className="w-4 h-4" />,
};

export function SideNav() {
  const { setCenter, getZoom } = useReactFlow();
  const nodes = useVisualEditorStore((state) => state.nodes);
  const selectedNode = useVisualEditorStore((state) => state.selectedNode);
  const setSelectedNode = useVisualEditorStore(
    (state) => state.setSelectedNode
  );
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {}
  );
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Build the tree structure from nodes
  const buildTree = (): TreeNode[] => {
    const rootNodes: TreeNode[] = [];
    const nodeMap: Record<string, TreeNode> = {};

    // First pass: create all nodes
    nodes.forEach((node) => {
      nodeMap[node.id] = {
        id: node.id,
        name: node.data.label || `Untitled ${node.data.type}`,
        type: node.data.type,
        icon: ICON_MAP[node.data.type],
        nodeRef: node,
      };
    });

    // Second pass: build hierarchy
    nodes.forEach((node) => {
      const edges = useVisualEditorStore.getState().edges;
      const parentEdge = edges.find((edge) => edge.target === node.id);

      if (parentEdge) {
        const parent = nodeMap[parentEdge.source];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(nodeMap[node.id]);
        }
      } else {
        // Only add root nodes (project and characters)
        if (node.data.type === "project" || node.data.type === "character") {
          rootNodes.push(nodeMap[node.id]);
        }
      }
    });

    // Sort children by type and then by name
    const sortNodes = (nodes: TreeNode[]) => {
      return nodes.sort((a, b) => {
        // Project should be first
        if (a.type === "project") return -1;
        if (b.type === "project") return 1;

        // Then chapters
        if (a.type === "chapter" && b.type !== "chapter") return -1;
        if (b.type === "chapter" && a.type !== "chapter") return 1;

        // Then scenes, panels, etc.
        const typeOrder = [
          "project",
          "chapter",
          "scene",
          "panel",
          "dialogue",
          "character",
        ];
        const aIndex = typeOrder.indexOf(a.type);
        const bIndex = typeOrder.indexOf(b.type);

        if (aIndex !== bIndex) return aIndex - bIndex;

        // For same type, sort by name
        return a.name.localeCompare(b.name);
      });
    };

    // Sort root nodes
    const sortedRoots = sortNodes(rootNodes);

    // Sort children recursively
    const sortChildren = (node: TreeNode) => {
      if (node.children) {
        node.children = sortNodes(node.children);
        node.children.forEach(sortChildren);
      }
    };

    sortedRoots.forEach(sortChildren);

    return sortedRoots;
  };

  const treeData = buildTree();

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const focusNode = (node: Node<NodeData>) => {
    setSelectedNode(node);

    // Calculate the position to center the node
    const zoom = getZoom();
    const x = node.position.x + (node.width || 0) / 2;
    const y = node.position.y + (node.height || 0) / 2;

    setCenter(x, y, { zoom, duration: 500 });
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] ?? depth < 2; // Default expanded for first 2 levels
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent",
            isSelected && "bg-accent font-medium",
            depth === 0 && "font-semibold"
          )}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          onClick={() => node.nodeRef && focusNode(node.nodeRef)}
        >
          {hasChildren && (
            <button
              className="w-4 h-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4 h-4" />}
          <span className="flex items-center gap-2 flex-1 min-w-0">
            {node.icon && (
              <span className="text-muted-foreground">{node.icon}</span>
            )}
            <span className="truncate">{node.name}</span>
          </span>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children?.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={navRef}
      className={cn(
        "absolute top-0 left-0 h-full z-20 bg-background border-r shadow-lg transition-all duration-300 flex flex-col",
        collapsed ? "w-12" : "w-64"
      )}
    >
      <div className="p-2 border-b flex justify-between items-center h-12">
        {!collapsed && <h2 className="font-semibold">Project Navigation</h2>}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expand" : "Collapse"}
          </TooltipContent>
        </Tooltip>
      </div>

      <ScrollArea className="flex-1 p-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {treeData.slice(0, 5).map((node) => (
              <Tooltip key={node.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => node.nodeRef && focusNode(node.nodeRef)}
                  >
                    {node.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{node.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {treeData.map((node) => renderTreeNode(node))}
          </div>
        )}
      </ScrollArea>

      {!collapsed && (
        <div className="p-2 border-t text-xs text-muted-foreground">
          {nodes.length} elements
        </div>
      )}
    </div>
  );
}
