import { Comment } from "@/lib/api/social/comments";
import { Clock, Globe, Lock, Users } from "lucide-react";
import React from "react";

interface CommentHeaderProps {
  comment: Comment;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({ comment }) => {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const visibilityConfig = {
    public: { icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
    friends: { icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    private: { icon: Lock, color: "text-gray-600", bg: "bg-gray-50" },
  };

  const config = visibilityConfig[comment.visibility];
  const Icon = config.icon;

  // Generate beautiful gradient avatar
  const initials = `U${comment.userId.slice(-2)}`;
  const gradients = [
    "from-rose-400 to-pink-500",
    "from-cyan-400 to-blue-500",
    "from-emerald-400 to-green-500",
    "from-amber-400 to-orange-500",
    "from-violet-400 to-purple-500",
    "from-indigo-400 to-blue-500",
  ];
  const gradient = gradients[comment.userId.length % gradients.length];

  return (
    <div className="flex items-center gap-3 mb-3">
      {/* Modern Avatar */}
      <div
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-semibold text-white shadow-md ring-2 ring-white/30`}
      >
        <span className="text-sm">{initials}</span>
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            User {comment.userId.slice(-4)}
          </h4>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
          >
            <Icon className="w-2.5 h-2.5" />
            <span className="capitalize">{comment.visibility}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(comment.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentHeader;
