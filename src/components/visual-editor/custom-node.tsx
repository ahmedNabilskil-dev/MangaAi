"use client";

import {
  BookOpen,
  Clock,
  Eye,
  Film,
  Heart,
  LayoutPanelTop,
  MessageCircle,
  Mountain,
  Palette,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

// Type definitions
export type NodeType =
  | "project"
  | "chapter"
  | "scene"
  | "panel"
  | "dialogue"
  | "character";

export interface NodeProperties {
  description?: string;
  imageUrl?: string;
  imgUrl?: string;
  progress?: number;
  tags?: string[];
  traits?: string[];
  narrative?: string;
  scenes?: number[];
  setting?: string;
  mood?: string;
  presentCharacters?: string[];
  timeOfDay?: string;
  action?: string;
  cameraAngle?: string;
  content?: string;
  emotion?: string;
  style?: {
    bubbleType?: string;
  };
  briefDescription?: string;
  role?: string;
  purpose?: string;
}

export interface NodeData {
  type: NodeType;
  label: string;
  properties: NodeProperties;
  id?: string;
}

export interface CustomNodeProps {
  data: NodeData;
  selected?: boolean;
  isConnectable?: boolean;
  onViewDetails?: (nodeId: string) => void;
}

export interface NodeColors {
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  ring: string;
  light: string;
  dark: string;
  border: string;
  progress: string;
  glow: string;
  shimmer: string;
}

// Shared helpers and components

// Animated shimmer effect component
export const ShimmerEffect = ({ color }: { color: string }) => (
  <div className={`absolute inset-0 overflow-hidden`}>
    <div
      className={`absolute -inset-12 opacity-30 ${color} animate-shimmer`}
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        animation: "shimmer 3s infinite",
      }}
    />
  </div>
);

// Helper function to truncate text
export const truncate = (str: string = "", length: number) => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};

// Icons for each node type
export const nodeIconMap: Record<NodeType, React.ComponentType<any>> = {
  project: BookOpen,
  chapter: Clock,
  scene: Film,
  panel: LayoutPanelTop,
  dialogue: MessageCircle,
  character: User,
};

