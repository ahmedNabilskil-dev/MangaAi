"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Layers,
  Tag,
  User,
  X,
} from "lucide-react";

// ============================================================================
// ASSET DETAIL PANEL
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

interface AssetDetailPanelProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSource?: (type: string, id: string) => void;
}

export default function AssetDetailPanel({
  asset,
  isOpen,
  onClose,
  onNavigateToSource,
}: AssetDetailPanelProps) {
  if (!asset) return null;

  const getAssetIcon = () => {
    switch (asset.type) {
      case "character":
        return User;
      case "panel":
        return Eye;
      case "scene":
        return Layers;
      default:
        return ImageIcon;
    }
  };

  const getAssetColor = () => {
    switch (asset.type) {
      case "character":
        return "from-blue-500 to-indigo-600";
      case "panel":
        return "from-purple-500 to-violet-600";
      case "scene":
        return "from-green-500 to-emerald-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  const handleDownload = () => {
    if (asset.url) {
      const link = document.createElement("a");
      link.href = asset.url;
      link.download = `${asset.name}.png`;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (asset.url) {
      window.open(asset.url, "_blank");
    }
  };

  const Icon = getAssetIcon();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAssetColor()} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Asset Details
                    </h2>
                    <Badge
                      className={`text-xs font-medium capitalize ${
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
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenInNewTab}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="p-6 space-y-6 pb-8">
                  {/* Image Preview */}
                  <Card className="border-gray-700/50 bg-gray-800/30">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-700/30 rounded-lg overflow-hidden mb-3">
                        {asset.url ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-white text-center">
                        {asset.name}
                      </h3>
                    </CardContent>
                  </Card>

                  {/* Asset Information */}
                  <Card className="border-gray-700/50 bg-gray-800/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-white text-base">
                        <Tag className="w-4 h-4" />
                        Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Created</span>
                        <span className="text-sm text-white ml-auto">
                          {new Date(asset.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Type</span>
                        <span className="text-sm text-white ml-auto capitalize">
                          {asset.type}
                        </span>
                      </div>

                      {asset.type === "panel" && asset.panelOrder && (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            Panel Order
                          </span>
                          <span className="text-sm text-white ml-auto">
                            #{asset.panelOrder}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Context Information */}
                  {(asset.chapterTitle || asset.sceneTitle) && (
                    <Card className="border-gray-700/50 bg-gray-800/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-base">
                          <BookOpen className="w-4 h-4" />
                          Context
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {asset.chapterTitle && (
                          <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-green-300">
                                Chapter
                              </span>
                            </div>
                            <p className="text-sm text-white">
                              {asset.chapterTitle}
                            </p>
                            {onNavigateToSource && asset.chapterId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  onNavigateToSource(
                                    "chapter",
                                    asset.chapterId!
                                  )
                                }
                                className="mt-2 text-green-400 hover:text-green-300 hover:bg-green-900/30 text-xs"
                              >
                                Navigate to Chapter
                              </Button>
                            )}
                          </div>
                        )}

                        {asset.sceneTitle && (
                          <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Layers className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-yellow-300">
                                Scene
                              </span>
                            </div>
                            <p className="text-sm text-white">
                              {asset.sceneTitle}
                            </p>
                            {onNavigateToSource && asset.sceneId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  onNavigateToSource("scene", asset.sceneId!)
                                }
                                className="mt-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 text-xs"
                              >
                                Navigate to Scene
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Technical Details */}
                  <Card className="border-gray-700/50 bg-gray-800/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-white text-base">
                        <ImageIcon className="w-4 h-4" />
                        Technical Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">Format</span>
                        <span className="text-sm text-white ml-auto">
                          {asset.url?.split(".").pop()?.toUpperCase() ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">ID</span>
                        <span className="text-xs text-white ml-auto font-mono">
                          {asset.id}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
