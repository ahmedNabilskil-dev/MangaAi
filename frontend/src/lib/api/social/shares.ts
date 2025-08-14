import { apiRequest } from "@/lib/api-client";

// --- Types ---
export interface Share {
  _id: string;
  userId: string;
  targetType: "manga" | "chapter" | "scene" | "panel";
  targetId: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareDto {
  targetType: "manga" | "chapter" | "scene" | "panel";
  targetId: string;
  comment?: string;
}

// --- API Functions ---

export async function shareTarget(
  data: CreateShareDto,
  token: string
): Promise<Share> {
  return apiRequest.post("/social/share", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function unshareTarget(
  targetType: string,
  targetId: string,
  token: string
): Promise<{ deleted: boolean }> {
  return apiRequest.delete("/social/share", {
    params: { targetType, targetId },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSharesForTarget(
  targetType: string,
  targetId: string
): Promise<Share[]> {
  return apiRequest.get("/social/share", { params: { targetType, targetId } });
}

export async function getSharesByUser(userId: string): Promise<Share[]> {
  return apiRequest.get(`/social/share/user/${userId}`);
}

export async function countShares(
  targetType: string,
  targetId: string
): Promise<{ count: number }> {
  return apiRequest.get("/social/share/count", {
    params: { targetType, targetId },
  });
}

export async function getSharesByType(targetType: string): Promise<Share[]> {
  return apiRequest.get(`/social/share/type/${targetType}`);
}
