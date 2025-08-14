import { apiRequest } from "@/lib/api-client";

// --- Types ---
export interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  sourceId?: string;
  read?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: string;
  message: string;
  sourceId?: string;
}

// --- API Functions ---

export async function createNotification(
  data: CreateNotificationDto,
  token: string
): Promise<Notification> {
  return apiRequest.post("/social/notification", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getUserNotifications(
  token: string,
  limit = 20,
  offset = 0
): Promise<Notification[]> {
  return apiRequest.get("/social/notification/user", {
    params: { limit, offset },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function markNotificationAsRead(
  notificationId: string,
  token: string
): Promise<Notification> {
  return apiRequest.patch(
    `/social/notification/${notificationId}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function markAllNotificationsAsRead(
  token: string
): Promise<{ success: boolean }> {
  return apiRequest.patch(
    "/social/notification/read/all",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function deleteNotification(
  notificationId: string,
  token: string
): Promise<{ deleted: boolean }> {
  return apiRequest.delete(`/social/notification/${notificationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function countNotifications(
  token: string
): Promise<{ count: number }> {
  return apiRequest.get("/social/notification/count", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
