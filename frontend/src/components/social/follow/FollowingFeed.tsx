import { useFollowing, useFollowMutation } from "@/hooks/useFollows";
import React from "react";
import FollowButton from "./FollowButton";
// Replace with real token
const fakeToken = "demo-token";

interface FollowingFeedProps {
  userId: string;
}

const FollowingFeed: React.FC<FollowingFeedProps> = ({ userId }) => {
  const { data: following, isLoading, isError, refetch } = useFollowing(userId);
  const { follow, unfollow } = useFollowMutation(userId, fakeToken);

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading following...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Failed to load following.
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
  if (!following?.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Not following anyone yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {following.map((f) => (
        <div
          key={f._id}
          className="flex items-center gap-3 p-2 bg-muted rounded-lg"
        >
          <span className="font-medium text-foreground">
            User {f.followingId.slice(-4)}
          </span>
          <FollowButton
            isFollowing={true}
            onClick={() => {
              // Toggle follow/unfollow (for demo, always unfollow)
              unfollow.mutate(f.followingId);
            }}
            disabled={follow.isPending || unfollow.isPending}
          />
        </div>
      ))}
    </div>
  );
};

export default FollowingFeed;
