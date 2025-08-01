"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getProjectWithRelations } from "@/services/data-service";
import { Chapter, Character, MangaProject, Scene } from "@/types/entities";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  FileText,
  Layers,
  Layout,
  MapPin,
  Palette,
  Plus,
  RefreshCcw,
  Settings,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import EntityDetailPanel, { DetailableEntity } from "./entity-detail-panel";
import { LocationTemplateForm, OutfitTemplateForm } from "./template-forms";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DetailPanelState {
  isOpen: boolean;
  entity: DetailableEntity | null;
  entityType:
    | "character"
    | "chapter"
    | "project"
    | "outfit"
    | "location"
    | null;
}

interface SelectedState {
  id: string;
  type: string;
}

// ============================================================================
// ENHANCED PROJECT STRUCTURE PANEL
// ============================================================================

interface EnhancedProjectStructurePanelProps {
  projectId: string;
  onComponentSelect?: (componentId: string, type: string) => void;
  selectedEntity?: SelectedState | null;
  onEntitySelect?: (entity: SelectedState | null) => void;
  onAssetSelect?: (asset: any) => void; // Optional prop for consistency
}

export function EnhancedProjectStructurePanel({
  projectId,
  onComponentSelect,
  selectedEntity,
  onEntitySelect,
  onAssetSelect, // Accept but ignore this prop
}: EnhancedProjectStructurePanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["project", "characters", "chapters"])
  );
  const [detailPanel, setDetailPanel] = useState<DetailPanelState>({
    isOpen: false,
    entity: null,
    entityType: null,
  });
  const [projectData, setProjectData] = useState<MangaProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refetch logic
  const loadProject = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectWithRelations(projectId);
      setProjectData(data);
    } catch (error) {
      console.error("Failed to load project:", error);
      setProjectData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleItemClick = (id: string, type: string) => {
    onComponentSelect?.(id, type);
  };

  const handleEntitySelect = (
    entity: DetailableEntity,
    type: string,
    id: string
  ) => {
    onEntitySelect?.({ id, type });
  };

  const showEntityDetails = (
    entity: DetailableEntity,
    entityType: DetailPanelState["entityType"]
  ) => {
    setDetailPanel({
      isOpen: true,
      entity,
      entityType,
    });
  };

  const closeDetailPanel = () => {
    setDetailPanel({
      isOpen: false,
      entity: null,
      entityType: null,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="text-center">
          <Users className="w-8 h-8 text-gray-400 animate-pulse mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading project structure...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="h-full bg-gray-900 text-white border-l border-gray-700">
        <div className="p-4 flex justify-between items-center">
          <div className="animate-pulse space-y-4 flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-700 rounded w-5/6" />
          </div>
          <button
            onClick={loadProject}
            className="ml-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v6h6M20 20v-6h-6M4 20a9 9 0 0114-7.36M20 4a9 9 0 00-14 7.36"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-l border-gray-700/50 flex flex-col relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-4 space-y-4">
          {/* Project Header */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-4 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => toggleExpanded("project")}
                className="flex items-center gap-3 flex-1 text-left hover:bg-gray-700/30 rounded-lg p-3 transition-all duration-200 group"
              >
                <div className="relative">
                  {expandedItems.has("project") ? (
                    <ChevronDown className="w-4 h-4 text-pink-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-pink-400 transition-transform duration-200" />
                  )}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25 transition-all duration-200">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base group-hover:text-pink-300 transition-colors">
                    {projectData.title || "Untitled Project"}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-pink-300/60">
                      {projectData.characters?.length || 0} characters
                    </span>
                    <span className="text-xs text-pink-300/40">•</span>
                    <span className="text-xs text-green-300/60">
                      {projectData.chapters?.length || 0} chapters
                    </span>
                  </div>
                </div>
              </button>
              {/* Refresh Button */}
              <button
                onClick={loadProject}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            {expandedItems.has("project") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 bg-gray-800/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-pink-400 text-pink-400"
                    >
                      {projectData.chapters?.length || 0} chapters
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-400 text-blue-400"
                    >
                      {projectData.characters?.length || 0} characters
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => showEntityDetails(projectData, "project")}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Project Details"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() =>
                        handleEntitySelect(
                          projectData,
                          "project",
                          projectData.id
                        )
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        selectedEntity?.id === projectData.id &&
                        selectedEntity?.type === "project"
                          ? "bg-pink-500/20 text-pink-400"
                          : "hover:bg-gray-700 text-gray-400"
                      }`}
                      title="Select Project"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {projectData.concept && (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {projectData.concept}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Characters Section */}
          <div className="bg-gradient-to-r from-blue-800/30 to-indigo-700/20 rounded-xl p-4 border border-blue-600/20 backdrop-blur-sm">
            <button
              onClick={() => toggleExpanded("characters")}
              className="flex items-center gap-3 w-full text-left hover:bg-blue-700/20 rounded-lg p-3 transition-all duration-200 group"
            >
              <div className="relative">
                {expandedItems.has("characters") ? (
                  <ChevronDown className="w-4 h-4 text-blue-400 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-blue-400 transition-transform duration-200" />
                )}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-base group-hover:text-blue-300 transition-colors">
                  Characters
                </h3>
                <p className="text-xs text-blue-300/70">
                  {projectData.characters?.length || 0} characters created
                </p>
              </div>
            </button>

            {expandedItems.has("characters") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {projectData.characters?.map((character: Character) => (
                  <div
                    key={character.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-800/50 group relative bg-gray-800/20 border ${
                      selectedEntity?.id === character.id &&
                      selectedEntity?.type === "character"
                        ? "bg-blue-500/20 border-blue-400/30 shadow-lg shadow-blue-500/10"
                        : "border-gray-700/50 hover:border-blue-400/20"
                    }`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-blue-500/30 group-hover:ring-blue-400/50 transition-all duration-200">
                      <AvatarImage src={character.imgUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-semibold">
                        {character.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-16">
                      <div
                        className="font-semibold text-white text-sm truncate group-hover:text-blue-300 transition-colors"
                        title={character.name}
                      >
                        {character.name}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {character.age && (
                          <span className="text-xs text-blue-300/60">
                            {character.age} years
                          </span>
                        )}
                        {character.age && character.gender && (
                          <span className="text-xs text-blue-300/40">•</span>
                        )}
                        {character.gender && (
                          <span className="text-xs text-blue-300/60">
                            {character.gender}
                          </span>
                        )}
                        {character.role && (
                          <>
                            <span className="text-xs text-blue-300/40">•</span>
                            <span
                              className="text-xs text-gray-400 truncate max-w-20"
                              title={character.role}
                            >
                              {character.role}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm rounded px-1 py-0.5">
                      <button
                        onClick={() =>
                          showEntityDetails(character, "character")
                        }
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="View Character Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() =>
                          handleEntitySelect(
                            character,
                            "character",
                            character.id
                          )
                        }
                        className={`p-1 rounded transition-colors ${
                          selectedEntity?.id === character.id &&
                          selectedEntity?.type === "character"
                            ? "bg-blue-500/40 text-blue-300"
                            : "hover:bg-gray-700 text-gray-400"
                        }`}
                        title="Select Character"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )) || (
                  <div className="text-sm text-gray-500 p-3 text-center bg-gray-800/30 rounded-lg">
                    No characters yet
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Chapters Section */}
          <div className="bg-gradient-to-r from-green-800/30 to-emerald-700/20 rounded-xl p-4 border border-green-600/20 backdrop-blur-sm">
            <button
              onClick={() => toggleExpanded("chapters")}
              className="flex items-center gap-3 w-full text-left hover:bg-green-700/20 rounded-lg p-3 transition-all duration-200 group"
            >
              <div className="relative">
                {expandedItems.has("chapters") ? (
                  <ChevronDown className="w-4 h-4 text-green-400 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-green-400 transition-transform duration-200" />
                )}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-200">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-base group-hover:text-green-300 transition-colors">
                  Chapters
                </h3>
                <p className="text-xs text-green-300/70">
                  {projectData.chapters?.length || 0} chapters written
                </p>
              </div>
            </button>

            {expandedItems.has("chapters") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {projectData.chapters?.map((chapter: Chapter) => (
                  <div key={chapter.id} className="space-y-2">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-800/50 group relative ${
                        selectedEntity?.id === chapter.id &&
                        selectedEntity?.type === "chapter"
                          ? "bg-green-500/20 border border-green-400/30"
                          : "bg-gray-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-16">
                        <button
                          onClick={() =>
                            toggleExpanded(`chapter-${chapter.id}`)
                          }
                          className="p-1 flex-shrink-0"
                        >
                          {expandedItems.has(`chapter-${chapter.id}`) ? (
                            <ChevronDown className="w-3 h-3 text-green-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-green-400" />
                          )}
                        </button>
                        <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium text-white text-sm truncate"
                            title={chapter.title}
                          >
                            {chapter.title}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            Chapter {chapter.chapterNumber} •{" "}
                            {chapter.scenes?.length || 0} scenes
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm rounded px-1 py-0.5">
                        <button
                          onClick={() => showEntityDetails(chapter, "chapter")}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          title="View Chapter Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-green-400" />
                        </button>
                        <button
                          onClick={() =>
                            handleEntitySelect(chapter, "chapter", chapter.id)
                          }
                          className={`p-1 rounded transition-colors ${
                            selectedEntity?.id === chapter.id &&
                            selectedEntity?.type === "chapter"
                              ? "bg-green-500/40 text-green-300"
                              : "hover:bg-gray-700 text-gray-400"
                          }`}
                          title="Select Chapter"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chapter Scenes */}
                    {expandedItems.has(`chapter-${chapter.id}`) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-6 mt-3 space-y-2 bg-gradient-to-r from-gray-800/30 to-gray-700/20 rounded-lg p-3 border border-gray-700/30"
                      >
                        {chapter.scenes?.map((scene: Scene) => (
                          <div key={scene.id} className="space-y-2">
                            {/* Scene Header */}
                            <div
                              className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-800/50 group relative bg-gray-800/20 border ${
                                selectedEntity?.id === scene.id &&
                                selectedEntity?.type === "scene"
                                  ? "bg-yellow-500/20 border-yellow-400/30 shadow-lg shadow-yellow-500/10"
                                  : "border-gray-700/50 hover:border-yellow-400/20"
                              }`}
                            >
                              {/* Expand/Collapse Button for Scene */}
                              <button
                                onClick={() =>
                                  toggleExpanded(`scene-${scene.id}`)
                                }
                                className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                              >
                                {expandedItems.has(`scene-${scene.id}`) ? (
                                  <ChevronDown className="w-3 h-3 text-yellow-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-yellow-400" />
                                )}
                              </button>

                              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-yellow-500/20 transition-all duration-200 flex-shrink-0">
                                <Layout className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0 pr-20">
                                <div
                                  className="font-medium text-white text-sm truncate group-hover:text-yellow-300 transition-colors"
                                  title={scene.title}
                                >
                                  {scene.title}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-yellow-300/60">
                                    {scene.panels?.length || 0} panels
                                  </span>
                                  {scene.description && (
                                    <>
                                      <span className="text-xs text-yellow-300/40">
                                        •
                                      </span>
                                      <span
                                        className="text-xs text-gray-400 truncate max-w-24"
                                        title={scene.description}
                                      >
                                        {scene.description}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm rounded px-1 py-0.5">
                                <button
                                  onClick={() =>
                                    showEntityDetails(
                                      scene as any,
                                      "scene" as any
                                    )
                                  }
                                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                                  title="View Scene Details"
                                >
                                  <Eye className="w-3.5 h-3.5 text-yellow-400" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleEntitySelect(
                                      scene as any,
                                      "scene",
                                      scene.id
                                    )
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    selectedEntity?.id === scene.id &&
                                    selectedEntity?.type === "scene"
                                      ? "bg-yellow-500/40 text-yellow-300"
                                      : "hover:bg-gray-700 text-gray-400"
                                  }`}
                                  title="Select Scene"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Scene Panels */}
                            {expandedItems.has(`scene-${scene.id}`) &&
                              scene.panels &&
                              scene.panels.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-8 space-y-1 bg-gradient-to-r from-cyan-900/20 to-blue-900/10 rounded-lg p-2 border border-cyan-700/30"
                                >
                                  {scene.panels.map((panel: any) => (
                                    <div
                                      key={panel.id}
                                      className={`p-2 rounded-lg transition-all hover:bg-cyan-800/30 group relative bg-cyan-800/10 border ${
                                        selectedEntity?.id === panel.id &&
                                        selectedEntity?.type === "panel"
                                          ? "bg-cyan-500/20 border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                                          : "border-cyan-700/30 hover:border-cyan-400/20"
                                      }`}
                                    >
                                      {/* Header with icon, title and actions */}
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center shadow-sm group-hover:shadow-cyan-500/20 transition-all duration-200 flex-shrink-0">
                                            <Eye className="w-3 h-3 text-white" />
                                          </div>
                                          <div
                                            className="font-medium text-white text-xs group-hover:text-cyan-300 transition-colors"
                                            title={`Panel ${panel.order}`}
                                          >
                                            Panel {panel.order}
                                          </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() =>
                                              showEntityDetails(
                                                panel as any,
                                                "panel" as any
                                              )
                                            }
                                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                                            title="View Panel Details"
                                          >
                                            <Eye className="w-3 h-3 text-cyan-400" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleEntitySelect(
                                                panel as any,
                                                "panel",
                                                panel.id
                                              )
                                            }
                                            className={`p-1 rounded transition-colors ${
                                              selectedEntity?.id === panel.id &&
                                              selectedEntity?.type === "panel"
                                                ? "bg-cyan-500/40 text-cyan-300"
                                                : "hover:bg-gray-700 text-gray-400"
                                            }`}
                                            title="Select Panel"
                                          >
                                            <Settings className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Panel details - stacked vertically for narrow width */}
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-cyan-300/60 bg-cyan-900/20 px-2 py-0.5 rounded">
                                            💬 {panel.dialogues?.length || 0}{" "}
                                            dialogues
                                          </span>
                                        </div>

                                        {/* Technical details in compact rows */}
                                        <div className="space-y-1">
                                          {panel.panelContext?.shotType && (
                                            <div className="text-xs text-gray-400 capitalize bg-cyan-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                                              <span>📷</span>
                                              <span className="truncate">
                                                {panel.panelContext.shotType}
                                              </span>
                                            </div>
                                          )}
                                          {panel.panelContext?.emotion && (
                                            <div className="text-xs text-gray-400 capitalize bg-cyan-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                                              <span>😊</span>
                                              <span className="truncate">
                                                {panel.panelContext.emotion}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                          </div>
                        )) || (
                          <div className="text-xs text-gray-500 p-2 text-center">
                            No scenes yet
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )) || (
                  <div className="text-sm text-gray-500 p-3 text-center bg-gray-800/30 rounded-lg">
                    No chapters yet
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Entity Detail Panel */}
      <EntityDetailPanel
        entity={detailPanel.entity}
        entityType={detailPanel.entityType}
        projectData={projectData}
        isOpen={detailPanel.isOpen}
        onClose={closeDetailPanel}
        onEdit={(entity) => {
          console.log("Edit entity:", entity);
          closeDetailPanel();
        }}
        onDelete={(entity) => {
          console.log("Delete entity:", entity);
          closeDetailPanel();
        }}
        onDuplicate={(entity) => {
          console.log("Duplicate entity:", entity);
          closeDetailPanel();
        }}
      />
    </div>
  );
}

// ============================================================================
// ENHANCED TEMPLATE LIBRARY PANEL
// ============================================================================

interface EnhancedTemplateLibraryPanelProps {
  projectId: string;
  onTemplateSelect?: (templateId: string, type: string) => void;
  selectedEntity?: SelectedState | null;
  onEntitySelect?: (entity: SelectedState | null) => void;
  onAssetSelect?: (asset: any) => void; // Optional prop for consistency
  onTemplateCreate?: (type: "outfits" | "locations") => void; // New prop for template creation
}

export function EnhancedTemplateLibraryPanel({
  projectId,
  onTemplateSelect,
  selectedEntity,
  onEntitySelect,
  onAssetSelect, // Accept but ignore this prop
  onTemplateCreate, // Accept template creation callback
}: EnhancedTemplateLibraryPanelProps) {
  const [activeTab, setActiveTab] = useState<"outfits" | "locations">(
    "outfits"
  );
  const [detailPanel, setDetailPanel] = useState<DetailPanelState>({
    isOpen: false,
    entity: null,
    entityType: null,
  });
  const [projectData, setProjectData] = useState<MangaProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      try {
        const data = await getProjectWithRelations(projectId);
        setProjectData(data);
      } catch (error) {
        console.error("Failed to load project:", error);
        setProjectData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const reloadProject = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectWithRelations(projectId);
      setProjectData(data);
    } catch (error) {
      console.error("Failed to reload project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showEntityDetails = (
    entity: DetailableEntity,
    entityType: DetailPanelState["entityType"]
  ) => {
    setDetailPanel({
      isOpen: true,
      entity,
      entityType,
    });
  };

  const closeDetailPanel = () => {
    setDetailPanel({
      isOpen: false,
      entity: null,
      entityType: null,
    });
  };

  const handleTemplateAction = async (
    action: "edit" | "duplicate" | "delete" | "apply",
    template: any
  ) => {
    switch (action) {
      case "edit":
        showEntityDetails(
          template,
          activeTab as DetailPanelState["entityType"]
        );
        break;
      case "duplicate":
        toast({
          title: "Feature Coming Soon",
          description: "Template duplication will be available soon!",
        });
        break;
      case "delete":
        toast({
          title: "Feature Coming Soon",
          description: "Template deletion will be available soon!",
        });
        break;
      case "apply":
        toast({
          title: "Template Selected",
          description: `${template.name} template is ready to be applied to characters or scenes!`,
        });
        onEntitySelect?.({ id: template.id, type: activeTab });
        break;
    }
  };

  const getTemplates = () => {
    if (!projectData) return [];
    switch (activeTab) {
      case "outfits":
        return projectData.outfitTemplates || [];
      case "locations":
        return projectData.locationTemplates || [];
      default:
        return [];
    }
  };

  const templates = getTemplates();

  const tabConfig = {
    outfits: {
      icon: Palette,
      color: "pink",
      label: "Outfits",
      activeClasses: "bg-pink-500/20 text-pink-400 border border-pink-400/30",
      iconClasses: "text-pink-400",
      bgClasses: "bg-pink-500/20",
      borderClasses: "border-pink-400/30 bg-pink-500/10",
      badgeClasses: "border-pink-400/50 text-pink-400",
      buttonClasses: "bg-pink-500 hover:bg-pink-600",
    },
    locations: {
      icon: MapPin,
      color: "green",
      label: "Locations",
      activeClasses:
        "bg-green-500/20 text-green-400 border border-green-400/30",
      iconClasses: "text-green-400",
      bgClasses: "bg-green-500/20",
      borderClasses: "border-green-400/30 bg-green-500/10",
      badgeClasses: "border-green-400/50 text-green-400",
      buttonClasses: "bg-green-500 hover:bg-green-600",
    },
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-l border-gray-700/50 overflow-hidden flex flex-col relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Tab Header */}
      <div className="p-4 border-b border-gray-700/50 relative z-10">
        <h3 className="font-bold text-white mb-4 text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Template Library
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? `${config.activeClasses} shadow-lg`
                    : "bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300 backdrop-blur-sm border border-gray-600/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 shadow-lg`
                      : "bg-gray-700/50 group-hover:bg-gray-600/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-300"
                    )}
                  />
                </div>
                <span className="flex-1">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                  tabConfig[activeTab].bgClasses
                )}
              >
                {React.createElement(tabConfig[activeTab].icon, {
                  className: cn("w-6 h-6", tabConfig[activeTab].iconClasses),
                })}
              </div>
              <p className="text-gray-400 mb-4">No {activeTab} templates yet</p>
              <Button
                size="sm"
                className={tabConfig[activeTab].buttonClasses}
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template: any) => (
                <div
                  key={template.id}
                  className={cn(
                    "bg-gradient-to-r from-gray-800/40 to-gray-700/30 rounded-xl p-4 hover:from-gray-700/50 hover:to-gray-600/40 transition-all group border backdrop-blur-sm shadow-lg",
                    selectedEntity?.id === template.id &&
                      selectedEntity?.type === activeTab
                      ? `${tabConfig[activeTab].borderClasses} shadow-xl ring-1 ring-opacity-20`
                      : "border-gray-700/50 hover:border-gray-600/60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-200",
                        `bg-gradient-to-br from-${tabConfig[activeTab].color}-500 to-${tabConfig[activeTab].color}-600`
                      )}
                    >
                      {React.createElement(tabConfig[activeTab].icon, {
                        className: "w-6 h-6 text-white",
                      })}
                    </div>
                    <div className="flex-1 min-w-0 pr-20">
                      <h4
                        className="font-semibold text-white text-sm truncate mb-1 group-hover:text-opacity-90 transition-colors"
                        title={template.name}
                      >
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                        {template.description}
                      </p>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full bg-opacity-20 border border-opacity-30",
                                `bg-${tabConfig[activeTab].color}-500 border-${tabConfig[activeTab].color}-400 text-${tabConfig[activeTab].color}-300`
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{template.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 backdrop-blur-sm rounded-lg px-1 py-0.5">
                      <button
                        onClick={() =>
                          showEntityDetails(
                            template,
                            activeTab as DetailPanelState["entityType"]
                          )
                        }
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Template Details"
                      >
                        <Eye
                          className={cn(
                            "w-4 h-4",
                            tabConfig[activeTab].iconClasses
                          )}
                        />
                      </button>
                      <button
                        onClick={() => handleTemplateAction("apply", template)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          selectedEntity?.id === template.id &&
                            selectedEntity?.type === activeTab
                            ? `bg-${tabConfig[activeTab].color}-500/40 text-${tabConfig[activeTab].color}-300`
                            : "hover:bg-gray-700 text-gray-400"
                        )}
                        title="Apply to Character/Scene"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTemplateAction("edit", template)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-blue-400"
                        title="Edit Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleTemplateAction("duplicate", template)
                        }
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-green-400"
                        title="Duplicate Template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTemplateAction("delete", template)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Creation Forms Dialog */}
      {activeTab === "outfits" ? (
        <OutfitTemplateForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          projectId={projectData?.id || ""}
          onSuccess={(template) => {
            toast({
              title: "Success",
              description: "Outfit template created successfully!",
            });
            setShowCreateForm(false);
            // Refresh the data if needed
          }}
        />
      ) : (
        <LocationTemplateForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          projectId={projectData?.id || ""}
          onSuccess={(template) => {
            toast({
              title: "Success",
              description: "Location template created successfully!",
            });
            setShowCreateForm(false);
            // Refresh the data if needed
          }}
        />
      )}

      {/* Entity Detail Panel for Templates */}
      <EntityDetailPanel
        entity={detailPanel.entity}
        entityType={detailPanel.entityType}
        projectData={projectData}
        isOpen={detailPanel.isOpen}
        onClose={closeDetailPanel}
        onEdit={(entity) => {
          console.log("Edit template:", entity);
          closeDetailPanel();
        }}
        onDelete={(entity) => {
          console.log("Delete template:", entity);
          closeDetailPanel();
        }}
        onDuplicate={(entity) => {
          console.log("Duplicate template:", entity);
          closeDetailPanel();
        }}
      />
    </div>
  );
}
