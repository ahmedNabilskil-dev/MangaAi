import {
  blockUserPosts,
  deletePost,
  hidePost,
  reportPost,
  updatePost,
  updatePostVisibility,
} from "@/lib/api/social/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function usePostActions(token: string) {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (postId: string) => deletePost(postId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: any }) =>
      updatePost(postId, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const report = useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      reportPost(postId, reason, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const hide = useMutation({
    mutationFn: (postId: string) => hidePost(postId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updateVisibility = useMutation({
    mutationFn: ({
      postId,
      visibility,
    }: {
      postId: string;
      visibility: "public" | "private" | "friends";
    }) => updatePostVisibility(postId, visibility, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const block = useMutation({
    mutationFn: (userId: string) => blockUserPosts(userId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { remove, update, report, hide, updateVisibility, block };
}
