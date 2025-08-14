import { Notification } from "@/lib/api/social/notifications";
import { Bell } from "lucide-react";
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
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bell className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          All caught up!
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          You're all up to date. New notifications will appear here when you
          receive them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
          loadingMarkRead={loadingMarkReadId === notification._id}
          loadingDelete={loadingDeleteId === notification._id}
        />
      ))}
    </div>
  );
};

export default NotificationList;
