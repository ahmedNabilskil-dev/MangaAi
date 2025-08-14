import { apiRequest } from "@/lib/api-client";

// --- Types ---
export interface Comment {
  _id: string;
  postId: string;
  parentId?: string;
  userId: string;
  content: string;
  attachments?: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  postId: string;
  parentId?: string;
  content: string;
  attachments?: string[];
  visibility?: "public" | "private" | "friends";
}

export interface UpdateCommentDto {
  content?: string;
  attachments?: string[];
  visibility?: "public" | "private" | "friends";
}

// --- API Functions ---

export async function createComment(
  data: CreateCommentDto,
  token: string
): Promise<Comment> {
  return apiRequest.post("/social/comment", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  return apiRequest.get(`/social/comment/post/${postId}`);
}

export async function getCommentsByUser(userId: string): Promise<Comment[]> {
  return apiRequest.get(`/social/comment/user/${userId}`);
}

export async function getCommentById(commentId: string): Promise<Comment> {
  return apiRequest.get(`/social/comment/${commentId}`);
}

export async function updateComment(
  commentId: string,
  updates: UpdateCommentDto,
  token: string
): Promise<Comment> {
  return apiRequest.patch(`/social/comment/${commentId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteComment(
  commentId: string,
  token: string
): Promise<{ deleted: boolean }> {
  return apiRequest.delete(`/social/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function countComments(params?: {
  postId?: string;
}): Promise<{ count: number }> {
  return apiRequest.get("/social/comment/count", { params });
}

export async function searchComments(
  q: string,
  limit = 20,
  offset = 0
): Promise<Comment[]> {
  return apiRequest.get("/social/comment/search", {
    params: { q, limit, offset },
  });
}

export async function filterComments(params: {
  visibility?: string;
  limit?: number;
  offset?: number;
}): Promise<Comment[]> {
  return apiRequest.get("/social/comment/filter", { params });
}

export async function getCommentsByHashtag(
  hashtag: string,
  limit = 20,
  offset = 0
): Promise<Comment[]> {
  return apiRequest.get(`/social/comment/hashtag/${hashtag}`, {
    params: { limit, offset },
  });
}

export async function getCommentsByMention(
  username: string,
  limit = 20,
  offset = 0
): Promise<Comment[]> {
  return apiRequest.get(`/social/comment/mention/${username}`, {
    params: { limit, offset },
  });
}

export async function updateCommentVisibility(
  commentId: string,
  visibility: "public" | "private" | "friends",
  token: string
): Promise<Comment> {
  return apiRequest.patch(
    `/social/comment/${commentId}/visibility`,
    { visibility },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function reportComment(
  commentId: string,
  reason: string,
  token: string
): Promise<any> {
  return apiRequest.post(
    `/social/comment/${commentId}/report`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function hideComment(
  commentId: string,
  token: string
): Promise<any> {
  return apiRequest.post(
    `/social/comment/${commentId}/hide`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function blockUserComments(
  blockedUserId: string,
  token: string
): Promise<any> {
  return apiRequest.post(
    `/social/comment/block/${blockedUserId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
