"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProjectWithRelations } from "@/services/data-service";
import { MangaProject } from "@/types/entities";
import { Download, Eye, Filter, Image, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ============================================================================
// GENERATED ASSETS PANEL
// ============================================================================

interface Asset {
  id: string;
  type: "character" | "panel" | "scene" | "other";
  name: string;
  url: string;
  timestamp: string;
  chapterId?: string;
  chapterTitle?: string;
  sceneId?: string;
  sceneTitle?: string;
  panelOrder?: number;
}

interface AssetFilters {
  type: string;
  chapter: string;
  scene: string;
  search: string;
}

interface GeneratedAssetsPanelProps {
  projectId: string;
  onAssetAction?: (assetId: string, action: string) => void;
  onComponentSelect?: (componentId: string, type: string) => void;
  selectedEntity?: { id: string; type: string } | null;
  onEntitySelect?: (entity: { id: string; type: string } | null) => void;
  onAssetSelect?: (asset: Asset) => void;
}

export function GeneratedAssetsPanel({
  projectId,
  onAssetAction,
  onComponentSelect,
  selectedEntity,
  onEntitySelect,
  onAssetSelect,
}: GeneratedAssetsPanelProps) {
  const [filters, setFilters] = useState<AssetFilters>({
    type: "all",
    chapter: "all",
    scene: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [projectData, setProjectData] = useState<MangaProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const getAssets = (): Asset[] => {
    if (!projectData || isLoading) return [];

    const assets: Asset[] = [];

    // Character images
    projectData.characters?.forEach((character) => {
      if (character.imgUrl) {
        assets.push({
          id: character._id,
          type: "character",
          name: character.name,
          url: character.imgUrl,
          timestamp:
            (character.updatedAt || character.createdAt)?.toISOString() ||
            new Date().toISOString(),
        });
      }
    });

    // Panel images with chapter and scene context
    projectData.chapters?.forEach((chapter) => {
      chapter.scenes?.forEach((scene) => {
        scene.panels?.forEach((panel) => {
          if (panel.imageUrl) {
            assets.push({
              id: panel._id,
              type: "panel",
              name: `Panel ${panel.order}`,
              url: panel.imageUrl,
              timestamp:
                (panel.updatedAt || panel.createdAt)?.toISOString() ||
                new Date().toISOString(),
              chapterId: chapter._id,
              chapterTitle: chapter.title,
              sceneId: scene._id,
              sceneTitle: scene.title || `Scene ${scene.order}`,
              panelOrder: panel.order,
            });
          }
        });
      });
    });

    // Scene images if any (scenes don't have imageUrl property by default, but we'll keep this for future extensibility)
    projectData.chapters?.forEach((chapter) => {
      chapter.scenes?.forEach((scene) => {
        // @ts-ignore - Scene might have imageUrl in the future
        if (scene.imageUrl) {
          assets.push({
            id: scene._id,
            type: "scene",
            name: scene.title || `Scene ${scene.order}`,
            // @ts-ignore - Scene might have imageUrl in the future
            url: scene.imageUrl,
            timestamp:
              (scene.updatedAt || scene.createdAt)?.toISOString() ||
              new Date().toISOString(),
            chapterId: chapter._id,
            chapterTitle: chapter.title,
            sceneId: scene._id,
            sceneTitle: scene.title || `Scene ${scene.order}`,
          });
        }
      });
    });

    return assets.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const allAssets = getAssets();

  // Get unique chapters and scenes for filter dropdowns
  const availableChapters = useMemo(() => {
    const chapters = new Map();
    allAssets.forEach((asset) => {
      if (asset.chapterId && asset.chapterTitle) {
        chapters.set(asset.chapterId, asset.chapterTitle);
      }
    });
    return Array.from(chapters.entries()).map(([id, title]) => ({ id, title }));
  }, [allAssets]);

  const availableScenes = useMemo(() => {
    const scenes = new Map();
    allAssets
      .filter(
        (asset) =>
          !filters.chapter ||
          filters.chapter === "all" ||
          asset.chapterId === filters.chapter
      )
      .forEach((asset) => {
        if (asset.sceneId && asset.sceneTitle) {
          scenes.set(asset.sceneId, asset.sceneTitle);
        }
      });
    return Array.from(scenes.entries()).map(([id, title]) => ({ id, title }));
  }, [allAssets, filters.chapter]);

  // Filter assets based on current filters
  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      // Type filter
      if (filters.type !== "all" && asset.type !== filters.type) {
        return false;
      }

      // Chapter filter
      if (filters.chapter !== "all" && asset.chapterId !== filters.chapter) {
        return false;
      }

      // Scene filter
      if (filters.scene !== "all" && asset.sceneId !== filters.scene) {
        return false;
      }

      // Search filter
      if (
        filters.search &&
        !asset.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [allAssets, filters]);

  const clearFilters = () => {
    setFilters({
      type: "all",
      chapter: "all",
      scene: "all",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.chapter !== "all" ||
    filters.scene !== "all" ||
    filters.search !== "";

  const handleAssetClick = (asset: Asset) => {
    onAssetSelect?.(asset);
    onAssetAction?.(asset.id, "view");
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header with filters */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Generated Assets</h3>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs border-gray-600 text-gray-300"
            >
              {filteredAssets.length} of {allAssets.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
            {/* Search */}
            <div>
              <Input
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Type Filter */}
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="character">Characters</SelectItem>
                  <SelectItem value="panel">Panels</SelectItem>
                  <SelectItem value="scene">Scenes</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Chapter Filter */}
              <Select
                value={filters.chapter}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    chapter: value,
                    scene: "all",
                  }))
                }
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white text-xs">
                  <SelectValue placeholder="Chapter" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Chapters</SelectItem>
                  {availableChapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Scene Filter */}
              <Select
                value={filters.scene}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, scene: value }))
                }
                disabled={filters.chapter === "all"}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white text-xs">
                  <SelectValue placeholder="Scene" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Scenes</SelectItem>
                  {availableScenes.map((scene) => (
                    <SelectItem key={scene.id} value={scene.id}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="p-4 pb-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Image className="w-6 h-6 text-gray-400 animate-pulse" />
                </div>
                <p className="text-sm text-gray-400">Loading assets...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {allAssets.length === 0
                    ? "No assets generated yet"
                    : "No assets match your filters"}
                </p>
                <p className="text-xs text-gray-500">
                  {allAssets.length === 0
                    ? "Start creating content through the AI chat!"
                    : "Try adjusting your filter settings"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/30"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <div className="aspect-square bg-gray-700/30 relative group">
                      {asset.url ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-500" />
                        </div>
                      )}

                      {/* Asset Type Badge */}
                      <Badge
                        className={`absolute top-2 left-2 text-xs font-medium ${
                          asset.type === "character"
                            ? "bg-blue-500/80 text-white"
                            : asset.type === "panel"
                            ? "bg-purple-500/80 text-white"
                            : asset.type === "scene"
                            ? "bg-green-500/80 text-white"
                            : "bg-gray-500/80 text-white"
                        }`}
                      >
                        {asset.type}
                      </Badge>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-gray-900 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssetClick(asset);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {asset.url && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 text-gray-900 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement("a");
                              link.href = asset.url;
                              link.download = `${asset.name}.png`;
                              link.click();
                            }}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="font-medium text-sm text-white truncate mb-1">
                        {asset.name}
                      </h4>
                      {asset.chapterTitle && (
                        <p className="text-xs text-gray-400 truncate mb-1">
                          {asset.chapterTitle}
                          {asset.sceneTitle && ` • ${asset.sceneTitle}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(asset.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
