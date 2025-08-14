import { Post } from "@/lib/api/social/posts";
import { FileText, Sparkles } from "lucide-react";
import React from "react";
import PostItem from "./PostItem";

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (!posts.length) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <FileText className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No posts yet</h3>
        <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
          The feed is empty right now. Follow some users or create your first
          post to get started!
        </p>
        <div className="mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Your First Post
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div
          key={post._id}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: "both",
          }}
        >
          <PostItem post={post} />
        </div>
      ))}

      {/* Load More Indicator */}
      {posts.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <span>Loading more posts...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PostList;
