import { Angry, Frown, Heart, Smile, ThumbsUp, Zap } from "lucide-react";
import React from "react";

const reactions = [
  {
    type: "like",
    icon: ThumbsUp,
    color: "text-blue-500",
    bg: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
  },
  {
    type: "love",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-50",
    hoverBg: "hover:bg-red-100",
  },
  {
    type: "haha",
    icon: Smile,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    hoverBg: "hover:bg-yellow-100",
  },
  {
    type: "wow",
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
  },
  {
    type: "sad",
    icon: Frown,
    color: "text-gray-500",
    bg: "bg-gray-50",
    hoverBg: "hover:bg-gray-100",
  },
  {
    type: "angry",
    icon: Angry,
    color: "text-red-600",
    bg: "bg-red-50",
    hoverBg: "hover:bg-red-100",
  },
];

interface ReactionBarProps {
  selected?: string;
  counts: Record<string, number>;
  onReact: (type: string) => void;
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  selected,
  counts,
  onReact,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
      {reactions.map((reaction) => {
        const Icon = reaction.icon;
        const count = counts[reaction.type] || 0;
        const isSelected = selected === reaction.type;

        return (
          <button
            key={reaction.type}
            onClick={() => onReact(reaction.type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium border ${
              isSelected
                ? `${reaction.color} ${reaction.bg} border-current shadow-md scale-105`
                : `text-gray-600 bg-white border-gray-200 hover:text-gray-800 ${reaction.hoverBg} hover:border-gray-300`
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-bold">{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
