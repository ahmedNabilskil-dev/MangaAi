import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/social/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useNotificationActions(token: string) {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", token] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsAsRead(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", token] });
    },
  });

  const remove = useMutation({
    mutationFn: (notificationId: string) =>
      deleteNotification(notificationId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", token] });
    },
  });

  return { markRead, markAllRead, remove };
}
