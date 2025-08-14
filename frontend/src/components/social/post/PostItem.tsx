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
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
      <PostHeader post={post} />
      <PostContent post={post} />
      <PostImageGallery images={post.images || []} />
      <PostActions post={post} />
    </article>
  );
};

export default PostItem;
