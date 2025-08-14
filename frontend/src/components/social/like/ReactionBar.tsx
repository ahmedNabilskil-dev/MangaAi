import React from "react";

const reactions = [
  { type: "like", icon: "thumb_up", color: "text-blue-500" },
  { type: "love", icon: "favorite", color: "text-pink-500" },
  { type: "haha", icon: "sentiment_very_satisfied", color: "text-yellow-500" },
  { type: "wow", icon: "emoji_objects", color: "text-purple-500" },
  { type: "sad", icon: "sentiment_dissatisfied", color: "text-gray-500" },
  { type: "angry", icon: "sentiment_very_dissatisfied", color: "text-red-500" },
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
    <div className="flex gap-2">
      {reactions.map((r) => (
        <button
          key={r.type}
          className={`flex items-center gap-1 px-2 py-1 rounded transition text-xs ${
            selected === r.type ? r.color : "text-muted-foreground"
          }`}
          onClick={() => onReact(r.type)}
        >
          <span className="material-symbols-rounded">{r.icon}</span>
          <span>{counts[r.type] || 0}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;
