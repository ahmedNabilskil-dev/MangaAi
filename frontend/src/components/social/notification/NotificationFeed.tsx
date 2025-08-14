"use client";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, CheckCheck, Settings } from "lucide-react";
import React, { useState } from "react";
import NotificationList from "./NotificationList";

interface NotificationFeedProps {
  token: string;
}

const NotificationFeed: React.FC<NotificationFeedProps> = ({ token }) => {
  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications(token);
  const { markRead, markAllRead, remove } = useNotificationActions(token);
  const [loadingMarkReadId, setLoadingMarkReadId] = useState<string | null>(
    null
  );
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  if (!token) return null;

  const handleMarkRead = async (id: string) => {
    setLoadingMarkReadId(id);
    try {
      await markRead.mutateAsync(id);
    } finally {
      setLoadingMarkReadId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingDeleteId(id);
    try {
      await remove.mutateAsync(id);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Failed to load notifications
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Notifications
              </h2>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                {markAllRead.isPending ? "Marking..." : "Mark all read"}
              </button>
            )}

            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6">
        <NotificationList
          notifications={notifications || []}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          loadingMarkReadId={loadingMarkReadId ?? undefined}
          loadingDeleteId={loadingDeleteId ?? undefined}
        />
      </div>
    </div>
  );
};

export default NotificationFeed;
