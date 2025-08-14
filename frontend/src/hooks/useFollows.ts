import {
  Follow,
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "@/lib/api/social/follows";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export function useFollowMutation(userId: string, token: string) {
  const queryClient = useQueryClient();
  const follow = useMutation({
    mutationFn: (followingId: string) => followUser(followingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
    },
  });
  const unfollow = useMutation({
    mutationFn: (followingId: string) => unfollowUser(followingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
      queryClient.invalidateQueries({ queryKey: ["following", userId] });
    },
  });
  return { follow, unfollow };
}

export function useFollowers(userId: string, limit = 20, offset = 0) {
  return useQuery<Follow[], Error>({
    queryKey: ["followers", userId, limit, offset],
    queryFn: () => getFollowers(userId, limit, offset),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useFollowing(userId: string, limit = 20, offset = 0) {
  return useQuery<Follow[], Error>({
    queryKey: ["following", userId, limit, offset],
    queryFn: () => getFollowing(userId, limit, offset),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}