// Premium color schemes for both light and dark modes
export const nodeColors: Record<NodeType, NodeColors> = {
  project: {
    primary:
      "from-violet-600 to-purple-700 dark:from-violet-700 dark:to-purple-800",
    secondary:
      "from-violet-400 to-purple-500 dark:from-violet-500 dark:to-purple-600",
    text: "text-purple-50 dark:text-purple-100",
    accent: "bg-purple-500 dark:bg-purple-600",
    ring: "ring-purple-500 dark:ring-purple-600",
    light: "bg-purple-50/80 dark:bg-purple-900/30",
    dark: "bg-purple-900/10 dark:bg-purple-950/70",
    border: "border-purple-200 dark:border-purple-800",
    progress: "bg-purple-400 dark:bg-purple-500",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.6)] dark:shadow-[0_0_20px_rgba(192,132,252,0.7)]",
    shimmer: "via-violet-500",
  },
  chapter: {
    primary:
      "from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800",
    secondary:
      "from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600",
    text: "text-blue-50 dark:text-blue-100",
    accent: "bg-blue-500 dark:bg-blue-600",
    ring: "ring-blue-500 dark:ring-blue-600",
    light: "bg-blue-50/80 dark:bg-blue-900/30",
    dark: "bg-blue-900/10 dark:bg-blue-950/70",
    border: "border-blue-200 dark:border-blue-800",
    progress: "bg-blue-400 dark:bg-blue-500",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.6)] dark:shadow-[0_0_20px_rgba(96,165,250,0.7)]",
    shimmer: "via-blue-500",
  },
  scene: {
    primary:
      "from-emerald-600 to-green-700 dark:from-emerald-700 dark:to-green-800",
    secondary:
      "from-emerald-400 to-green-500 dark:from-emerald-500 dark:to-green-600",
    text: "text-emerald-50 dark:text-emerald-100",
    accent: "bg-emerald-500 dark:bg-emerald-600",
    ring: "ring-emerald-500 dark:ring-emerald-600",
    light: "bg-emerald-50/80 dark:bg-emerald-900/30",
    dark: "bg-emerald-900/10 dark:bg-emerald-950/70",
    border: "border-emerald-200 dark:border-emerald-800",
    progress: "bg-emerald-400 dark:bg-emerald-500",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.6)] dark:shadow-[0_0_20px_rgba(52,211,153,0.7)]",
    shimmer: "via-emerald-500",
  },
  panel: {
    primary:
      "from-amber-600 to-yellow-700 dark:from-amber-700 dark:to-yellow-800",
    secondary:
      "from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600",
    text: "text-amber-50 dark:text-amber-100",
    accent: "bg-amber-500 dark:bg-amber-600",
    ring: "ring-amber-500 dark:ring-amber-600",
    light: "bg-amber-50/80 dark:bg-amber-900/30",
    dark: "bg-amber-900/10 dark:bg-amber-950/70",
    border: "border-amber-200 dark:border-amber-800",
    progress: "bg-amber-400 dark:bg-amber-500",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.6)] dark:shadow-[0_0_20px_rgba(251,191,36,0.7)]",
    shimmer: "via-amber-500",
  },
  dialogue: {
    primary: "from-rose-600 to-pink-700 dark:from-rose-700 dark:to-pink-800",
    secondary: "from-rose-400 to-pink-500 dark:from-rose-500 dark:to-pink-600",
    text: "text-rose-50 dark:text-rose-100",
    accent: "bg-rose-500 dark:bg-rose-600",
    ring: "ring-rose-500 dark:ring-rose-600",
    light: "bg-rose-50/80 dark:bg-rose-900/30",
    dark: "bg-rose-900/10 dark:bg-rose-950/70",
    border: "border-rose-200 dark:border-rose-800",
    progress: "bg-rose-400 dark:bg-rose-500",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.6)] dark:shadow-[0_0_20px_rgba(251,113,133,0.7)]",
    shimmer: "via-rose-500",
  },
  character: {
    primary: "from-cyan-600 to-teal-700 dark:from-cyan-700 dark:to-teal-800",
    secondary: "from-cyan-400 to-teal-500 dark:from-cyan-500 dark:to-teal-600",
    text: "text-cyan-50 dark:text-cyan-100",
    accent: "bg-cyan-500 dark:bg-cyan-600",
    ring: "ring-cyan-500 dark:ring-cyan-600",
    light: "bg-cyan-50/80 dark:bg-cyan-900/30",
    dark: "bg-cyan-900/10 dark:bg-cyan-950/70",
    border: "border-cyan-200 dark:border-cyan-800",
    progress: "bg-cyan-400 dark:bg-cyan-500",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.6)] dark:shadow-[0_0_20px_rgba(103,232,249,0.7)]",
    shimmer: "via-cyan-500",
  },
};

