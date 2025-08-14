import {
  getLikesForTarget,
  Like,
  LikeDto,
  likeTarget,
  unlikeTarget,
} from "@/lib/api/social/likes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useLike(
  targetType: "post" | "comment",
  targetId: string,
  userId: string,
  token: string
) {
  const queryClient = useQueryClient();

  // Fetch all likes for this target
  const { data: likes = [], isLoading } = useQuery<Like[]>({
    queryKey: ["likes", targetType, targetId],
    queryFn: () => getLikesForTarget(targetType, targetId),
    enabled: !!targetId,
  });

  // Check if current user liked
  const userLike = likes.find((l) => l.userId === userId);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (reaction: LikeDto["reaction"]) =>
      likeTarget({ targetType, targetId, reaction }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["likes", targetType, targetId],
      });
    },
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: (reaction: LikeDto["reaction"]) =>
      unlikeTarget({ targetType, targetId, reaction }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["likes", targetType, targetId],
      });
    },
  });

  return {
    likes,
    isLoading,
    userLike,
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    likeLoading: likeMutation.isPending,
    unlikeLoading: unlikeMutation.isPending,
  };
}
