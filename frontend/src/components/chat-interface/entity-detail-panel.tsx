"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Chapter,
  Character,
  LocationTemplate,
  MangaProject,
  OutfitTemplate,
  Panel,
  Scene,
} from "@/types/entities";
import { AnimatePresence, motion } from "framer-motion";
import {
  Book,
  Brush,
  Copy,
  Edit,
  Eye,
  FileText,
  Heart,
  Layers,
  MapPin,
  Palette,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DetailableEntity =
  | Character
  | Chapter
  | Scene
  | Panel
  | MangaProject
  | OutfitTemplate
  | LocationTemplate;

export interface EntityDetailPanelProps {
  entity: DetailableEntity | null;
  entityType:
    | "character"
    | "chapter"
    | "scene"
    | "panel"
    | "project"
    | "outfit"
    | "location"
    | "pose"
    | "effect"
    | null;
  projectData?: MangaProject | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (entity: DetailableEntity) => void;
  onDelete?: (entity: DetailableEntity) => void;
  onDuplicate?: (entity: DetailableEntity) => void;
  mode?: "modal" | "side-panel"; // New prop to control display mode
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getEntityConfig = (type: string) => {
  const configs = {
    character: {
      icon: User,
      color: "from-blue-500 to-indigo-600",
      bgColor:
        "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
      name: "Character",
    },
    chapter: {
      icon: Book,
      color: "from-green-500 to-emerald-600",
      bgColor:
        "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-700 dark:text-green-300",
      name: "Chapter",
    },
    scene: {
      icon: Layers,
      color: "from-orange-500 to-amber-600",
      bgColor:
        "from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-700 dark:text-orange-300",
      name: "Scene",
    },
    panel: {
      icon: Eye,
      color: "from-cyan-500 to-blue-600",
      bgColor:
        "from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800",
      textColor: "text-cyan-700 dark:text-cyan-300",
      name: "Panel",
    },
    project: {
      icon: FileText,
      color: "from-purple-500 to-violet-600",
      bgColor:
        "from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-700 dark:text-purple-300",
      name: "Project",
    },
    outfit: {
      icon: Palette,
      color: "from-pink-500 to-rose-600",
      bgColor:
        "from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20",
      borderColor: "border-pink-200 dark:border-pink-800",
      textColor: "text-pink-700 dark:text-pink-300",
      name: "Outfit",
    },
    location: {
      icon: MapPin,
      color: "from-yellow-500 to-orange-600",
      bgColor:
        "from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-700 dark:text-yellow-300",
      name: "Location",
    },
  };

  return configs[type as keyof typeof configs] || configs.character;
};

const getEntityName = (
  entity: DetailableEntity,
  entityType: string
): string => {
  switch (entityType) {
    case "chapter":
      return (entity as Chapter).title;
    case "character":
      return (entity as Character).name;
    case "scene":
      return (entity as Scene).title || `Scene ${(entity as Scene).order}`;
    case "panel":
      return `Panel ${(entity as Panel).order}`;
    case "project":
      return (entity as MangaProject).title;
    case "outfit":
    case "location":
      return (entity as any).name || "Unnamed";
    default:
      return (entity as any).name || "Unnamed";
  }
};

const formatDate = (date?: Date | string) => {
  if (!date) return "Not available";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================================
// COMPACT VIEWS FOR SIDE PANEL
// ============================================================================

function CompactCharacterView({ character }: { character: Character }) {
  const config = getEntityConfig("character");

  return (
    <div className="space-y-3">
      {/* Character Header - More Compact */}
      <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex-shrink-0">
          {character.imgUrl ? (
            <img
              src={character.imgUrl}
              alt={character.name}
              className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}
            >
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {character.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
              {character.role || "Character"}
            </Badge>
            {character.age && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                {character.age}y
              </Badge>
            )}
            {character.gender && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                {character.gender}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Brief Description */}
      {character.briefDescription && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {character.briefDescription}
          </p>
        </div>
      )}

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {character.traits?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Traits</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-200 dark:border-purple-800 text-center">
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {character.arcs?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Arcs</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800 text-center">
          <div className="text-sm font-bold text-green-600 dark:text-green-400">
            {character.distinctiveFeatures?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Features
          </div>
        </div>
      </div>

      {/* Physical Details - Comprehensive */}
      {(character.bodyAttributes ||
        character.facialAttributes ||
        character.hairAttributes) && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <User className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Physical Appearance
            </h4>
          </div>
          <div className="space-y-1">
            {character.bodyAttributes && (
              <>
                {character.bodyAttributes.height && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Height:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.bodyAttributes.height}
                    </span>
                  </div>
                )}
                {character.bodyAttributes.bodyType && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Body:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.bodyAttributes.bodyType}
                    </span>
                  </div>
                )}
                {character.bodyAttributes.proportions && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Build:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.bodyAttributes.proportions}
                    </span>
                  </div>
                )}
              </>
            )}
            {character.hairAttributes && (
              <>
                {character.hairAttributes.hairColor && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Hair:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.hairAttributes.hairColor}{" "}
                      {character.hairAttributes.hairstyle}
                    </span>
                  </div>
                )}
                {character.hairAttributes.hairLength && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Length:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.hairAttributes.hairLength}
                    </span>
                  </div>
                )}
              </>
            )}
            {character.facialAttributes && (
              <>
                {character.facialAttributes.eyeColor && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Eyes:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.facialAttributes.eyeColor}
                    </span>
                  </div>
                )}
                {character.facialAttributes.skinTone && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Skin:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.facialAttributes.skinTone}
                    </span>
                  </div>
                )}
                {character.facialAttributes.faceShape && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Face:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {character.facialAttributes.faceShape}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Personality */}
      {character.personality && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3 h-3 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Personality
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
            {character.personality}
          </p>
        </div>
      )}

      {/* Abilities */}
      {character.abilities && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Abilities
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {character.abilities}
          </p>
        </div>
      )}

      {/* Traits - Compact Display */}
      {character.traits && character.traits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Character Traits
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {character.traits.slice(0, 8).map((trait, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              >
                {trait}
              </Badge>
            ))}
            {character.traits.length > 8 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{character.traits.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Distinctive Features */}
      {character.distinctiveFeatures &&
        character.distinctiveFeatures.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-pink-600 dark:text-pink-400" />
              <h4 className="font-medium text-xs text-gray-900 dark:text-white">
                Distinctive Features
              </h4>
            </div>
            <div className="space-y-1">
              {character.distinctiveFeatures
                .slice(0, 4)
                .map((feature, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    • {feature}
                  </div>
                ))}
              {character.distinctiveFeatures.length > 4 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{character.distinctiveFeatures.length - 4} more features
                </div>
              )}
            </div>
          </div>
        )}

      {/* Physical Mannerisms */}
      {character.physicalMannerisms &&
        character.physicalMannerisms.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <h4 className="font-medium text-xs text-gray-900 dark:text-white">
                Mannerisms
              </h4>
            </div>
            <div className="space-y-1">
              {character.physicalMannerisms
                .slice(0, 3)
                .map((mannerism, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    • {mannerism}
                  </div>
                ))}
              {character.physicalMannerisms.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{character.physicalMannerisms.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

      {/* Backstory */}
      {character.backstory && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Book className="w-3 h-3 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Backstory
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5">
            {character.backstory}
          </p>
        </div>
      )}

      {/* Style Guide */}
      {character.styleGuide && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Palette className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Art Style
            </h4>
          </div>
          <div className="space-y-1">
            {character.styleGuide.artStyle && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Style:</span>
                <span className="text-gray-900 dark:text-white">
                  {character.styleGuide.artStyle}
                </span>
              </div>
            )}
            {character.styleGuide.lineweight && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Lines:</span>
                <span className="text-gray-900 dark:text-white">
                  {character.styleGuide.lineweight}
                </span>
              </div>
            )}
            {character.styleGuide.colorStyle && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Colors:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {character.styleGuide.colorStyle}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              AI Generated:
            </span>
            <span className="text-gray-900 dark:text-white">
              {character.isAiGenerated ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(character.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(character.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactProjectView({ project }: { project: MangaProject }) {
  const config = getEntityConfig("project");

  return (
    <div className="space-y-3">
      {/* Project Header - Compact */}
      <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex-shrink-0">
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-12 h-16 rounded object-cover border border-white shadow-sm"
            />
          ) : (
            <div
              className={`w-12 h-16 rounded bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}
            >
              <FileText className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {project.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <Badge
              variant={project.published ? "default" : "secondary"}
              className="text-xs px-1.5 py-0.5 h-5"
            >
              {project.published ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
              {project.status}
            </Badge>
            {project.genre && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                {project.genre}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
            {project.description}
          </p>
        </div>
      )}

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-200 dark:border-purple-800 text-center">
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {project.chapters?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Chapters
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {project.characters?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Characters
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800 text-center">
          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {project.viewCount || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800 text-center">
          <div className="text-sm font-bold text-red-600 dark:text-red-400">
            {project.likeCount || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 mb-2">
          <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          <h4 className="font-medium text-xs text-gray-900 dark:text-white">
            Project Details
          </h4>
        </div>
        <div className="space-y-1">
          {project.artStyle && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Art Style:
              </span>
              <span className="text-gray-900 dark:text-white">
                {project.artStyle}
              </span>
            </div>
          )}
          {project.targetAudience && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Audience:
              </span>
              <span className="text-gray-900 dark:text-white capitalize">
                {project.targetAudience}
              </span>
            </div>
          )}
          {project.concept && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Concept:</span>
              <span className="text-gray-900 dark:text-white truncate">
                {project.concept.slice(0, 30)}...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* World Details */}
      {project.worldDetails && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              World Building
            </h4>
          </div>
          <div className="space-y-2">
            {project.worldDetails.summary && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {project.worldDetails.summary}
                </p>
              </div>
            )}
            {project.worldDetails.history && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  History
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {project.worldDetails.history}
                </p>
              </div>
            )}
            {project.worldDetails.society && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Society
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {project.worldDetails.society}
                </p>
              </div>
            )}
            {project.worldDetails.uniqueSystems && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unique Systems
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {project.worldDetails.uniqueSystems}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plot Structure */}
      {project.plotStructure && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Book className="w-3 h-3 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Plot Structure
            </h4>
          </div>
          <div className="space-y-1">
            {project.plotStructure.incitingIncident && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Inciting:
                </span>
                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
                  {project.plotStructure.incitingIncident}
                </span>
              </div>
            )}
            {project.plotStructure.plotTwist && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Twist:</span>
                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
                  {project.plotStructure.plotTwist}
                </span>
              </div>
            )}
            {project.plotStructure.climax && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Climax:
                </span>
                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
                  {project.plotStructure.climax}
                </span>
              </div>
            )}
            {project.plotStructure.resolution && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Resolution:
                </span>
                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
                  {project.plotStructure.resolution}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Count */}
      {(project.outfitTemplates?.length ||
        project.locationTemplates?.length) && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Palette className="w-3 h-3 text-pink-600 dark:text-pink-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Templates
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-1.5 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-200 dark:border-pink-800">
              <div className="text-sm font-bold text-pink-600 dark:text-pink-400">
                {project.outfitTemplates?.length || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Outfits
              </div>
            </div>
            <div className="text-center p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {project.locationTemplates?.length || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Locations
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Themes, Motifs & Symbols */}
      {(project.themes?.length ||
        project.motifs?.length ||
        project.symbols?.length) && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Literary Elements
            </h4>
          </div>
          <div className="space-y-2">
            {project.themes && project.themes.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Themes
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.themes.slice(0, 4).map((theme, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20"
                    >
                      {theme}
                    </Badge>
                  ))}
                  {project.themes.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{project.themes.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
            {project.motifs && project.motifs.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motifs
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.motifs.slice(0, 4).map((motif, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20"
                    >
                      {motif}
                    </Badge>
                  ))}
                  {project.motifs.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{project.motifs.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
            {project.symbols && project.symbols.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbols
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.symbols.slice(0, 4).map((symbol, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20"
                    >
                      {symbol}
                    </Badge>
                  ))}
                  {project.symbols.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{project.symbols.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial Prompt */}
      {project.initialPrompt && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Initial Prompt
            </h4>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
              {project.initialPrompt}
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-xs text-gray-900 dark:text-white">
              Tags
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 8).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              >
                #{tag}
              </Badge>
            ))}
            {project.tags.length > 8 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{project.tags.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Meta Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Creator:</span>
            <span className="text-gray-900 dark:text-white">
              {project.creatorId || "Unknown"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(project.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactTemplateView({
  template,
  type,
}: {
  template: OutfitTemplate | LocationTemplate;
  type: string;
}) {
  const config = getEntityConfig(type);
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Template Header */}
      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
        <div className="flex-shrink-0">
          {template.imageUrl ? (
            <img
              src={template.imageUrl}
              alt={template.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
            {template.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {template.category}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {type}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>

      {/* Template Details */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
            Details
          </h4>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Category:</span>
            <span className="text-gray-900 dark:text-white capitalize">
              {template.category}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Tags:</span>
            <span className="text-gray-900 dark:text-white">
              {template.tags?.length || 0}
            </span>
          </div>
          {"season" in template && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Season:</span>
              <span className="text-gray-900 dark:text-white capitalize">
                {template.season}
              </span>
            </div>
          )}
          {"type" in template && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white capitalize">
                {template.type}
              </span>
            </div>
          )}
          {"isDefault" in template && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Default:</span>
              <span className="text-gray-900 dark:text-white">
                {template.isDefault ? "Yes" : "No"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Prompt */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
            AI Prompt
          </h4>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-200 dark:border-gray-700">
          <code className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed block max-h-32 overflow-y-auto">
            {"aiPrompt" in template
              ? template.aiPrompt
              : (template as LocationTemplate).basePrompt}
          </code>
        </div>
      </div>

      {/* Camera Angles (for locations) */}
      {"cameraAngles" in template &&
        template.cameraAngles &&
        template.cameraAngles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                Camera Angles
              </h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {template.cameraAngles.slice(0, 4).map((angle, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                >
                  {angle}
                </Badge>
              ))}
              {template.cameraAngles.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{template.cameraAngles.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Tags
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 6).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </Badge>
            ))}
            {template.tags.length > 6 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{template.tags.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Creation Date */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(template.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(template.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactChapterView({ chapter }: { chapter: Chapter }) {
  const config = getEntityConfig("chapter");

  return (
    <div className="space-y-4">
      {/* Chapter Header */}
      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex-shrink-0">
          {chapter.coverImageUrl ? (
            <img
              src={chapter.coverImageUrl}
              alt={chapter.title}
              className="w-16 h-20 rounded-lg object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={`w-16 h-20 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}
            >
              <Book className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
            Chapter {chapter.chapterNumber}: {chapter.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={chapter.isPublished ? "default" : "secondary"}
              className="text-xs"
            >
              {chapter.isPublished ? "Published" : "Draft"}
            </Badge>
            {chapter.tone && (
              <Badge variant="outline" className="text-xs capitalize">
                {chapter.tone}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {chapter.scenes?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Scenes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {chapter.viewCount || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
        </div>
      </div>

      {/* Narrative */}
      {chapter.narrative && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Narrative
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
            {chapter.narrative}
          </p>
        </div>
      )}

      {/* Purpose */}
      {chapter.purpose && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Purpose
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {chapter.purpose}
          </p>
        </div>
      )}

      {/* Key Characters */}
      {chapter.keyCharacters && chapter.keyCharacters.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Key Characters
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {chapter.keyCharacters.slice(0, 4).map((character, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              >
                {character}
              </Badge>
            ))}
            {chapter.keyCharacters.length > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{chapter.keyCharacters.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Creation Date */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(chapter.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(chapter.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactSceneView({ scene }: { scene: Scene }) {
  const config = getEntityConfig("scene");

  return (
    <div className="space-y-4">
      {/* Scene Header */}
      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
        <div className="flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}
          >
            <Layers className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
            {scene.title || `Scene ${scene.order}`}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              Order {scene.order}
            </Badge>
            {scene.isAiGenerated && (
              <Badge variant="outline" className="text-xs">
                AI Generated
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {scene.description}
          </p>
        </div>
      </div>

      {/* Scene Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {scene.panels?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Panels</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {scene.sceneContext.presentCharacters?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Characters
          </div>
        </div>
      </div>

      {/* Scene Context */}
      {scene.sceneContext && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Context
            </h4>
          </div>
          <div className="space-y-1">
            {scene.sceneContext.locationOverrides?.timeOfDay && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {scene.sceneContext.locationOverrides.timeOfDay}
                </span>
              </div>
            )}
            {scene.sceneContext.locationOverrides?.weather && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Weather:
                </span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {scene.sceneContext.locationOverrides.weather}
                </span>
              </div>
            )}
            {scene.sceneContext.environmentOverrides?.mood && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Mood:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {scene.sceneContext.environmentOverrides.mood}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Present Characters */}
      {scene.sceneContext.presentCharacters &&
        scene.sceneContext.presentCharacters.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                Characters
              </h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {scene.sceneContext.presentCharacters
                .slice(0, 4)
                .map((characterId, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  >
                    Character
                  </Badge>
                ))}
              {scene.sceneContext.presentCharacters.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{scene.sceneContext.presentCharacters.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

      {/* Scene Notes */}
      {scene.sceneContext.sceneNotes && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Notes
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {scene.sceneContext.sceneNotes}
          </p>
        </div>
      )}

      {/* Creation Date */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(scene.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(scene.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactPanelView({ panel }: { panel: Panel }) {
  const config = getEntityConfig("panel");

  return (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
        <div className="flex-shrink-0">
          {panel.imageUrl ? (
            <img
              src={panel.imageUrl}
              alt={`Panel ${panel.order}`}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}
            >
              <Eye className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            Panel {panel.order}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {panel.isAiGenerated && (
              <Badge variant="outline" className="text-xs">
                AI Generated
              </Badge>
            )}
            {panel.panelContext.cameraSettings?.angle && (
              <Badge variant="secondary" className="text-xs capitalize">
                {panel.panelContext.cameraSettings.angle}
              </Badge>
            )}
          </div>
          {panel.panelContext.action && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {panel.panelContext.action}
            </p>
          )}
        </div>
      </div>

      {/* Panel Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
            {panel.panelContext.characterPoses?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Characters
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {panel.dialogues?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Dialogues
          </div>
        </div>
      </div>

      {/* Camera Settings */}
      {panel.panelContext.cameraSettings && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Camera
            </h4>
          </div>
          <div className="space-y-1">
            {panel.panelContext.cameraSettings.angle && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Angle:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {panel.panelContext.cameraSettings.angle}
                </span>
              </div>
            )}
            {panel.panelContext.cameraSettings.shotType && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Shot:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {panel.panelContext.cameraSettings.shotType}
                </span>
              </div>
            )}
            {panel.panelContext.cameraSettings.focus && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Focus:</span>
                <span className="text-gray-900 dark:text-white">
                  {panel.panelContext.cameraSettings.focus}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Character Poses */}
      {panel.panelContext.characterPoses &&
        panel.panelContext.characterPoses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                Character Poses
              </h4>
            </div>
            <div className="space-y-2">
              {panel.panelContext.characterPoses
                .slice(0, 3)
                .map((pose, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pose.characterName}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {pose.expression}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {pose.pose}
                    </p>
                  </div>
                ))}
              {panel.panelContext.characterPoses.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{panel.panelContext.characterPoses.length - 3} more
                  characters
                </span>
              )}
            </div>
          </div>
        )}

      {/* Environment */}
      {panel.panelContext.environmentOverrides && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Environment
            </h4>
          </div>
          <div className="space-y-1">
            {panel.panelContext.environmentOverrides.timeOfDay && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {panel.panelContext.environmentOverrides.timeOfDay}
                </span>
              </div>
            )}
            {panel.panelContext.environmentOverrides.weather && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Weather:
                </span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {panel.panelContext.environmentOverrides.weather}
                </span>
              </div>
            )}
            {panel.panelContext.environmentOverrides.atmosphere && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Mood:</span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {panel.panelContext.environmentOverrides.atmosphere}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Effects */}
      {panel.panelContext.visualEffects &&
        panel.panelContext.visualEffects.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                Effects
              </h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {panel.panelContext.visualEffects
                .slice(0, 4)
                .map((effect, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  >
                    {effect}
                  </Badge>
                ))}
              {panel.panelContext.visualEffects.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{panel.panelContext.visualEffects.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

      {/* Panel Notes */}
      {panel.panelContext.panelNotes && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Notes
            </h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {panel.panelContext.panelNotes}
          </p>
        </div>
      )}

      {/* Creation Date */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(panel.createdAt)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(panel.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactGenericView({
  entity,
  entityType,
}: {
  entity: DetailableEntity;
  entityType: string;
}) {
  const config = getEntityConfig(entityType);
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      {/* Generic Header - Compact */}
      <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {getEntityName(entity, entityType)}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 h-5 capitalize"
            >
              {config.name}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} details
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-xs text-gray-900 dark:text-white">
            Information
          </h4>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Type:</span>
            <span className="text-gray-900 dark:text-white capitalize">
              {entityType}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Name:</span>
            <span className="text-gray-900 dark:text-white">
              {getEntityName(entity, entityType)}
            </span>
          </div>
          {entity.createdAt && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(entity.createdAt)}
              </span>
            </div>
          )}
          {entity.updatedAt && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Updated:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(entity.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DETAIL COMPONENTS
// ============================================================================

function CharacterDetailView({ character }: { character: Character }) {
  const config = getEntityConfig("character");

  return (
    <div className="space-y-6">
      {/* Character Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.bgColor} p-8 ${config.borderColor} border-2`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-start gap-6">
            {/* Character Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              {character.imgUrl ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl">
                  <img
                    src={character.imgUrl}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center ring-4 ring-white/50 shadow-xl`}
                >
                  <User className="w-10 h-10 text-white" />
                </div>
              )}

              {/* Upload Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {/* Character Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {character.name}
                </h1>
                <Badge
                  className={`${config.textColor} bg-white/70 border-white/50`}
                >
                  {character.role || "Character"}
                </Badge>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 leading-relaxed">
                {character.briefDescription || "No description available"}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {character.age || "?"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Age
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {character.traits?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Traits
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {character.arcs?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Arcs
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {character.outfitHistory?.length || 1}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Outfits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Physical Appearance */}
      {(character.bodyAttributes ||
        character.facialAttributes ||
        character.hairAttributes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6" />
                Physical Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Body Attributes */}
              {character.bodyAttributes && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Body Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Height
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {character.bodyAttributes.height}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Body Type
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {character.bodyAttributes.bodyType}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Proportions
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {character.bodyAttributes.proportions || "Standard"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Facial Features */}
              {character.facialAttributes && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                    <Brush className="w-5 h-5" />
                    Facial Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(character.facialAttributes).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800"
                        >
                          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Hair Attributes */}
              {character.hairAttributes && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Hair Style
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(character.hairAttributes).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Personality & Background */}
      {(character.personality || character.backstory) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                Character Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {character.personality && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-bold text-lg text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Personality
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {character.personality}
                  </p>
                </div>
              )}

              {character.backstory && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-bold text-lg text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Backstory
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {character.backstory}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Traits & Features */}
      {(character.traits?.length || character.distinctiveFeatures?.length) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <Star className="w-6 h-6" />
                Special Features & Traits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {character.traits && character.traits.length > 0 && (
                <div>
                  <h4 className="font-bold text-lg text-purple-800 dark:text-purple-200 mb-3">
                    Character Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-1"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {character.distinctiveFeatures &&
                character.distinctiveFeatures.length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg text-pink-800 dark:text-pink-200 mb-3">
                      Distinctive Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {character.distinctiveFeatures.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 px-3 py-1"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function ProjectDetailView({ project }: { project: MangaProject }) {
  const config = getEntityConfig("project");

  return (
    <div className="space-y-6">
      {/* Project Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.bgColor} p-8 ${config.borderColor} border-2`}
      >
        <div className="relative z-10">
          <div className="flex items-start gap-6">
            {/* Project Cover */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              {project.coverImageUrl ? (
                <div className="w-32 h-40 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl">
                  <img
                    src={project.coverImageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div
                  className={`w-32 h-40 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center ring-4 ring-white/50 shadow-xl`}
                >
                  <FileText className="w-12 h-12 text-white" />
                </div>
              )}
            </motion.div>

            {/* Project Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h1>
                <Badge
                  className={`${config.textColor} bg-white/70 border-white/50`}
                >
                  {project.status}
                </Badge>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 leading-relaxed">
                {project.description || "No description available"}
              </p>

              {/* Project Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {project.chapters?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Chapters
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {project.characters?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Characters
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {project.viewCount || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Views
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {project.likeCount || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Likes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10 overflow-hidden h-full">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Genre:
                  </span>
                  <Badge variant="secondary">
                    {project.genre || "Not set"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Art Style:
                  </span>
                  <Badge variant="outline">
                    {project.artStyle || "Default"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Target Audience:
                  </span>
                  <Badge variant="secondary">
                    {project.targetAudience || "General"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <Badge variant={project.published ? "default" : "secondary"}>
                    {project.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Updated:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* World Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/10 overflow-hidden h-full">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                World Building
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {project.worldDetails ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                      Summary
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {project.worldDetails.summary}
                    </p>
                  </div>
                  {project.worldDetails.society && (
                    <div>
                      <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                        Society
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {project.worldDetails.society}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No world details available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-700 text-white">
              <CardTitle className="flex items-center gap-3">
                <Tag className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function TemplateDetailView({
  template,
  type,
}: {
  template: OutfitTemplate | LocationTemplate;
  type: string;
}) {
  const config = getEntityConfig(type);
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Template Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.bgColor} p-8 ${config.borderColor} border-2`}
      >
        <div className="relative z-10">
          <div className="flex items-start gap-6">
            {/* Template Icon/Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
            >
              {template.imageUrl ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center ring-4 ring-white/50 shadow-xl`}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>
              )}
            </motion.div>

            {/* Template Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {template.name}
                </h1>
                <Badge
                  className={`${config.textColor} bg-white/70 border-white/50 capitalize`}
                >
                  {template.category}
                </Badge>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 leading-relaxed">
                {template.description}
              </p>

              {/* Template Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {template.category}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Category
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {template.tags?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Tags
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {formatDate(template.createdAt)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Created
                  </div>
                </div>
                <div className="text-center bg-white/60 dark:bg-white/10 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {"isDefault" in template
                      ? template.isDefault
                        ? "Yes"
                        : "No"
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Default
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={`${config.borderColor} bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/10 overflow-hidden`}
        >
          <CardHeader className={`bg-gradient-to-r ${config.color} text-white`}>
            <CardTitle className="flex items-center gap-3">
              <Zap className="w-5 h-5" />
              AI Generation Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <code className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {"aiPrompt" in template
                  ? template.aiPrompt
                  : (template as LocationTemplate).basePrompt}
              </code>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-700 text-white">
              <CardTitle className="flex items-center gap-3">
                <Tag className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function GenericDetailView({
  entity,
  entityType,
}: {
  entity: DetailableEntity;
  entityType: string;
}) {
  const config = getEntityConfig(entityType);
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Generic Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.bgColor} p-8 ${config.borderColor} border-2`}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-6">
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center ring-4 ring-white/50 shadow-xl`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {getEntityName(entity, entityType)}
                </h1>
                <Badge
                  className={`${config.textColor} bg-white/70 border-white/50 capitalize`}
                >
                  {config.name}
                </Badge>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {entityType.charAt(0).toUpperCase() + entityType.slice(1)}{" "}
                details
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={`${config.borderColor} bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/10 overflow-hidden`}
        >
          <CardHeader className={`bg-gradient-to-r ${config.color} text-white`}>
            <CardTitle className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              {config.name} Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Type:
                </span>
                <Badge variant="secondary" className="capitalize">
                  {entityType}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Name:
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {getEntityName(entity, entityType)}
                </span>
              </div>
              {entity.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(entity.createdAt)}
                  </span>
                </div>
              )}
              {entity.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Updated:
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(entity.updatedAt)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EntityDetailPanel({
  entity,
  entityType,
  projectData,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  mode = "modal", // Default to modal mode
}: EntityDetailPanelProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!entity || !entityType) return null;

  const config = getEntityConfig(entityType);
  const entityName = getEntityName(entity, entityType);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(entity, null, 2));
    toast({
      title: "Copied",
      description: `${config.name} data copied to clipboard`,
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(entity);
      onClose();
      toast({
        title: "Deleted",
        description: `${config.name} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entity",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDetailContent = () => {
    switch (entityType) {
      case "character":
        return <CharacterDetailView character={entity as Character} />;
      case "project":
        return <ProjectDetailView project={entity as MangaProject} />;
      case "outfit":
      case "location":
        return (
          <TemplateDetailView
            template={entity as OutfitTemplate | LocationTemplate}
            type={entityType}
          />
        );
      default:
        return <GenericDetailView entity={entity} entityType={entityType} />;
    }
  };

  const renderSidePanelContent = () => {
    switch (entityType) {
      case "character":
        return <CompactCharacterView character={entity as Character} />;
      case "project":
        return <CompactProjectView project={entity as MangaProject} />;
      case "chapter":
        return <CompactChapterView chapter={entity as Chapter} />;
      case "scene":
        return <CompactSceneView scene={entity as Scene} />;
      case "panel":
        return <CompactPanelView panel={entity as Panel} />;
      case "outfit":
      case "location":
        return (
          <CompactTemplateView
            template={entity as OutfitTemplate | LocationTemplate}
            type={entityType}
          />
        );
      default:
        return <CompactGenericView entity={entity} entityType={entityType} />;
    }
  };

  // Side panel mode
  if (mode === "side-panel") {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[360px] bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Compact Header */}
            <div
              className={`bg-gradient-to-r ${config.color} text-white p-4 flex-shrink-0`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold truncate">{entityName}</h2>
                    <p className="text-white/80 capitalize text-xs">
                      {config.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 h-8 w-8 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entity)}
                    className="text-white hover:bg-white/20 h-7 px-2 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-white hover:bg-white/20 h-7 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(entity)}
                    className="text-white hover:bg-white/20 h-7 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-white hover:bg-red-500/20 hover:text-red-200 h-7 px-2 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Compact Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderSidePanelContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Modal mode (default)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.color} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <config.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{entityName}</h2>
                    <p className="text-white/80 capitalize">
                      {config.name} Details
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(entity)}
                      className="text-white hover:bg-white/20"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="text-white hover:bg-white/20"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                  {onDuplicate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(entity)}
                      className="text-white hover:bg-white/20"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-white hover:bg-red-500/20 hover:text-red-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {renderDetailContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
