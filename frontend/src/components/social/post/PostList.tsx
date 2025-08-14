import { Post } from "@/lib/api/social/posts";
import React from "react";
import PostItem from "./PostItem";

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (!posts.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No posts yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostItem key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
