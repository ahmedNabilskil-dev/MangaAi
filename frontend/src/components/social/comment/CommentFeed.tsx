import { useComments } from "@/hooks/useComments";
import { Image, MessageCircle, Send, Smile } from "lucide-react";
import React, { useState } from "react";
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

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!postId) return null;

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setNewComment("");
      setIsSubmitting(false);
      // Here you would call your API to create the comment
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Failed to load comments
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">
            Comments ({comments?.length || 0})
          </h3>
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="flex gap-4">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-semibold text-white shadow-md ring-2 ring-white/30 flex-shrink-0">
            <span className="text-sm">ME</span>
          </div>

          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a thoughtful comment..."
                className="w-full p-4 pr-20 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                rows={3}
                disabled={isSubmitting}
              />

              {/* Action Buttons */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Image className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Press Enter to post, Shift+Enter for new line</span>
              </div>
              <div className="text-xs text-gray-400">
                {newComment.length}/1000
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6">
        <CommentList comments={comments || []} />
      </div>
    </div>
  );
};

export default CommentFeed;
