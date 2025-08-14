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
    <div className="min-h-screen bg-gradient-to-br from-muted/60 to-background flex flex-col md:flex-row">
      {/* Sidebar (desktop only) */}
      <aside className="hidden md:flex flex-col w-64 bg-card/80 border-r border-border p-6 gap-8 min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
            M
          </div>
          <div className="font-semibold text-lg">MangaAi Social</div>
        </div>
        <nav className="flex flex-col gap-4 mt-8">
          <a href="#feed" className="hover:text-primary transition">
            Feed
          </a>
          <a href="#notifications" className="hover:text-primary transition">
            Notifications
          </a>
        </nav>
        <div className="mt-auto text-xs text-muted-foreground">
          &copy; 2025 MangaAi
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row gap-8 p-4 md:p-10 max-w-7xl w-full mx-auto">
        {/* Feed column */}
        <section
          id="feed"
          className="flex-1 max-w-2xl mx-auto flex flex-col gap-6"
        >
          {token && (
            <div className="bg-card rounded-xl shadow-lg border border-border p-6 mb-2">
              <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
                <textarea
                  className="w-full border rounded p-3 bg-muted/40 focus:bg-background focus:outline-primary transition"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                  disabled={creating}
                />
                <div className="flex items-center justify-between">
                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-primary text-primary-foreground font-semibold shadow disabled:opacity-60"
                    disabled={creating || !content.trim()}
                  >
                    {creating ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {postsLoading ? (
              <div className="text-muted-foreground text-center py-8">
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
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
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
      {/* Mobile bottom nav */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-card/90 border-t border-border flex justify-around py-2 z-50 shadow-lg">
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
