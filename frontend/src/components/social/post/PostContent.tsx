import { Post } from "@/lib/api/social/posts";
import React from "react";

interface PostContentProps {
  post: Post;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  // Enhanced text with hashtag and mention highlighting
  const formatContent = (text: string) => {
    return text.split(" ").map((word, index, arr) => {
      let element;
      if (word.startsWith("#")) {
        element = (
          <span
            key={index}
            className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
          >
            {word}
          </span>
        );
      } else if (word.startsWith("@")) {
        element = (
          <span
            key={index}
            className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium"
          >
            {word}
          </span>
        );
      } else {
        element = <span key={index}>{word}</span>;
      }
      // Add a space after each word except the last one
      return (
        <React.Fragment key={index}>
          {element}
          {index < arr.length - 1 && " "}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="px-6 py-4">
      <div className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
        {formatContent(post.content)}
      </div>
    </div>
  );
};

export default PostContent;
