import { Comment } from "@/lib/api/social/comments";
import React from "react";

interface CommentContentProps {
  comment: Comment;
}

const CommentContent: React.FC<CommentContentProps> = ({ comment }) => {
  return (
    <div className="whitespace-pre-line text-sm text-foreground">
      {comment.content}
    </div>
  );
};

export default CommentContent;
