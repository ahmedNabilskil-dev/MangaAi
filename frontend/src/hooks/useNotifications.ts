import {
  getUserNotifications,
  Notification,
} from "@/lib/api/social/notifications";
import { useQuery } from "@tanstack/react-query";

export function useNotifications(token: string, limit = 20, offset = 0) {
  return useQuery<Notification[], Error>({
    queryKey: ["notifications", token, limit, offset],
    queryFn: () => getUserNotifications(token, limit, offset),
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
  });
}
