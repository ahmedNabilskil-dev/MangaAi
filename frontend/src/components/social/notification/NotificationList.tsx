import { Notification } from "@/lib/api/social/notifications";
import React from "react";
import NotificationItem from "./NotificationItem";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  loadingMarkReadId?: string;
  loadingDeleteId?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkRead,
  onDelete,
  loadingMarkReadId,
  loadingDeleteId,
}) => {
  if (!notifications.length) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No notifications yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => (
        <NotificationItem
          key={n._id}
          notification={n}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
          loadingMarkRead={loadingMarkReadId === n._id}
          loadingDelete={loadingDeleteId === n._id}
        />
      ))}
    </div>
  );
};

export default NotificationList;
