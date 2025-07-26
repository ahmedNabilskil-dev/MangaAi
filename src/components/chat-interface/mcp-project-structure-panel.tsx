/**
 * MCP-Enhanced Project Structure Panel - Fixed Version
 * Uses MCP resources to display project data
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMcpClient } from "@/hooks/use-mcp-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Layout,
  RefreshCw,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface McpProjectStructurePanelProps {
  projectId: string;
  onComponentSelect?: (componentId: string, type: string) => void;
  selectedEntity?: { id: string; type: string } | null;
  onEntitySelect?: (entity: { id: string; type: string } | null) => void;
  onAssetSelect?: (asset: any) => void;
}

interface ProjectData {
  id: string;
  title: string;
  description?: string;
  chapters?: any[];
  characters?: any[];
  status?: string;
}

export function McpProjectStructurePanel({
  projectId,
  onComponentSelect,
  selectedEntity,
  onEntitySelect,
}: McpProjectStructurePanelProps) {
  const { state: mcpState, actions: mcpActions } = useMcpClient("chat");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    characters: true,
    chapters: true,
  });

  // Use refs to track loading state and prevent duplicate requests
  const isLoadingRef = useRef(false);
  const loadedProjectIdRef = useRef<string | null>(null);

  // Load project data from MCP resources
  const loadProjectData = useCallback(async () => {
    // Prevent duplicate requests
    if (isLoadingRef.current) {
      console.log("⏸️ Already loading project data, skipping...");
      return;
    }

    // Skip if we already loaded this project ID
    if (loadedProjectIdRef.current === projectId && projectData) {
      console.log("✅ Project data already loaded for", projectId);
      return;
    }

    if (!mcpState.isConnected) {
      console.log("❌ MCP not connected, cannot load project data");
      return;
    }

    console.log("🔄 Loading project data for:", projectId);
    isLoadingRef.current = true;
    setIsLoadingProject(true);

    try {
      // Read project resource from MCP server
      const projectUri = `manga://project/${projectId}`;
      console.log("📖 Reading project resource:", projectUri);

      const projectResource = await mcpActions.readResource(projectUri);

      if (projectResource && projectResource.contents) {
        // Parse the project data from the resource
        const projectText = projectResource.contents[0]?.text;
        if (projectText) {
          const project = JSON.parse(projectText);
          console.log("✅ Project data loaded:", project);
          setProjectData(project);
          loadedProjectIdRef.current = projectId;
        } else {
          console.warn("⚠️ No project text content found");
          setProjectData(null);
        }
      } else {
        console.warn("⚠️ No project resource contents found");
        setProjectData(null);
      }
    } catch (error) {
      console.error("❌ Failed to load project data from MCP:", error);
      setProjectData(null);
      // Don't set loadedProjectIdRef on error so we can retry
    } finally {
      isLoadingRef.current = false;
      setIsLoadingProject(false);
    }
  }, [projectId, mcpState.isConnected, mcpActions.readResource]); // Remove projectData from deps

  // Manual refresh function that bypasses caching
  const refreshProjectData = useCallback(async () => {
    console.log("🔄 Manual refresh requested");
    loadedProjectIdRef.current = null; // Reset cache
    setProjectData(null);
    await loadProjectData();
  }, [loadProjectData]);

  // Load project data when MCP connection is available or project ID changes
  useEffect(() => {
    console.log("🎯 Effect triggered:", {
      isConnected: mcpState.isConnected,
      projectId,
      currentlyLoaded: loadedProjectIdRef.current,
    });

    if (mcpState.isConnected && projectId) {
      // Only load if we haven't loaded this project yet
      if (loadedProjectIdRef.current !== projectId) {
        loadProjectData();
      }
    } else if (!mcpState.isConnected) {
      // Reset state when disconnected
      setProjectData(null);
      loadedProjectIdRef.current = null;
    }
  }, [mcpState.isConnected, projectId]); // Remove loadProjectData from deps

  // Reset loaded project when projectId changes
  useEffect(() => {
    if (
      loadedProjectIdRef.current &&
      loadedProjectIdRef.current !== projectId
    ) {
      console.log("📍 Project ID changed, resetting cache");
      loadedProjectIdRef.current = null;
      setProjectData(null);
    }
  }, [projectId]);

  const toggleSection = useCallback((section: "characters" | "chapters") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleEntityClick = useCallback(
    (entity: any, type: string) => {
      const selectedEntity = { id: entity.id, type };
      onEntitySelect?.(selectedEntity);
      onComponentSelect?.(entity.id, type);
    },
    [onEntitySelect, onComponentSelect]
  );

  if (!mcpState.isConnected) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="p-4 bg-red-900/30 rounded-xl">
            <WifiOff className="w-12 h-12 text-red-400 mx-auto" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              MCP Server Disconnected
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              The Model Context Protocol server is not available.
              <br />
              Project data will be loaded from local sources.
            </p>
            <Button
              onClick={() => mcpActions.checkConnection()}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProject && !projectData) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          <p className="text-gray-400 mt-4">Loading project via MCP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Project Structure</h2>
              <div className="flex items-center gap-2 mt-1">
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">MCP Connected</span>
                {loadedProjectIdRef.current && (
                  <span className="text-xs text-gray-400">
                    (ID: {loadedProjectIdRef.current})
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={refreshProjectData}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={isLoadingProject}
          >
            <RefreshCw
              className={cn("w-4 h-4", isLoadingProject && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {projectData ? (
          <>
            {/* Project Info */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-600/30">
              <h3 className="font-semibold text-white text-lg mb-2">
                {projectData.title}
              </h3>
              {projectData.description && (
                <p className="text-gray-300 text-sm">
                  {projectData.description}
                </p>
              )}
              {projectData.status && (
                <Badge className="mt-2" variant="secondary">
                  {projectData.status}
                </Badge>
              )}
            </div>

            {/* Characters Section */}
            <div className="space-y-2">
              <div
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all group"
                onClick={() => toggleSection("characters")}
              >
                <div className="flex items-center gap-3">
                  {expandedSections.characters ? (
                    <ChevronDown className="w-4 h-4 text-blue-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-400 transition-transform duration-200" />
                  )}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base group-hover:text-blue-300 transition-colors">
                      Characters
                    </h3>
                    <p className="text-sm text-gray-400">
                      {projectData.characters?.length || 0} character
                      {(projectData.characters?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {expandedSections.characters && projectData.characters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 space-y-2"
                >
                  {projectData.characters.map((character: any) => (
                    <div
                      key={character.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-800/50 group cursor-pointer",
                        selectedEntity?.id === character.id &&
                          selectedEntity?.type === "character"
                          ? "bg-blue-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/10"
                          : "bg-gray-800/20 border border-gray-700/50 hover:border-blue-400/20"
                      )}
                      onClick={() => handleEntityClick(character, "character")}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {character.name?.[0] || "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm group-hover:text-blue-300 transition-colors truncate">
                          {character.name || "Unnamed Character"}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {character.role || "Character"}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Chapters Section */}
            <div className="space-y-2">
              <div
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all group"
                onClick={() => toggleSection("chapters")}
              >
                <div className="flex items-center gap-3">
                  {expandedSections.chapters ? (
                    <ChevronDown className="w-4 h-4 text-orange-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-orange-400 transition-transform duration-200" />
                  )}
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-200">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base group-hover:text-orange-300 transition-colors">
                      Chapters
                    </h3>
                    <p className="text-sm text-gray-400">
                      {projectData.chapters?.length || 0} chapter
                      {(projectData.chapters?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {expandedSections.chapters && projectData.chapters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 space-y-2"
                >
                  {projectData.chapters.map((chapter: any) => (
                    <div
                      key={chapter.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-800/50 group cursor-pointer",
                        selectedEntity?.id === chapter.id &&
                          selectedEntity?.type === "chapter"
                          ? "bg-orange-500/20 border border-orange-400/30 shadow-lg shadow-orange-500/10"
                          : "bg-gray-800/20 border border-gray-700/50 hover:border-orange-400/20"
                      )}
                      onClick={() => handleEntityClick(chapter, "chapter")}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {chapter.chapterNumber || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm group-hover:text-orange-300 transition-colors truncate">
                          {chapter.title ||
                            `Chapter ${chapter.chapterNumber || "?"}`}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">
                          {chapter.scenes?.length || 0} scenes
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Project Data
              </h3>
              <p className="text-gray-400 text-sm">
                Unable to load project data from MCP server.
              </p>
              <Button
                onClick={refreshProjectData}
                size="sm"
                className="mt-2"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
