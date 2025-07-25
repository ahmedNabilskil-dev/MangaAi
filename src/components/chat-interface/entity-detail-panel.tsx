"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chapter,
  Character,
  LocationTemplate,
  MangaProject,
  OutfitTemplate,
  Panel,
  Scene,
} from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Book,
  Brush,
  Calendar,
  Clock,
  Copy,
  Edit,
  Eye,
  FileText,
  Heart,
  Layers,
  MapPin,
  MessageSquare,
  Palette,
  Share,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
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
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Reference resolution helpers
const getCharacterName = (
  characterId: string,
  projectData?: MangaProject | null
): string => {
  if (!projectData?.characters) return characterId;
  const character = projectData.characters.find((c) => c.id === characterId);
  return character?.name || characterId;
};

const getOutfitName = (
  outfitId: string,
  projectData?: MangaProject | null
): string => {
  if (!projectData?.outfitTemplates) return outfitId;
  const outfit = projectData.outfitTemplates.find((o) => o.id === outfitId);
  return outfit?.name || outfitId;
};

const getLocationName = (
  locationId: string,
  projectData?: MangaProject | null
): string => {
  if (!projectData?.locationTemplates) return locationId;
  const location = projectData.locationTemplates.find(
    (l) => l.id === locationId
  );
  return location?.name || locationId;
};

const getEntityIcon = (type: string) => {
  switch (type) {
    case "character":
      return User;
    case "chapter":
      return Book;
    case "scene":
      return Layers;
    case "panel":
      return Eye;
    case "project":
      return FileText;
    case "outfit":
      return Palette;
    case "location":
      return MapPin;
    case "pose":
      return Layers;
    case "effect":
      return Sparkles;
    default:
      return FileText;
  }
};

const getEntityColor = (type: string) => {
  switch (type) {
    case "character":
      return "from-blue-500 to-indigo-600";
    case "chapter":
      return "from-green-500 to-emerald-600";
    case "scene":
      return "from-orange-500 to-amber-600";
    case "panel":
      return "from-cyan-500 to-blue-600";
    case "project":
      return "from-purple-500 to-violet-600";
    case "outfit":
      return "from-pink-500 to-rose-600";
    case "location":
      return "from-yellow-500 to-orange-600";
    case "pose":
      return "from-indigo-500 to-purple-600";
    case "effect":
      return "from-red-500 to-pink-600";
    default:
      return "from-gray-500 to-slate-600";
  }
};

const getEntityAccentColor = (type: string) => {
  switch (type) {
    case "character":
      return "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20";
    case "chapter":
      return "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20";
    case "scene":
      return "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20";
    case "panel":
      return "border-cyan-200 bg-cyan-50/50 dark:border-cyan-800 dark:bg-cyan-900/20";
    case "project":
      return "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20";
    case "outfit":
      return "border-pink-200 bg-pink-50/50 dark:border-pink-800 dark:bg-pink-900/20";
    case "location":
      return "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/20";
    case "pose":
      return "border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20";
    case "effect":
      return "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20";
    default:
      return "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20";
  }
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
    default:
      return (entity as any).name || "Unnamed";
  }
};