// Base Node component - common functionality for all node types
export const BaseNode = ({
  data,
  selected = false,
  isConnectable = true,
  children,
  onViewDetails,
}: CustomNodeProps & { children: React.ReactNode }) => {
  const nodeType = data.type;
  const colors = nodeColors[nodeType] || nodeColors.project;
  const Icon = nodeIconMap[nodeType] || Sparkles;

  // Floating particle effect
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; speed: number }>
  >([]);

  useEffect(() => {
    if (selected) {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
      }));
      setParticles(newParticles);

      const interval = setInterval(() => {
        setParticles((prev) =>
          prev.map((p) => ({
            ...p,
            y: (p.y + p.speed) % 100,
            x: (p.x + (Math.random() - 0.5)) % 100,
          }))
        );
      }, 100);

      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [selected]);

  // Get image URL if available
  const imageUrl = data.properties?.imageUrl || data.properties?.imgUrl;

  // Handle view details click
  const handleViewDetails = () => {
    if (onViewDetails && data.id) {
      onViewDetails(data.id);
    }
  };

  return (
    <div
      className={`
        group relative flex flex-col w-80 rounded-2xl overflow-hidden
        transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02]
        shadow-xl hover:shadow-2xl ${colors.glow} hover:${colors.glow}
        border ${colors.border}
        ${
          selected
            ? `ring-2 ring-offset-2 ${colors.ring} scale-[1.02] ${colors.glow}`
            : ""
        }
      `}
    >
      {/* Floating particles when selected */}
      {selected &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${colors.accent} opacity-70`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}

      {/* Shimmer effect */}
      <ShimmerEffect color={colors.shimmer} />

      {/* Glossy header with gradient and animated shine */}
      <div
        className={`
          relative h-14 bg-gradient-to-r ${colors.primary}
          flex items-center px-5 py-3 ${colors.text} font-semibold
          overflow-hidden
        `}
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shine" />
        </div>

        <div className="absolute inset-0 bg-white/10 rounded-t-2xl"></div>
        <Icon className="h-6 w-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
        <span className="uppercase tracking-wider text-sm drop-shadow-md">
          {data.type}
        </span>

        {/* Add View Details button */}
        <button
          onClick={handleViewDetails}
          className="ml-auto flex items-center justify-center p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Image section with parallax effect */}
      {
        <div className="relative w-full h-40 overflow-hidden group-hover:h-44 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            src={imageUrl || "/images/hero-bg.png"}
            alt={data.label}
            className="object-cover transition-all duration-700 group-hover:scale-105"
          />
          {data.type === "character" && data.properties?.role && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-black/40 backdrop-blur-sm z-20">
              {data.properties.role}
            </div>
          )}
        </div>
      }

      {/* Content area with frosted glass effect */}
      <div
        className={`
          relative p-5 flex-grow flex flex-col
          ${colors.light} backdrop-blur-md
          border-t ${colors.border}
          transition-all duration-300
        `}
      >
        {/* Title with animated underline */}
        <h3 className="text-lg font-bold mb-3 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-500 group-hover:after:w-full">
          {data.label}
        </h3>

        {/* Specific node content will be injected here */}
        {children}
      </div>

      {/* Glowing connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={`
          !bg-white !border-0 !h-3.5 !w-3.5 
          shadow-lg shadow-black/30
          transition-all duration-300 
          group-hover:scale-150 group-hover:shadow-xl
          before:content-[''] before:absolute before:inset-0 
          before:bg-gradient-to-r ${colors.primary} before:rounded-full before:blur-[3px] before:z-[-1]
          hover:!h-4 hover:!w-4
        `}
        style={{ left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={`
          !bg-white !border-0 !h-3.5 !w-3.5 
          shadow-lg shadow-black/30
          transition-all duration-300 
          group-hover:scale-150 group-hover:shadow-xl
          before:content-[''] before:absolute before:inset-0 
          before:bg-gradient-to-r ${colors.primary} before:rounded-full before:blur-[3px] before:z-[-1]
          hover:!h-4 hover:!w-4
        `}
        style={{ left: "50%" }}
      />
    </div>
  );
};

// Project Node Component
export const ProjectNode = (props: CustomNodeProps) => {
  const { data } = props;
  const tags = data.properties?.tags || [];
  const showTags = tags.length > 0;

  return (
    <BaseNode {...props}>
      {data.properties?.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {truncate(data.properties.description, 120)}
          </p>
        </div>
      )}

      {/* Tags */}
      {showTags && (
        <div className="flex flex-wrap gap-2 mt-auto pt-3">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium
                bg-gradient-to-r ${nodeColors.project.secondary} ${nodeColors.project.text}
                shadow-sm hover:scale-105 transition-transform
              `}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2.5 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}
    </BaseNode>
  );
};

