"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProjectWithRelations } from "@/services/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Image } from "lucide-react";

// ============================================================================
// GENERATED ASSETS PANEL
// ============================================================================

interface GeneratedAssetsPanelProps {
  projectId: string;
  onAssetAction?: (assetId: string, action: string) => void;
  onComponentSelect?: (componentId: string, type: string) => void;
  selectedEntity?: { id: string; type: string } | null;
  onEntitySelect?: (entity: { id: string; type: string } | null) => void;
}

export function GeneratedAssetsPanel({
  projectId,
  onAssetAction,
  onComponentSelect,
  selectedEntity,
  onEntitySelect,
}: GeneratedAssetsPanelProps) {
  const projectData = useLiveQuery(async () => {
    try {
      return await getProjectWithRelations(projectId);
    } catch (error) {
      console.error("Failed to load project:", error);
      return null;
    }
  }, [projectId]);

  const getAssets = () => {
    if (!projectData) return [];

    const assets: any[] = [];

    // Character images
    projectData.characters?.forEach((character) => {
      if (character.imgUrl) {
        assets.push({
          id: character.id,
          type: "character",
          name: character.name,
          url: character.imgUrl,
          timestamp: character.updatedAt || character.createdAt,
        });
      }
    });

    // Panel images
    projectData.chapters?.forEach((chapter) => {
      chapter.scenes?.forEach((scene) => {
        scene.panels?.forEach((panel) => {
          if (panel.imageUrl) {
            assets.push({
              id: panel.id,
              type: "panel",
              name: `${chapter.title} - Panel ${panel.order}`,
              url: panel.imageUrl,
              timestamp: panel.updatedAt || panel.createdAt,
            });
          }
        });
      });
    });

    return assets.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const assets = getAssets();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Generated Assets
          </h3>
          <Badge variant="outline" className="text-xs">
            {assets.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {assets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                No assets generated yet
              </p>
              <p className="text-xs text-gray-500">
                Start creating content through the AI chat!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {assets.map((asset) => (
                <Card
                  key={asset.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onAssetAction?.(asset.id, "view")}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                    {asset.url ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 left-2 text-xs"
                      variant={
                        asset.type === "character" ? "default" : "secondary"
                      }
                    >
                      {asset.type}
                    </Badge>
                  </div>
                  <div className="p-2">
                    <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(asset.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
