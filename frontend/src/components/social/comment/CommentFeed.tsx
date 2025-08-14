import { useComments } from "@/hooks/useComments";
import React from "react";
import CommentList from "./CommentList";

interface CommentFeedProps {
  postId: string;
}

const CommentFeed: React.FC<CommentFeedProps> = ({ postId }) => {
  const {
    data: comments,
    isLoading,
    isError,
    error,
    refetch,
  } = useComments(postId);

  if (!postId) return null;

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading comments...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Failed to load comments.
        <br />
        <button
          className="mt-2 px-3 py-1 rounded bg-primary text-primary-foreground"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }
  return <CommentList comments={comments || []} />;
};

export default CommentFeed;
