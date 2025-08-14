import { Post } from "@/lib/api/social/posts";
import React from "react";
import PostActions from "./PostActions";
import PostContent from "./PostContent";
import PostHeader from "./PostHeader";
import PostImageGallery from "./PostImageGallery";

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  return (
    <div className="bg-card rounded-xl shadow p-4 flex flex-col gap-3 border border-border">
      <PostHeader post={post} />
      <PostContent post={post} />
      {post.images && post.images.length > 0 && (
        <PostImageGallery images={post.images} />
      )}
      <PostActions post={post} />
    </div>
  );
};

export default PostItem;
