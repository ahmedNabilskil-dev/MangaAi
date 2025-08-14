import { apiRequest } from "@/lib/api-client";

// --- Types ---
export interface Post {
  _id: string;
  userId: string;
  content: string;
  images?: string[];
  attachments?: string[];
  targetId?: string;
  targetType?: string;
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  content: string;
  images?: string[];
  attachments?: string[];
  targetId?: string;
  targetType?: string;
  visibility?: "public" | "private" | "friends";
}

export interface UpdatePostDto {
  content?: string;
  images?: string[];
  attachments?: string[];
  visibility?: "public" | "private" | "friends";
}

// --- API Functions ---

export async function createPost(
  data: CreatePostDto,
  token: string
): Promise<Post> {
  return apiRequest.post("/social/post", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getPosts(limit = 20, offset = 0): Promise<Post[]> {
  return apiRequest.get("/social/post", { params: { limit, offset } });
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  return apiRequest.get(`/social/post/user/${userId}`);
}

export async function getPostById(postId: string): Promise<Post> {
  return apiRequest.get(`/social/post/${postId}`);
}

export async function updatePost(
  postId: string,
  updates: UpdatePostDto,
  token: string
): Promise<Post> {
  return apiRequest.patch(`/social/post/${postId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deletePost(
  postId: string,
  token: string
): Promise<{ deleted: boolean }> {
  return apiRequest.delete(`/social/post/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function countPosts(params?: {
  userId?: string;
  targetType?: string;
}): Promise<{ count: number }> {
  return apiRequest.get("/social/post/count", { params });
}

export async function searchPosts(
  q: string,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  return apiRequest.get("/social/post/search", {
    params: { q, limit, offset },
  });
}

export async function filterPosts(params: {
  visibility?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  return apiRequest.get("/social/post/filter", { params });
}

export async function getPostsByHashtag(
  hashtag: string,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  return apiRequest.get(`/social/post/hashtag/${hashtag}`, {
    params: { limit, offset },
  });
}

export async function getPostsByMention(
  username: string,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  return apiRequest.get(`/social/post/mention/${username}`, {
    params: { limit, offset },
  });
}

export async function updatePostVisibility(
  postId: string,
  visibility: "public" | "private" | "friends",
  token: string
): Promise<Post> {
  return apiRequest.patch(
    `/social/post/${postId}/visibility`,
    { visibility },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function reportPost(
  postId: string,
  reason: string,
  token: string
): Promise<any> {
  return apiRequest.post(
    `/social/post/${postId}/report`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function hidePost(postId: string, token: string): Promise<any> {
  return apiRequest.post(
    `/social/post/${postId}/hide`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function blockUserPosts(
  blockedUserId: string,
  token: string
): Promise<any> {
  return apiRequest.post(
    `/social/post/block/${blockedUserId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
