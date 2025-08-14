import { usePosts } from "@/hooks/usePosts";
import React from "react";
import PostList from "./PostList";

const SocialFeed: React.FC = () => {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading posts...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load posts.
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
  return <PostList posts={posts || []} />;
};

export default SocialFeed;
