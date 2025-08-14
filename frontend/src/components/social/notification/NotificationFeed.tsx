"use client";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { useNotifications } from "@/hooks/useNotifications";
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

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading notifications...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Failed to load notifications.
        <br />
        <button
          className="mt-2 px-3 py-1 rounded bg-primary text-primary-foreground"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button
          className="px-3 py-1 rounded bg-primary text-primary-foreground disabled:opacity-60"
          onClick={handleMarkAllRead}
          disabled={markAllRead.isPending}
        >
          {markAllRead.isPending ? "..." : "Mark all as read"}
        </button>
      </div>
      <NotificationList
        notifications={notifications || []}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
        loadingMarkReadId={loadingMarkReadId ?? undefined}
        loadingDeleteId={loadingDeleteId ?? undefined}
      />
    </div>
  );
};

export default NotificationFeed;
