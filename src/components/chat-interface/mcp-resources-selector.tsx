/**
 * MCP Resources Selector Component
 * Allows users to browse and select MCP resources as checkboxes for AI chat context
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
import { McpResource, useMcpClient } from "@/hooks/use-mcp-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Database,
  File,
  FileText,
  Folder,
  Image,
  Layers,
  Loader2,
  MapPin,
  Palette,
  Search,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface McpResourcesSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onResourcesSelect: (
    resources: McpResource[],
    resourceContents: Record<string, any>
  ) => void;
  projectId: string;
}

const resourceIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  project: Folder,
  character: Users,
  chapter: FileText,
  scene: Layers,
  panel: Image,
  location: MapPin,
  outfit: Palette,
  template: File,
  default: Database,
};

export function McpResourcesSelector({
  isOpen,
  onClose,
  onResourcesSelect,
  projectId,
}: McpResourcesSelectorProps) {
  const { state: mcpState, actions: mcpActions } = useMcpClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [resourceContents, setResourceContents] = useState<Record<string, any>>(
    {}
  );

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedResources(new Set());
      setResourceContents({});
      setSearchTerm("");
    }
  }, [isOpen]);

  // Filter resources based on search term
  const filteredResources = useMemo(() => {
    if (!searchTerm.trim()) return mcpState.resources;

    return mcpState.resources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        resource.uri.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mcpState.resources, searchTerm]);

  // Group resources by type/category
  const groupedResources = useMemo(() => {
    const groups: Record<string, McpResource[]> = {
      project: [],
      characters: [],
      chapters: [],
      scenes: [],
      templates: [],
      other: [],
    };

    filteredResources.forEach((resource) => {
      const uri = resource.uri.toLowerCase();
      if (uri.includes("project")) {
        groups.project.push(resource);
      } else if (uri.includes("character")) {
        groups.characters.push(resource);
      } else if (uri.includes("chapter")) {
        groups.chapters.push(resource);
      } else if (uri.includes("scene")) {
        groups.scenes.push(resource);
      } else if (
        uri.includes("template") ||
        uri.includes("outfit") ||
        uri.includes("location")
      ) {
        groups.templates.push(resource);
      } else {
        groups.other.push(resource);
      }
    });

    return groups;
  }, [filteredResources]);

  const getResourceIcon = (resource: McpResource) => {
    const uri = resource.uri.toLowerCase();
    if (uri.includes("character")) return resourceIcons.character;
    if (uri.includes("chapter")) return resourceIcons.chapter;
    if (uri.includes("scene")) return resourceIcons.scene;
    if (uri.includes("panel")) return resourceIcons.panel;
    if (uri.includes("location")) return resourceIcons.location;
    if (uri.includes("outfit")) return resourceIcons.outfit;
    if (uri.includes("template")) return resourceIcons.template;
    if (uri.includes("project")) return resourceIcons.project;
    return resourceIcons.default;
  };

  const handleResourceToggle = useCallback(
    async (resource: McpResource, checked: boolean) => {
      if (checked) {
        setSelectedResources((prev) => new Set([...prev, resource.uri]));

        // Load resource content if not already loaded
        if (!resourceContents[resource.uri]) {
          try {
            const content = await mcpActions.readResource(resource.uri);
            setResourceContents((prev) => ({
              ...prev,
              [resource.uri]: content,
            }));
          } catch (error) {
            console.error(`Failed to load resource ${resource.uri}:`, error);
          }
        }
      } else {
        setSelectedResources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(resource.uri);
          return newSet;
        });
      }
    },
    [mcpActions, resourceContents]
  );

  const handleSelectAll = useCallback(
    (resources: McpResource[]) => {
      setIsLoading(true);
      const uris = resources.map((r) => r.uri);
      setSelectedResources((prev) => new Set([...prev, ...uris]));

      // Load all resource contents
      Promise.all(
        resources.map(async (resource) => {
          if (!resourceContents[resource.uri]) {
            try {
              const content = await mcpActions.readResource(resource.uri);
              return { uri: resource.uri, content };
            } catch (error) {
              console.error(`Failed to load resource ${resource.uri}:`, error);
              return null;
            }
          }
          return null;
        })
      ).then((results) => {
        const newContents: Record<string, any> = {};
        results.forEach((result) => {
          if (result) {
            newContents[result.uri] = result.content;
          }
        });
        setResourceContents((prev) => ({ ...prev, ...newContents }));
        setIsLoading(false);
      });
    },
    [mcpActions, resourceContents]
  );

  const handleDeselectAll = useCallback((resources: McpResource[]) => {
    const uris = resources.map((r) => r.uri);
    setSelectedResources((prev) => {
      const newSet = new Set(prev);
      uris.forEach((uri) => newSet.delete(uri));
      return newSet;
    });
  }, []);

  const handleConfirmSelection = useCallback(() => {
    const selectedResourceObjects = mcpState.resources.filter((resource) =>
      selectedResources.has(resource.uri)
    );

    onResourcesSelect(selectedResourceObjects, resourceContents);
    onClose();
  }, [
    selectedResources,
    mcpState.resources,
    resourceContents,
    onResourcesSelect,
    onClose,
  ]);

  if (!mcpState.isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>MCP Resources Unavailable</DialogTitle>
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MCP Resources
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select resources to provide context to the AI chat. Selected
            resources will be loaded and available for the AI to reference.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Selection Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
            {selectedResources.size} selected
          </Badge>
        </div>

        {/* Resource Groups */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-6">
            {Object.entries(groupedResources).map(([category, resources]) => {
              if (resources.length === 0) return null;

              const selectedInCategory = resources.filter((r) =>
                selectedResources.has(r.uri)
              ).length;
              const allSelected = selectedInCategory === resources.length;
              const someSelected =
                selectedInCategory > 0 && selectedInCategory < resources.length;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
                      {category
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}{" "}
                      ({resources.length})
                      <Badge variant="outline" className="text-xs">
                        {selectedInCategory}/{resources.length}
                      </Badge>
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAll(resources)}
                        disabled={allSelected || isLoading}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => handleDeselectAll(resources)}
                        disabled={selectedInCategory === 0}
                        className="text-xs text-gray-400 hover:text-gray-300"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {resources.map((resource) => {
                      const Icon = getResourceIcon(resource);
                      const isSelected = selectedResources.has(resource.uri);
                      const isLoading =
                        isSelected && !resourceContents[resource.uri];

                      return (
                        <motion.div
                          key={resource.uri}
                          className={cn(
                            "p-3 rounded-lg border transition-all cursor-pointer",
                            isSelected
                              ? "bg-blue-900/30 border-blue-400/50 shadow-lg shadow-blue-500/10"
                              : "bg-gray-800/50 border-gray-600/50 hover:border-blue-400/30 hover:bg-gray-800/70"
                          )}
                          onClick={() =>
                            handleResourceToggle(resource, !isSelected)
                          }
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-0.5">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) =>
                                  handleResourceToggle(
                                    resource,
                                    (e.target as HTMLInputElement).checked
                                  )
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                              ) : (
                                <div className="p-1.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-md">
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm truncate">
                                {resource.name}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {resource.uri}
                              </p>
                              {resource.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
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
            {selectedResources.size > 0 && (
              <span>
                {selectedResources.size} resource
                {selectedResources.size !== 1 ? "s" : ""} will be provided to
                the AI
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
              disabled={selectedResources.size === 0}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Add {selectedResources.size} Resource
              {selectedResources.size !== 1 ? "s" : ""} to Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
