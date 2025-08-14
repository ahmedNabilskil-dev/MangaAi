import { apiRequest } from "@/lib/api-client";

// --- Types ---
export interface Follow {
  _id: string;
  userId: string;
  followingId: string;
  createdAt: string;
  updatedAt: string;
}

// --- API Functions ---

export async function followUser(
  followingId: string,
  token: string
): Promise<Follow> {
  return apiRequest.post(
    "/social/follow",
    { followingId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function unfollowUser(
  followingId: string,
  token: string
): Promise<{ deleted: boolean }> {
  return apiRequest.delete(`/social/follow/${followingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getFollowers(
  userId: string,
  limit = 20,
  offset = 0
): Promise<Follow[]> {
  return apiRequest.get(`/social/follow/followers/${userId}`, {
    params: { limit, offset },
  });
}

export async function getFollowing(
  userId: string,
  limit = 20,
  offset = 0
): Promise<Follow[]> {
  return apiRequest.get(`/social/follow/following/${userId}`, {
    params: { limit, offset },
  });
}

export async function getMutualFollowers(
  userIdA: string,
  userIdB: string
): Promise<Follow[]> {
  return apiRequest.get(`/social/follow/mutual/${userIdA}/${userIdB}`);
}

export async function getFollowStatus(
  followerId: string,
  followingId: string
): Promise<{ isFollowing: boolean }> {
  return apiRequest.get(`/social/follow/status/${followerId}/${followingId}`);
}

export async function blockUser(
  blockedUserId: string,
  token: string
): Promise<{ blocked: boolean }> {
  return apiRequest.post(
    `/social/follow/block/${blockedUserId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function unblockUser(
  blockedUserId: string,
  token: string
): Promise<{ unblocked: boolean }> {
  return apiRequest.post(
    `/social/follow/unblock/${blockedUserId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function reportUser(
  reportedUserId: string,
  reason: string,
  token: string
): Promise<{ reported: boolean; reason: string }> {
  return apiRequest.post(
    `/social/follow/report/${reportedUserId}`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
