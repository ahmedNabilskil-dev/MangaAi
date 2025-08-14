import {
  getSharesForTarget,
  Share,
  shareTarget,
  unshareTarget,
} from "@/lib/api/social/shares";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export function useShareMutation(
  targetType: "manga" | "chapter" | "scene" | "panel",
  targetId: string,
  token: string
) {
  const queryClient = useQueryClient();
  const share = useMutation({
    mutationFn: () => shareTarget({ targetType, targetId }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shares", targetType, targetId],
      });
    },
  });
  const unshare = useMutation({
    mutationFn: () => unshareTarget(targetType, targetId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shares", targetType, targetId],
      });
    },
  });
  return { share, unshare };
}

export function useShares(targetType: string, targetId: string) {
  return useQuery<Share[], Error>({
    queryKey: ["shares", targetType, targetId],
    queryFn: () => getSharesForTarget(targetType, targetId),
    enabled: !!targetType && !!targetId,
    staleTime: 1000 * 60,
  });
}
