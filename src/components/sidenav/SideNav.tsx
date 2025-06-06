"use client";

import { useVisualEditorStore } from "@/store/visual-editor-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  PanelLeft,
  PanelRight,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useReactFlow } from "reactflow";

const ICON_MAP = {
  project: <Layers className="w-4 h-4" />,
  chapter: <FileText className="w-4 h-4" />,
  scene: <PanelLeft className="w-4 h-4" />,
  panel: <PanelRight className="w-4 h-4" />,
  dialogue: <FileText className="w-4 h-4" />,
  character: <User className="w-4 h-4" />,
};

export default function EnhancedSidebar() {
  const { nodes, edges, selectedNode, setSelectedNode } =
    useVisualEditorStore();
  const { setCenter, getZoom } = useReactFlow();
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Build tree structure from nodes and edges
  const buildTree = useCallback(() => {
    const nodeMap = {};
    const rootNodes = [];

    // Create all nodes
    nodes.forEach((node) => {
      nodeMap[node.id] = {
        ...node,
        children: [],
      };
    });

    // Build hierarchy
    nodes.forEach((node) => {
      const parentEdge = edges.find((edge) => edge.target === node.id);
      if (parentEdge) {
        if (nodeMap[parentEdge.source]) {
          nodeMap[parentEdge.source].children.push(nodeMap[node.id]);
        }
      } else {
        // Only show project and character nodes at root level
        if (node.data.type === "project" || node.data.type === "character") {
          rootNodes.push(nodeMap[node.id]);
        }
      }
    });

    // Sort nodes by type and label
    const sortNodes = (nodes) => {
      return nodes.sort((a, b) => {
        // Project first
        if (a.data.type === "project") return -1;
        if (b.data.type === "project") return 1;

        // Then chapters
        if (a.data.type === "chapter" && b.data.type !== "chapter") return -1;
        if (b.data.type === "chapter" && a.data.type !== "chapter") return 1;

        // Then by label
        return (a.data.label || "").localeCompare(b.data.label || "");
      });
    };

    const sortedRoots = sortNodes(rootNodes);

    // Recursively sort children
    const sortChildren = (node) => {
      if (node.children && node.children.length > 0) {
        node.children = sortNodes(node.children);
        node.children.forEach(sortChildren);
      }
    };

    sortedRoots.forEach(sortChildren);
    return sortedRoots;
  }, [nodes, edges]);

  const treeData = buildTree();

  // Filter tree based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return treeData;

    const filterNodes = (nodes) => {
      return nodes
        .filter((node) => {
          const matches = node.data.label
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
          const childMatches =
            node.children && filterNodes(node.children).length > 0;
          return matches || childMatches;
        })
        .map((node) => ({
          ...node,
          children: node.children ? filterNodes(node.children) : [],
        }));
    };

    return filterNodes(treeData);
  }, [treeData, searchQuery]);

  // Toggle node expansion
  const toggleExpand = useCallback((id) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Focus on node in the editor
  const focusNode = useCallback(
    (node) => {
      setSelectedNode(node);
      const zoom = getZoom();
      const x = node.position.x + (node.width || 0) / 2;
      const y = node.position.y + (node.height || 0) / 2;
      setCenter(x, y, { zoom, duration: 500 });
    },
    [setCenter, getZoom, setSelectedNode]
  );

  // Render a single tree node
  const TreeNode = ({ node, depth = 0 }) => {
    const isExpanded = expandedNodes[node.id] ?? depth < 1;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div className="space-y-1">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => focusNode(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className={
                isSelected
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }
            >
              {ICON_MAP[node.data.type] || <FileText className="w-4 h-4" />}
            </span>
            <span
              className={`text-sm truncate ${
                isSelected
                  ? "font-medium text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {node.data.label || `Untitled ${node.data.type}`}
            </span>
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Project Structure
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {nodes.length} elements
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elements..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredData.map((node) => (
            <TreeNode key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>v1.0.0</span>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
