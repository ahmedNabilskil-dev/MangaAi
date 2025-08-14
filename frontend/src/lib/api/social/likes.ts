import { apiRequest } from "@/lib/api-client";
import "@/lib/axios-config";

// --- Types ---
export interface Like {
  _id: string;
  userId: string;
  targetId: string;
  targetType: "post" | "comment";
  reaction: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  createdAt: string;
  updatedAt: string;
}

export interface LikeDto {
  targetId: string;
  targetType: "post" | "comment";
  reaction: "like" | "love" | "haha" | "wow" | "sad" | "angry";
}

// --- API Functions ---

export async function likeTarget(data: LikeDto, token: string): Promise<Like> {
  return apiRequest.post("/social/like", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function unlikeTarget(
  data: LikeDto,
  token: string
): Promise<{ deleted: boolean }> {
  return apiRequest.delete("/social/like", {
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getLikesForTarget(
  targetType: "post" | "comment",
  targetId: string
): Promise<Like[]> {
  return apiRequest.get("/social/like", { params: { targetType, targetId } });
}

export async function getLikesByUser(userId: string): Promise<Like[]> {
  return apiRequest.get(`/social/like/user/${userId}`);
}

export async function countLikesForTarget(
  targetType: "post" | "comment",
  targetId: string
): Promise<{ count: number }> {
  return apiRequest.get("/social/like/count", {
    params: { targetType, targetId },
  });
}

export async function countLikesByReaction(
  targetType: "post" | "comment",
  targetId: string
): Promise<Record<string, number>> {
  return apiRequest.get("/social/like/count-by-reaction", {
    params: { targetType, targetId },
  });
}
