import { Notification } from "@/lib/api/social/notifications";
import React from "react";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  loadingMarkRead?: boolean;
  loadingDelete?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
  loadingMarkRead,
  loadingDelete,
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-border ${
        notification.read ? "bg-muted" : "bg-primary/10"
      }`}
    >
      <span className="material-symbols-rounded text-xl text-primary">
        notifications
      </span>
      <div className="flex-1">
        <div className="font-medium text-foreground text-sm">
          {notification.message}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="flex gap-2">
        {!notification.read && (
          <button
            className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-60"
            onClick={() => onMarkRead && onMarkRead(notification._id)}
            disabled={loadingMarkRead}
            title="Mark as read"
          >
            {loadingMarkRead ? "..." : "Mark Read"}
          </button>
        )}
        <button
          className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground disabled:opacity-60"
          onClick={() => onDelete && onDelete(notification._id)}
          disabled={loadingDelete}
          title="Delete notification"
        >
          {loadingDelete ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