// Chapter Node Component
export const ChapterNode = (props: CustomNodeProps) => {
  const { data } = props;

  return (
    <BaseNode {...props}>
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {truncate(data.properties?.purpose || "", 120)}
        </p>
        {data.properties?.scenes && (
          <div className="flex items-center mt-3 text-xs text-blue-500 dark:text-blue-400">
            <Film className="h-3.5 w-3.5 mr-1.5 animate-bounce" />
            <span>{data.properties.scenes?.length} scenes</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
};

// Scene Node Component
export const SceneNode = (props: CustomNodeProps) => {
  const { data } = props;

  return (
    <BaseNode {...props}>
      {data.properties?.setting && (
        <div className="mb-4 text-sm">
          <div className="flex items-center mb-3">
            <Mountain className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="font-medium">Setting:</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 pl-5.5">
            {truncate(data.properties.setting, 100)}
          </p>
          {data.properties.mood && (
            <div className="flex items-center mt-3 text-xs text-emerald-500 dark:text-emerald-400">
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              <span>{data.properties.mood}</span>
            </div>
          )}
        </div>
      )}

      {data.properties?.timeOfDay && (
        <div className="px-2.5 py-1 rounded-full text-xs self-start bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {data.properties.timeOfDay}
        </div>
      )}
    </BaseNode>
  );
};

// Panel Node Component
export const PanelNode = (props: CustomNodeProps) => {
  const { data } = props;

  return (
    <BaseNode {...props}>
      {data.properties?.action && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 group-hover:line-clamp-4 transition-all">
            {data.properties.action}
          </p>
        </div>
      )}

      {data.properties?.cameraAngle && (
        <div className="px-2.5 py-1 rounded-full text-xs self-start bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {data.properties.cameraAngle}
        </div>
      )}
    </BaseNode>
  );
};

// Dialogue Node Component
export const DialogueNode = (props: CustomNodeProps) => {
  const { data } = props;

  return (
    <BaseNode {...props}>
      {data.properties?.content && (
        <div className="mb-4 italic text-sm transform transition-all duration-300 group-hover:translate-x-1">
          <div className="relative pl-5 border-l-2 border-gray-300 dark:border-gray-600">
            <span className="text-gray-500 opacity-50 absolute -left-1 top-0 text-xl">
              "
            </span>
            {truncate(data.properties.content, 120)}
            <span className="text-gray-500 opacity-50 ml-1 text-xl">"</span>
          </div>
          {data.properties.emotion && (
            <div className="flex items-center mt-3 text-xs text-rose-500 dark:text-rose-400">
              <Heart className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
              <span>{data.properties.emotion}</span>
            </div>
          )}
        </div>
      )}
    </BaseNode>
  );
};

// Character Node Component
export const CharacterNode = (props: CustomNodeProps) => {
  const { data } = props;
  const traits = data.properties?.traits || [];
  const showTraits = traits.length > 0;

  return (
    <BaseNode {...props}>
      {data.properties?.briefDescription && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {truncate(data.properties.briefDescription, 120)}
          </p>
        </div>
      )}

      {/* Traits */}
      {showTraits && (
        <div className="flex flex-wrap gap-2 mt-auto pt-3">
          {traits.slice(0, 3).map((trait, index) => (
            <span
              key={index}
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium
                bg-gradient-to-r ${nodeColors.character.secondary} ${nodeColors.character.text}
                shadow-sm hover:scale-105 transition-transform
              `}
            >
              {trait}
            </span>
          ))}
          {traits.length > 3 && (
            <span className="px-2.5 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              +{traits.length - 3}
            </span>
          )}
        </div>
      )}
    </BaseNode>
  );
};

// Main CustomNode wrapper that renders the appropriate node type
export const CustomNode = (props: CustomNodeProps) => {
  const { data } = props;

  // Render the correct node type based on data.type
  switch (data.type) {
    case "project":
      return <ProjectNode {...props} />;
    case "chapter":
      return <ChapterNode {...props} />;
    case "scene":
      return <SceneNode {...props} />;
    case "panel":
      return <PanelNode {...props} />;
    case "dialogue":
      return <DialogueNode {...props} />;
    case "character":
      return <CharacterNode {...props} />;
    default:
      // Fallback to base node with empty content
      return <BaseNode {...props}>{null}</BaseNode>;
  }
};
