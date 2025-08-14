import { Post } from "@/lib/api/social/posts";
import React from "react";

interface PostContentProps {
  post: Post;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  return (
    <div className="whitespace-pre-line text-base text-foreground">
      {post.content}
    </div>
  );
};

export default PostContent;
