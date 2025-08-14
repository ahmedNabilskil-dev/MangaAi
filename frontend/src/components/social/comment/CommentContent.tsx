import { Comment } from "@/lib/api/social/comments";
import React from "react";

interface CommentContentProps {
  comment: Comment;
}

const CommentContent: React.FC<CommentContentProps> = ({ comment }) => {
  // Enhanced text with hashtag and mention highlighting
  const formatContent = (text: string) => {
    return text
      .split(" ")
      .map((word, index) => {
        if (word.startsWith("#")) {
          return (
            <span
              key={index}
              className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
            >
              {word}
            </span>
          );
        }
        if (word.startsWith("@")) {
          return (
            <span
              key={index}
              className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium"
            >
              {word}
            </span>
          );
        }
        return <span key={index}>{word}</span>;
      })
      .reduce((prev, curr, index) => [prev, " ", curr]);
  };

  return (
    <div className="ml-12 mb-3">
      <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-line">
        {formatContent(comment.content)}
      </div>
    </div>
  );
};

export default CommentContent;
