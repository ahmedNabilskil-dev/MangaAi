import {
  blockUserComments,
  deleteComment,
  hideComment,
  reportComment,
  updateComment,
  updateCommentVisibility,
} from "@/lib/api/social/comments";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCommentActions(token: string) {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: any }) =>
      updateComment(commentId, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const report = useMutation({
    mutationFn: ({
      commentId,
      reason,
    }: {
      commentId: string;
      reason: string;
    }) => reportComment(commentId, reason, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const hide = useMutation({
    mutationFn: (commentId: string) => hideComment(commentId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const updateVisibility = useMutation({
    mutationFn: ({
      commentId,
      visibility,
    }: {
      commentId: string;
      visibility: "public" | "private" | "friends";
    }) => updateCommentVisibility(commentId, visibility, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const block = useMutation({
    mutationFn: (userId: string) => blockUserComments(userId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  return { remove, update, report, hide, updateVisibility, block };
}
