import { Comment, getCommentsByPost } from "@/lib/api/social/comments";
import { useQuery } from "@tanstack/react-query";

export function useComments(postId: string) {
  return useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPost(postId),
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 minute
  });
}
