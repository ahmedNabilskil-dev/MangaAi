import { useShareMutation, useShares } from "@/hooks/useShares";
import React from "react";
import ShareButton from "./ShareButton";
// Replace with real token
const fakeToken = "demo-token";

type TargetType = "manga" | "chapter" | "scene" | "panel";

interface ShareFeedProps {
  targetType: TargetType;
  targetId: string;
}

const ShareFeed: React.FC<ShareFeedProps> = ({ targetType, targetId }) => {
  const {
    data: shares,
    isLoading,
    isError,
    refetch,
  } = useShares(targetType, targetId);
  const { share, unshare } = useShareMutation(targetType, targetId, fakeToken);

  if (!targetType || !targetId) return null;

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading shares...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Failed to load shares.
        <br />
        <button
          className="mt-2 px-3 py-1 rounded bg-primary text-primary-foreground"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!shares?.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No shares yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {shares.map((s) => (
        <div
          key={s._id}
          className="flex items-center gap-3 p-2 bg-muted rounded-lg"
        >
          <span className="font-medium text-foreground">
            User {s.userId.slice(-4)}
          </span>
          <span className="text-xs text-muted-foreground">{s.comment}</span>
          <ShareButton
            onClick={() => {
              // Toggle share/unshare (for demo, always share)
              share.mutate();
            }}
            disabled={share.isPending || unshare.isPending}
          />
        </div>
      ))}
    </div>
  );
};

export default ShareFeed;
