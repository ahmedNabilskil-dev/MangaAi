import { Notification } from "@/lib/api/social/notifications";
import {
  Bell,
  Check,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  UserPlus,
} from "lucide-react";
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
  const getNotificationIcon = (type: string) => {
    const iconProps = { className: "w-5 h-5" };

    switch (type.toLowerCase()) {
      case "like":
        return <Heart {...iconProps} className="w-5 h-5 text-red-500" />;
      case "comment":
        return (
          <MessageCircle {...iconProps} className="w-5 h-5 text-blue-500" />
        );
      case "follow":
        return <UserPlus {...iconProps} className="w-5 h-5 text-green-500" />;
      case "share":
        return <Share2 {...iconProps} className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div
      className={`group relative p-4 rounded-xl transition-all duration-300 border ${
        notification.read
          ? "bg-white border-gray-200 hover:bg-gray-50"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`p-3 rounded-full shadow-md ${
            notification.read ? "bg-white" : "bg-white/80"
          }`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-relaxed ${
              notification.read ? "text-gray-700" : "text-gray-900 font-medium"
            }`}
          >
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {timeAgo(notification.createdAt)}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!notification.read && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification._id)}
              disabled={loadingMarkRead}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(notification._id)}
              disabled={loadingDelete}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
