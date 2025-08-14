import { Comment } from "@/lib/api/social/comments";
import React from "react";
import CommentActions from "./CommentActions";
import CommentContent from "./CommentContent";
import CommentHeader from "./CommentHeader";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="bg-muted rounded-lg p-3 flex flex-col gap-2 border border-border">
      <CommentHeader comment={comment} />
      <CommentContent comment={comment} />
      <CommentActions comment={comment} />
    </div>
  );
};

export default CommentItem;
