import { Post } from "@/lib/api/social/posts";
import { Clock, Globe, Lock, MoreHorizontal, Users } from "lucide-react";
import React from "react";

interface PostHeaderProps {
  post: Post;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
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
    public: { icon: Globe, color: "text-green-600", bg: "bg-green-50" },
    friends: { icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    private: { icon: Lock, color: "text-gray-600", bg: "bg-gray-50" },
  };

  const config = visibilityConfig[post.visibility];
  const Icon = config.icon;

  // Generate beautiful gradient avatar
  const initials = `U${post.userId.slice(-2)}`;
  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
  ];
  const gradient = gradients[post.userId.length % gradients.length];

  return (
    <div className="flex items-center justify-between p-6 pb-0">
      <div className="flex items-center gap-4">
        {/* Modern Avatar */}
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-white/20 transition-transform hover:scale-105`}
        >
          <span className="text-lg">{initials}</span>
        </div>

        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg">
            User {post.userId.slice(-4)}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{timeAgo(post.createdAt)}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
            >
              <Icon className="w-3 h-3" />
              <span className="capitalize">{post.visibility}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group">
        <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>
  );
};

export default PostHeader;
