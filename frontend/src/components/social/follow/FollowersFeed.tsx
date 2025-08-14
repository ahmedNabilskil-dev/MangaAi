import { useFollowers, useFollowMutation } from "@/hooks/useFollows";
import React from "react";
import FollowButton from "./FollowButton";
// Replace with real token
const fakeToken = "demo-token";

interface FollowersFeedProps {
  userId: string;
}

const FollowersFeed: React.FC<FollowersFeedProps> = ({ userId }) => {
  const { data: followers, isLoading, isError, refetch } = useFollowers(userId);
  const { follow, unfollow } = useFollowMutation(userId, fakeToken);

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading followers...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Failed to load followers.
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
  if (!followers?.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No followers yet.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {followers.map((f) => (
        <div
          key={f._id}
          className="flex items-center gap-3 p-2 bg-muted rounded-lg"
        >
          <span className="font-medium text-foreground">
            User {f.userId.slice(-4)}
          </span>
          <FollowButton
            isFollowing={true}
            onClick={() => {
              // Toggle follow/unfollow (for demo, always unfollow)
              unfollow.mutate(f.userId);
            }}
            disabled={follow.isPending || unfollow.isPending}
          />
        </div>
      ))}
    </div>
  );
};

export default FollowersFeed;