const formatDate = (date?: Date | string) => {
  if (!date) return "Not available";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ============================================================================
// DETAIL CONTENT COMPONENTS
// ============================================================================

function CharacterDetails({ character }: { character: Character }) {
  return (
    <div className="space-y-6">
      {/* Character Avatar & Quick Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border border-blue-200 dark:border-blue-800">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            {character.imgUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/50 shadow-lg">
                <img
                  src={character.imgUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center ring-4 ring-white/50 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {character.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/70 text-blue-700 border-blue-200"
                >
                  {character.role || "Character"}
                </Badge>
                {character.age && (
                  <Badge
                    variant="outline"
                    className="bg-white/50 border-blue-200"
                  >
                    {character.age} years old
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {character.traits?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Traits
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {character.arcs?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Story Arcs
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {character.outfitHistory?.length || 1}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Outfits
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
        </div>
      </div>

      {/* Physical Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              Physical Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Body Attributes */}
            {character.bodyAttributes && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Height
                  </label>
                  <p className="text-sm bg-white/60 dark:bg-gray-800/60 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    {character.bodyAttributes.height}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Body Type
                  </label>
                  <p className="text-sm bg-white/60 dark:bg-gray-800/60 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    {character.bodyAttributes.bodyType}
                  </p>
                </div>
              </div>
            )}

            {/* Facial Features Grid */}
            {character.facialAttributes && (
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Brush className="w-4 h-4" />
                  Facial Features
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(character.facialAttributes).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-blue-100 dark:border-blue-800"
                      >
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Hair Details */}
            {character.hairAttributes && (
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Hair Style
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(character.hairAttributes).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-blue-100 dark:border-blue-800"
                      >
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace("hair", "")
                            .trim()}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
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

      {/* Personality & Background */}
      {(character.personality ||
        character.backstory ||
        character.briefDescription) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                Character Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.briefDescription && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {character.briefDescription}
                  </p>
                </div>
              )}

              {character.personality && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    Personality
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {character.personality}
                  </p>
                </div>
              )}

              {character.backstory && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-xl border border-pink-200 dark:border-pink-800">
                  <h4 className="font-semibold text-pink-800 dark:text-pink-200 mb-2">
                    Backstory
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {character.backstory}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Distinctive Features & Traits */}
      {(character.distinctiveFeatures?.length || character.traits?.length) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                Special Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.distinctiveFeatures &&
                character.distinctiveFeatures.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                      Distinctive Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {character.distinctiveFeatures.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {character.traits && character.traits.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Character Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700"
                      >
                        {trait}
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

function TemplateDetails({
  template,
  type,
}: {
  template: OutfitTemplate | LocationTemplate;
  type: string;
}) {
  const getTypeIcon = () => {
    switch (type) {
      case "outfit":
        return Palette;
      case "location":
        return MapPin;
      default:
        return Zap;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "outfit":
        return "from-pink-500 to-rose-600";
      case "location":
        return "from-yellow-500 to-orange-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  const getTypeBg = () => {
    switch (type) {
      case "outfit":
        return "from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30";
      case "location":
        return "from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30";
      default:
        return "from-gray-50 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30";
    }
  };

  const Icon = getTypeIcon();

  return (
    <div className="space-y-6">
      {/* Template Header with Preview */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getTypeBg()} p-6 border border-opacity-20`}
      >
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor()} flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {template.description}
              </p>
            </div>
          </div>

          {/* Category & Status */}
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="secondary"
              className="bg-white/70 text-gray-700 border-gray-200 capitalize"
            >
              {template.category}
            </Badge>
            {template.subCategory && (
              <Badge
                variant="outline"
                className="bg-white/50 border-gray-200 capitalize"
              >
                {template.subCategory}
              </Badge>
            )}
            <Badge
              variant={template.isActive ? "default" : "secondary"}
              className={template.isActive ? "bg-green-500 text-white" : ""}
            >
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Template Preview Image */}
          {template.imageUrl && (
            <div className="rounded-xl overflow-hidden border-2 border-white/50 shadow-lg">
              <img
                src={template.imageUrl}
                alt={template.name}
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Outfit Components */}
      {type === "outfit" && "components" in template && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-white to-pink-50/30 dark:from-gray-900 dark:to-pink-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                Outfit Components ({template.components.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {template.components.map((component, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-pink-50/50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Badge
                          variant="secondary"
                          className="bg-pink-100 text-pink-800 border-pink-200 capitalize"
                        >
                          {component.type}
                        </Badge>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {component.item}
                        </h4>
                      </div>
                      <div className="text-right space-y-1">
                        {component.color && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                backgroundColor: component.color.toLowerCase(),
                              }}
                            ></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {component.color}
                            </span>
                          </div>
                        )}
                        {component.material && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <Brush className="w-3 h-3 inline mr-1" />
                            {component.material}
                          </div>
                        )}
                        {component.pattern && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {component.pattern}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Location Specific Details */}
      {type === "location" && "timeOfDay" in template && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-white to-yellow-50/30 dark:from-gray-900 dark:to-yellow-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    Time of Day
                  </label>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 border-yellow-200 text-yellow-800 capitalize"
                  >
                    {template.timeOfDay}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    Weather
                  </label>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 border-yellow-200 text-yellow-800 capitalize"
                  >
                    {template.weather}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    Mood
                  </label>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 border-yellow-200 text-yellow-800 capitalize"
                  >
                    {template.mood}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    Style
                  </label>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 border-yellow-200 text-yellow-800 capitalize"
                  >
                    {template.style}
                  </Badge>
                </div>
              </div>

              {/* Lighting Details */}
              {template.lighting && (
                <div className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Lighting Setup
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {template.lighting.type && (
                      <div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                          Type
                        </div>
                        <div className="text-sm font-medium">
                          {template.lighting.type}
                        </div>
                      </div>
                    )}
                    {template.lighting.intensity && (
                      <div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                          Intensity
                        </div>
                        <div className="text-sm font-medium">
                          {template.lighting.intensity}
                        </div>
                      </div>
                    )}
                    {template.lighting.color && (
                      <div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                          Color
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{
                              backgroundColor:
                                template.lighting.color.toLowerCase(),
                            }}
                          ></div>
                          <div className="text-sm font-medium">
                            {template.lighting.color}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Camera Angles */}
              {template.cameraAngles && template.cameraAngles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Camera Angles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.cameraAngles.map((angle, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700"
                      >
                        {angle.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Universal Tags */}
      {template.tags && template.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                Tags & Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

function ProjectDetails({ project }: { project: MangaProject }) {
  return (
    <div className="space-y-6">
      {/* Project Header with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 p-6 border border-purple-200 dark:border-purple-800">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            {project.coverImageUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-4 ring-white/50 shadow-lg">
                <img
                  src={project.coverImageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {project.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`font-medium capitalize ${
                    project.status === MangaStatus.DRAFT
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : project.status === MangaStatus.PUBLISHED
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  {project.status}
                </Badge>
                {project.published && (
                  <Badge
                    variant="outline"
                    className="bg-white/50 border-purple-200"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Published
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {project.chapters?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Chapters
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {project.characters?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Characters
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {project.viewCount || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Views
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description & Concept */}
            {project.description && (
              <div className="bg-gradient-to-r from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Description
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            {project.concept && (
              <div className="bg-gradient-to-r from-violet-50/50 to-indigo-50/50 dark:from-violet-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-violet-200 dark:border-violet-800">
                <h4 className="font-semibold text-violet-800 dark:text-violet-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Concept
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {project.concept}
                </p>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {project.genre && (
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                    Genre
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {project.genre}
                  </div>
                </div>
              )}
              {project.artStyle && (
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                    Art Style
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {project.artStyle}
                  </div>
                </div>
              )}
              {project.targetAudience && (
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                    Target Audience
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {project.targetAudience}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* World Details */}
      {project.worldDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white to-violet-50/30 dark:from-gray-900 dark:to-violet-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                World Building
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(project.worldDetails).map(
                ([key, value]) =>
                  value && (
                    <div
                      key={key}
                      className="bg-gradient-to-r from-violet-50/50 to-indigo-50/50 dark:from-violet-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-violet-200 dark:border-violet-800"
                    >
                      <h4 className="font-semibold text-violet-800 dark:text-violet-200 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {value}
                      </p>
                    </div>
                  )
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plot Structure */}
      {project.plotStructure && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Book className="w-4 h-4 text-white" />
                </div>
                Plot Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(project.plotStructure).map(
                ([key, value]) =>
                  value && (
                    <div
                      key={key}
                      className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800"
                    >
                      <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {value}
                      </p>
                    </div>
                  )
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Themes, Motifs, Symbols */}
      {(project.themes?.length ||
        project.motifs?.length ||
        project.symbols?.length) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                Narrative Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.themes && project.themes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Themes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.themes.map((theme, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.motifs && project.motifs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Motifs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.motifs.map((motif, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700"
                      >
                        {motif}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.symbols && project.symbols.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Symbols
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.symbols.map((symbol, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-700"
                      >
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Project Tags */}
      {project.tags && project.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                Project Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

function SceneDetails({
  scene,
  projectData,
}: {
  scene: Scene;
  projectData?: MangaProject | null;
}) {
  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white mb-1 truncate">
                {scene.title || `Scene ${scene.order}`}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/15 text-white border-white/20 text-xs">
                  #{scene.order}
                </Badge>
                <Badge
                  className={`text-xs ${
                    scene.isAiGenerated
                      ? "bg-purple-500/80 text-white"
                      : "bg-blue-500/80 text-white"
                  }`}
                >
                  {scene.isAiGenerated ? "AI" : "Manual"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Compact Stats - Single Column */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-white">
                {scene.panels?.length || 0}
              </div>
              <div className="text-white/70 text-xs">Panels</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-white">
                {scene.sceneContext?.presentCharacters?.length || 0}
              </div>
              <div className="text-white/70 text-xs">Characters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Description */}
      {scene.description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Description
            </h2>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {scene.description}
          </p>
        </motion.div>
      )}

      {/* Environment Details */}
      {scene.sceneContext && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Setting */}
          {scene.sceneContext.setting && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Setting
                </h3>
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-200 break-words">
                {scene.sceneContext.setting}
              </p>
            </div>
          )}

          {/* Environment Details Grid */}
          <div className="space-y-2">
            {scene.sceneContext.timeOfDay && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
                  Time of Day
                </div>
                <div className="text-sm font-semibold text-amber-900 dark:text-amber-100 capitalize">
                  {scene.sceneContext.timeOfDay}
                </div>
              </div>
            )}

            {scene.sceneContext.weather && (
              <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-3 border border-sky-200 dark:border-sky-800">
                <div className="text-xs font-medium text-sky-600 dark:text-sky-400 uppercase tracking-wide mb-1">
                  Weather
                </div>
                <div className="text-sm font-semibold text-sky-900 dark:text-sky-100 capitalize">
                  {scene.sceneContext.weather}
                </div>
              </div>
            )}

            {scene.sceneContext.mood && (
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-800">
                <div className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">
                  Mood
                </div>
                <div className="text-sm font-semibold text-violet-900 dark:text-violet-100 capitalize">
                  {scene.sceneContext.mood}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Characters */}
      {scene.sceneContext?.presentCharacters &&
        scene.sceneContext.presentCharacters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-purple-900 dark:text-purple-100">
                Characters ({scene.sceneContext.presentCharacters.length})
              </h3>
            </div>
            <div className="space-y-2">
              {scene.sceneContext.presentCharacters.map((character, index) => (
                <div
                  key={index}
                  className="bg-white/60 dark:bg-purple-900/30 rounded-lg p-2 border border-purple-100 dark:border-purple-700"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100 break-words">
                      {getCharacterName(character, projectData)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      {/* Outfit Overrides */}
      {scene.sceneContext?.outfitOverrides &&
        scene.sceneContext.outfitOverrides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-teal-900 dark:text-teal-100">
                Outfit Changes ({scene.sceneContext.outfitOverrides.length})
              </h3>
            </div>
            <div className="space-y-2">
              {scene.sceneContext.outfitOverrides.map((override, index) => (
                <div
                  key={index}
                  className="bg-white/60 dark:bg-teal-900/30 rounded-lg p-3 border border-teal-100 dark:border-teal-700"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
                      {getCharacterName(override.characterId, projectData)}
                    </span>
                  </div>
                  <div className="text-xs text-teal-700 dark:text-teal-300 ml-5">
                    <span className="font-medium">Outfit:</span>{" "}
                    {getOutfitName(override.outfitId, projectData)}
                    {override.reason && (
                      <div className="mt-1">
                        <span className="font-medium">Reason:</span>{" "}
                        {override.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
    </div>
  );
}

function PanelDetails({
  panel,
  projectData,
}: {
  panel: Panel;
  projectData?: MangaProject | null;
}) {
  return (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 p-4">
        {/* Panel Image */}
        {panel.imageUrl && (
          <div className="relative h-32 overflow-hidden rounded-lg mb-3">
            <img
              src={panel.imageUrl}
              alt={`Panel ${panel.order}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white mb-1">
                Panel {panel.order}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {panel.panelContext?.shotType && (
                  <Badge className="bg-white/15 text-white border-white/20 text-xs capitalize">
                    {panel.panelContext.shotType}
                  </Badge>
                )}
                <Badge
                  className={`text-xs ${
                    panel.isAiGenerated
                      ? "bg-purple-500/80 text-white"
                      : "bg-blue-500/80 text-white"
                  }`}
                >
                  {panel.isAiGenerated ? "AI" : "Manual"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-white">
                {panel.dialogues?.length || 0}
              </div>
              <div className="text-white/70 text-xs">Dialogues</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-white">
                {panel.panelContext?.characterPoses?.length || 0}
              </div>
              <div className="text-white/70 text-xs">Characters</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Action */}
      {panel.panelContext?.action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Action
            </h2>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
            {panel.panelContext.action}
          </p>
        </motion.div>
      )}

      {/* Technical Details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {panel.panelContext?.cameraAngle && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
              Camera Angle
            </div>
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 capitalize">
              {panel.panelContext.cameraAngle}
            </div>
          </div>
        )}

        {panel.panelContext?.emotion && (
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-800">
            <div className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">
              Emotion
            </div>
            <div className="text-sm font-semibold text-violet-900 dark:text-violet-100 capitalize">
              {panel.panelContext.emotion}
            </div>
          </div>
        )}

        {panel.panelContext?.lighting && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
              Lighting
            </div>
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-100 break-words">
              {panel.panelContext.lighting}
            </div>
          </div>
        )}

        {panel.panelContext?.locationId && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </div>
            <div className="text-sm font-semibold text-green-900 dark:text-green-100 break-words">
              {getLocationName(panel.panelContext.locationId, projectData)}
            </div>
          </div>
        )}
      </motion.div>

      {/* Character Poses */}
      {panel.panelContext?.characterPoses &&
        panel.panelContext.characterPoses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                Character Poses ({panel.panelContext.characterPoses.length})
              </h3>
            </div>
            <div className="space-y-3">
              {panel.panelContext.characterPoses.map((pose, index) => (
                <div
                  key={index}
                  className="bg-white/60 dark:bg-indigo-900/30 rounded-lg p-3 border border-indigo-100 dark:border-indigo-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 break-words">
                      {pose.characterName}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Pose:
                      </span>
                      <span className="ml-1 text-indigo-800 dark:text-indigo-200 break-words">
                        {pose.pose}
                      </span>
                    </div>
                    <div>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Expression:
                      </span>
                      <span className="ml-1 text-indigo-800 dark:text-indigo-200 break-words">
                        {pose.expression}
                      </span>
                    </div>
                    {pose.outfitId && (
                      <div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          Outfit:
                        </span>
                        <span className="ml-1 text-indigo-800 dark:text-indigo-200 break-words">
                          {getOutfitName(pose.outfitId, projectData)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      {/* Effects */}
      {panel.panelContext?.effects && panel.panelContext.effects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-100">
              Effects ({panel.panelContext.effects.length})
            </h3>
          </div>
          <div className="space-y-2">
            {panel.panelContext.effects.map((effect, index) => (
              <div
                key={index}
                className="bg-white/60 dark:bg-purple-900/30 rounded-lg p-2 border border-purple-100 dark:border-purple-700"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100 break-words">
                    {effect}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dialogues */}
      {panel.dialogues && panel.dialogues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-pink-900 dark:text-pink-100">
              Dialogues ({panel.dialogues.length})
            </h3>
          </div>
          <div className="space-y-3">
            {panel.dialogues.map((dialogue, index) => (
              <motion.div
                key={dialogue.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white/60 dark:bg-pink-900/30 rounded-lg p-3 border border-pink-100 dark:border-pink-700"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {dialogue.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-pink-900 dark:text-pink-100 italic break-words leading-relaxed">
                      "{dialogue.content}"
                    </p>
                  </div>
                </div>

                {(dialogue.style?.bubbleType || dialogue.emotion) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dialogue.style?.bubbleType && (
                      <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
                        {dialogue.style.bubbleType}
                      </Badge>
                    )}
                    {dialogue.emotion && (
                      <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
                        {dialogue.emotion}
                      </Badge>
                    )}
                  </div>
                )}

                {(dialogue.speaker || dialogue.speakerId) && (
                  <div className="mt-2 text-xs text-pink-600 dark:text-pink-400">
                    <User className="w-3 h-3 inline mr-1" />
                    <span className="break-words">
                      {dialogue.speaker
                        ? dialogue.speaker.name
                        : dialogue.speakerId
                        ? getCharacterName(dialogue.speakerId, projectData)
                        : "Unknown Speaker"}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ChapterDetails({ chapter }: { chapter: Chapter }) {
  return (
    <div className="space-y-6">
      {/* Chapter Header with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 border border-green-200 dark:border-green-800">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={chapter.isPublished ? "default" : "secondary"}
                  className={
                    chapter.isPublished
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }
                >
                  {chapter.isPublished ? "Published" : "Draft"}
                </Badge>
                {chapter.viewCount && (
                  <Badge
                    variant="outline"
                    className="bg-white/50 border-green-200"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {chapter.viewCount} views
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Chapter Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {chapter.scenes?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Scenes
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {chapter.scenes?.reduce(
                  (total, scene) => total + (scene.panels?.length || 0),
                  0
                ) || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Panels
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {chapter.keyCharacters?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Characters
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Chapter Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Narrative & Purpose */}
            {chapter.narrative && (
              <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Narrative
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {chapter.narrative}
                </p>
              </div>
            )}

            {chapter.purpose && (
              <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Purpose
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {chapter.purpose}
                </p>
              </div>
            )}

            {/* Tone & Atmosphere */}
            {chapter.tone && (
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                    Chapter Tone
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {chapter.tone}
                  </div>
                </div>
              </div>
            )}

            {/* Key Characters */}
            {chapter.keyCharacters && chapter.keyCharacters.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Key Characters
                </h4>
                <div className="flex flex-wrap gap-2">
                  {chapter.keyCharacters.map((character, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
                    >
                      <User className="w-3 h-3 mr-1" />
                      {character}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scenes Summary */}
      {chapter.scenes && chapter.scenes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                Scenes Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {chapter.scenes.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Scenes
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {chapter.scenes.reduce(
                        (total, scene) => total + (scene.panels?.length || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Panels
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 text-center">
                  View individual scenes for detailed breakdown and panel
                  information
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Chapter Performance */}
      {(chapter.viewCount || chapter.isPublished) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-white to-teal-50/30 dark:from-gray-900 dark:to-teal-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Performance & Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {chapter.viewCount && (
                  <div className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800 text-center">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                      {chapter.viewCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      Total Views
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800 text-center">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                    {chapter.isPublished ? "LIVE" : "DRAFT"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Status
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN DETAIL PANEL COMPONENT
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
}: EntityDetailPanelProps) {
  const [showActions, setShowActions] = useState(false);

  if (!entity || !entityType) return null;

  const Icon = getEntityIcon(entityType);
  const colorClass = getEntityColor(entityType);

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[28rem] bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 border-l border-gray-200/80 dark:border-gray-700/80 backdrop-blur-sm z-50 flex flex-col shadow-2xl"
          >
            {/* Enhanced Header with Gradient Background */}
            <div
              className={`relative overflow-hidden border-b border-gray-200/50 dark:border-gray-700/50`}
            >
              {/* Background gradient specific to entity type */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${getEntityColor(
                  entityType
                )} opacity-5`}
              ></div>

              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getEntityColor(
                        entityType
                      )} flex items-center justify-center shadow-xl ring-4 ring-white/20 dark:ring-black/20`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {getEntityName(entity, entityType)}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`${getEntityAccentColor(
                            entityType
                          )} font-medium capitalize`}
                        >
                          {entityType}
                        </Badge>
                        {"isActive" in entity && (
                          <Badge
                            variant={entity.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {entity.isActive ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-colors backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-2">
                  {onEdit && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(entity)}
                        className={`flex items-center gap-2 ${getEntityAccentColor(
                          entityType
                        )} border-current hover:shadow-md transition-all`}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </motion.div>
                  )}
                  {onDuplicate && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDuplicate(entity)}
                        className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 hover:shadow-md transition-all"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </Button>
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 hover:shadow-md transition-all"
                    >
                      <Share className="w-4 h-4" />
                      Share
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Enhanced Content with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {entityType === "character" && (
                <CharacterDetails character={entity as Character} />
              )}
              {entityType === "project" && (
                <ProjectDetails project={entity as MangaProject} />
              )}
              {entityType === "scene" && (
                <SceneDetails
                  scene={entity as Scene}
                  projectData={projectData}
                />
              )}
              {entityType === "panel" && (
                <PanelDetails
                  panel={entity as Panel}
                  projectData={projectData}
                />
              )}
              {(entityType === "outfit" || entityType === "location") && (
                <TemplateDetails
                  template={entity as OutfitTemplate | LocationTemplate}
                  type={entityType}
                />
              )}
              {entityType === "chapter" && (
                <ChapterDetails chapter={entity as Chapter} />
              )}

              {/* Enhanced Metadata Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Card className="border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/80 to-gray-50/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      Metadata & System Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timeline Info */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Created
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {formatDate(entity.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Last Updated
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {formatDate(entity.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-800/50 dark:to-slate-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Entity ID
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            navigator.clipboard.writeText(entity.id)
                          }
                          className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3 h-3 text-gray-500" />
                        </motion.button>
                      </div>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-2 py-1 rounded break-all">
                        {entity.id}
                      </span>
                    </div>

                    {/* Additional Entity Stats */}
                    {"isAiGenerated" in entity && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            entity.isAiGenerated ? "default" : "secondary"
                          }
                          className={
                            entity.isAiGenerated
                              ? "bg-purple-500 text-white"
                              : "bg-blue-500 text-white"
                          }
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          {entity.isAiGenerated
                            ? "AI Generated"
                            : "User Created"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Enhanced Footer Actions */}
            {onDelete && (
              <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-red-50/30 dark:from-gray-800/50 dark:to-red-900/20">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(entity)}
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete {entityType}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    This action cannot be undone
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
