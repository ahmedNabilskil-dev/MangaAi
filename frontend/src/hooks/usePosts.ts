import { getPosts, Post } from "@/lib/api/social/posts";
import { useQuery } from "@tanstack/react-query";

export function usePosts(limit = 20, offset = 0) {
  return useQuery<Post[], Error>({
    queryKey: ["posts", limit, offset],
    queryFn: () => getPosts(limit, offset),
    staleTime: 1000 * 60, // 1 minute
  });
}
