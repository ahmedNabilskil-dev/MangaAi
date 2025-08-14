import { Comment } from "@/lib/api/social/comments";
import React from "react";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (!comments.length) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No comments yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
