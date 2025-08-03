/**
 * MCP Tools Selector Component
 * Allows users to browse and select MCP tools as checkboxes for AI chat capabilities
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { McpTool, useMcpClient } from "@/hooks/use-mcp-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Code,
  Database,
  Edit,
  FileText,
  Image,
  Layers,
  MapPin,
  Palette,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface McpToolsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onToolsSelect: (tools: McpTool[]) => void;
  projectId: string;
  selectedTools?: McpTool[];
}

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Creation tools
  create: Plus,
  generate: Wand2,
  add: Plus,

  // Update tools
  update: Edit,
  modify: Edit,
  edit: Edit,

  // Management tools
  delete: Trash2,
  manage: Settings,

  // Content type specific
  character: Users,
  chapter: FileText,
  scene: Layers,
  panel: Image,
  location: MapPin,
  outfit: Palette,
  template: FileText,

  // Technical tools
  database: Database,
  code: Code,
  api: Code,

  // Default
  default: Wrench,
};

export function McpToolsSelector({
  isOpen,
  onClose,
  onToolsSelect,
  projectId,
  selectedTools: externalSelectedTools = [],
}: McpToolsSelectorProps) {
  const { state: mcpState } = useMcpClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

  // Initialize with external selected tools when dialog opens
  useEffect(() => {
    if (isOpen) {
      const selectedToolNames = externalSelectedTools.map((tool) => tool.name);
      setSelectedTools(new Set(selectedToolNames));
    } else {
      setSearchTerm("");
    }
  }, [isOpen, externalSelectedTools]);

  // Filter tools based on search term
  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return mcpState.tools;

    return mcpState.tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mcpState.tools, searchTerm]);

  // Group tools by category/functionality
  const groupedTools = useMemo(() => {
    const groups: Record<string, McpTool[]> = {
      creation: [],
      management: [],
      image: [],
      content: [],
      database: [],
      other: [],
    };

    filteredTools.forEach((tool) => {
      const name = tool.name.toLowerCase();
      const desc = tool.description.toLowerCase();

      if (
        name.includes("create") ||
        name.includes("generate") ||
        name.includes("add") ||
        desc.includes("create")
      ) {
        groups.creation.push(tool);
      } else if (
        name.includes("update") ||
        name.includes("modify") ||
        name.includes("edit") ||
        name.includes("delete") ||
        desc.includes("manage")
      ) {
        groups.management.push(tool);
      } else if (
        name.includes("image") ||
        name.includes("picture") ||
        name.includes("photo") ||
        desc.includes("image")
      ) {
        groups.image.push(tool);
      } else if (
        name.includes("character") ||
        name.includes("chapter") ||
        name.includes("scene") ||
        name.includes("panel")
      ) {
        groups.content.push(tool);
      } else if (
        name.includes("database") ||
        name.includes("data") ||
        name.includes("store")
      ) {
        groups.database.push(tool);
      } else {
        groups.other.push(tool);
      }
    });

    return groups;
  }, [filteredTools]);

  const getToolIcon = (tool: McpTool) => {
    const name = tool.name.toLowerCase();

    // Check for specific patterns
    for (const [key, Icon] of Object.entries(toolIcons)) {
      if (name.includes(key)) {
        return Icon;
      }
    }

    return toolIcons.default;
  };

  const getToolComplexity = (tool: McpTool) => {
    const paramCount = tool.inputSchema?.properties
      ? Object.keys(tool.inputSchema.properties).length
      : 0;
    if (paramCount === 0) return "Simple";
    if (paramCount <= 3) return "Medium";
    return "Complex";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple":
        return "bg-green-600/20 text-green-300 border-green-500/30";
      case "Medium":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30";
      case "Complex":
        return "bg-red-600/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleToolToggle = useCallback((tool: McpTool, checked: boolean) => {
    if (checked) {
      setSelectedTools((prev) => new Set([...prev, tool.name]));
    } else {
      setSelectedTools((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tool.name);
        return newSet;
      });
    }
  }, []);

  const handleSelectAll = useCallback((tools: McpTool[]) => {
    const toolNames = tools.map((t) => t.name);
    setSelectedTools((prev) => new Set([...prev, ...toolNames]));
  }, []);

  const handleDeselectAll = useCallback((tools: McpTool[]) => {
    const toolNames = tools.map((t) => t.name);
    setSelectedTools((prev) => {
      const newSet = new Set(prev);
      toolNames.forEach((name) => newSet.delete(name));
      return newSet;
    });
  }, []);

  const handleConfirmSelection = useCallback(() => {
    const selectedToolObjects = mcpState.tools.filter((tool) =>
      selectedTools.has(tool.name)
    );

    onToolsSelect(selectedToolObjects);
    onClose();
  }, [selectedTools, mcpState.tools, onToolsSelect, onClose]);

  if (!mcpState.isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>MCP Tools Unavailable</DialogTitle>
            <DialogDescription>
              The MCP server is not connected. Please check the connection and
              try again.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              MCP Tools
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select tools to make available to the AI chat. The AI will be able
            to use these tools to perform actions and operations.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Selection Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <Badge
            variant="secondary"
            className="bg-orange-600/20 text-orange-300"
          >
            {selectedTools.size} selected
          </Badge>
        </div>

        {/* Tool Groups */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-6">
            {Object.entries(groupedTools).map(([category, tools]) => {
              if (tools.length === 0) return null;

              const selectedInCategory = tools.filter((t) =>
                selectedTools.has(t.name)
              ).length;
              const allSelected = selectedInCategory === tools.length;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
                      {category
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}{" "}
                      ({tools.length})
                      <Badge variant="outline" className="text-xs">
                        {selectedInCategory}/{tools.length}
                      </Badge>
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAll(tools)}
                        disabled={allSelected}
                        className="text-xs text-orange-400 hover:text-orange-300"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeselectAll(tools)}
                        disabled={selectedInCategory === 0}
                        className="text-xs text-gray-400 hover:text-gray-300"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {tools.map((tool) => {
                      const Icon = getToolIcon(tool);
                      const isSelected = selectedTools.has(tool.name);
                      const complexity = getToolComplexity(tool);
                      const paramCount = tool.inputSchema?.properties
                        ? Object.keys(tool.inputSchema.properties).length
                        : 0;

                      return (
                        <motion.div
                          key={tool.name}
                          className={cn(
                            "p-4 rounded-lg border transition-all cursor-pointer",
                            isSelected
                              ? "bg-orange-900/30 border-orange-400/50 shadow-lg shadow-orange-500/10"
                              : "bg-gray-800/50 border-gray-600/50 hover:border-orange-400/30 hover:bg-gray-800/70"
                          )}
                          onClick={() => handleToolToggle(tool, !isSelected)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center gap-2 mt-0.5">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) =>
                                  handleToolToggle(
                                    tool,
                                    (e.target as HTMLInputElement).checked
                                  )
                                }
                                className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                              />
                              <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white text-sm">
                                  {tool.name
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs border",
                                    getComplexityColor(complexity)
                                  )}
                                >
                                  {complexity}
                                </Badge>
                              </div>

                              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                {tool.description}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>
                                  {paramCount} parameter
                                  {paramCount !== 1 ? "s" : ""}
                                </span>
                                {tool.inputSchema?.required && (
                                  <span>
                                    {tool.inputSchema.required.length} required
                                  </span>
                                )}
                              </div>

                              {/* Show some key parameters */}
                              {tool.inputSchema?.properties && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Object.keys(tool.inputSchema.properties)
                                    .slice(0, 4)
                                    .map((param) => (
                                      <Badge
                                        key={param}
                                        variant="secondary"
                                        className="text-xs bg-gray-700 text-gray-300"
                                      >
                                        {param}
                                      </Badge>
                                    ))}
                                  {Object.keys(tool.inputSchema.properties)
                                    .length > 4 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-gray-700 text-gray-300"
                                    >
                                      +
                                      {Object.keys(tool.inputSchema.properties)
                                        .length - 4}{" "}
                                      more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {selectedTools.size > 0 && (
              <span>
                {selectedTools.size} tool{selectedTools.size !== 1 ? "s" : ""}{" "}
                will be available to the AI
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedTools.size === 0}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Enable {selectedTools.size} Tool
              {selectedTools.size !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
