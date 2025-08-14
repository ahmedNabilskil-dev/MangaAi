import { Comment } from "@/lib/api/social/comments";
import React from "react";

interface CommentHeaderProps {
  comment: Comment;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({ comment }) => {
  // TODO: Replace with user avatar/name lookup
  // Generate initials from userId (fallback)
  const initials = `U${comment.userId.slice(-2)}`;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/70 to-accent flex items-center justify-center text-xs font-bold text-white shadow border border-border select-none"
        aria-label="User avatar"
      >
        <span>{initials}</span>
      </div>
      <span className="font-medium text-foreground text-sm truncate max-w-[80px]">
        User {comment.userId.slice(-4)}
      </span>
      <span className="text-xs text-muted-foreground ml-2">
        {new Date(comment.createdAt).toLocaleString()}
      </span>
      <div
        className="ml-auto text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground capitalize border border-border"
        title={`Visibility: ${comment.visibility}`}
      >
        {comment.visibility}
      </div>
    </div>
  );
};

export default CommentHeader;
