"use client";
import NotificationFeed from "@/components/social/notification/NotificationFeed";
import PostList from "@/components/social/post/PostList";
import { usePosts } from "@/hooks/usePosts";

function getTokenFromLocalStorage() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || undefined;
  }
  return undefined;
}

import { createPost } from "@/lib/api/social/posts";
import React, { useState } from "react";

const SocialMainPage: React.FC = () => {
  const token = getTokenFromLocalStorage();
  const { data: posts, isLoading: postsLoading, refetch } = usePosts();
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      await createPost({ content }, token);
      setContent("");
      refetch();
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col md:flex-row">
      {/* Sidebar (desktop only) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 border-r border-border p-8 gap-8 min-h-screen shadow-lg rounded-tr-3xl rounded-br-3xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-white/30">
            M
          </div>
          <div className="font-semibold text-lg tracking-wide">
            MangaAi Social
          </div>
        </div>
        <nav className="flex flex-col gap-4 mt-10">
          <a
            href="#feed"
            className="hover:text-primary transition font-medium text-gray-700"
          >
            Feed
          </a>
          <a
            href="#notifications"
            className="hover:text-primary transition font-medium text-gray-700"
          >
            Notifications
          </a>
        </nav>
        <div className="mt-auto text-xs text-muted-foreground">
          &copy; 2025 MangaAi
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row gap-10 p-4 md:p-12 max-w-7xl w-full mx-auto">
        {/* Feed column */}
        <section
          id="feed"
          className="flex-1 max-w-2xl mx-auto flex flex-col gap-8"
        >
          {token && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-8 mb-4 backdrop-blur-md">
              <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-base min-h-[80px] resize-none shadow-sm"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                  disabled={creating}
                />
                <div className="flex items-center justify-between mt-2">
                  {error && (
                    <div className="text-destructive text-sm font-medium">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-60"
                    disabled={creating || !content.trim()}
                  >
                    {creating ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="flex flex-col gap-6">
            {postsLoading ? (
              <div className="text-muted-foreground text-center py-12 text-lg font-medium animate-pulse">
                Loading posts...
              </div>
            ) : (
              <PostList posts={posts || []} />
            )}
          </div>
        </section>
        {/* Notifications column */}
        <section
          id="notifications"
          className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-8 sticky top-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Notifications
            </h2>
            {token ? (
              <NotificationFeed token={token} />
            ) : (
              <div className="text-muted-foreground">
                Please log in to see notifications.
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Mobile floating action button for post creation */}
      {token && (
        <button
          className="fixed md:hidden bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all duration-200 transform hover:scale-105 z-50"
          onClick={() => {
            // Focus the textarea for post creation (if possible)
            const textarea = document.querySelector("textarea");
            if (textarea) textarea.focus();
          }}
          aria-label="Create Post"
        >
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 w-full h-0.5 bg-white rounded-full top-1/2 transform -translate-y-1/2" />
            <div className="absolute inset-0 h-full w-0.5 bg-white rounded-full left-1/2 transform -translate-x-1/2" />
          </div>
        </button>
      )}
      {/* Mobile bottom nav */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white/90 border-t border-border flex justify-around py-2 z-40 shadow-lg backdrop-blur-md">
        <a
          href="#feed"
          className="flex flex-col items-center text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <span className="material-symbols-rounded text-2xl">home</span>
          Feed
        </a>
        <a
          href="#notifications"
          className="flex flex-col items-center text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <span className="material-symbols-rounded text-2xl">
            notifications
          </span>
          Notifications
        </a>
      </nav>
    </div>
  );
};

export default SocialMainPage;
