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
    <div className="group bg-white rounded-xl p-4 hover:bg-gray-50/50 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-sm">
      <CommentHeader comment={comment} />
      <CommentContent comment={comment} />
      <CommentActions comment={comment} />
    </div>
  );
};

export default CommentItem;
