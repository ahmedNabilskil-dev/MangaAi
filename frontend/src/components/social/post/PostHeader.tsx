import { Post } from "@/lib/api/social/posts";
import React from "react";

interface PostHeaderProps {
  post: Post;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
  // TODO: Replace with user avatar/name lookup
  // Generate initials from userId (fallback)
  const initials = `U${post.userId.slice(-2)}`;
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/70 to-accent flex items-center justify-center text-lg font-bold text-white shadow border border-border select-none"
        aria-label="User avatar"
      >
        <span>{initials}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-foreground truncate max-w-[120px]">
          User {post.userId.slice(-4)}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      <div
        className="ml-auto text-xs px-2 py-1 rounded bg-accent text-accent-foreground capitalize border border-border"
        title={`Visibility: ${post.visibility}`}
      >
        {post.visibility}
      </div>
    </div>
  );
};

export default PostHeader;
