import { usePosts } from "@/hooks/usePosts";
import {
  AlertCircle,
  Clock,
  Globe,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import PostList from "./PostList";

const SocialFeed: React.FC = () => {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();
  const [feedFilter, setFeedFilter] = useState<
    "all" | "following" | "trending"
  >("all");

  const feedOptions = [
    {
      id: "all",
      name: "All Posts",
      icon: Globe,
      description: "See all public posts",
    },
    {
      id: "following",
      name: "Following",
      icon: Users,
      description: "Posts from people you follow",
    },
    {
      id: "trending",
      name: "Trending",
      icon: TrendingUp,
      description: "Popular posts right now",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded-full w-24"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Posts */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="animate-pulse">
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>

              {/* Image placeholder */}
              <div className="px-6">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-8 bg-gray-200 rounded-full w-20"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
          We couldn't load the posts right now. Please check your connection and
          try again.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed Header with Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Social Feed</h2>
                <p className="text-sm text-gray-600">
                  Stay connected with the community
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
              title="Refresh feed"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {feedOptions.map((option) => {
              const Icon = option.icon;
              const isActive = feedFilter === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setFeedFilter(option.id as any)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-md border border-blue-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                  title={option.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.name}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed Stats */}
        <div className="px-6 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
              <div className="text-gray-500">
                {posts?.length || 0} posts loaded
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <PostList posts={posts || []} />
    </div>
  );
};

export default SocialFeed;
