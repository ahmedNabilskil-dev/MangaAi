import React from "react";

interface FollowButtonProps {
  isFollowing: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onClick,
  disabled,
}) => {
  return (
    <button
      className={`px-4 py-1 rounded-full border transition text-sm font-medium ${
        isFollowing
          ? "bg-muted text-foreground border-border"
          : "bg-primary text-primary-foreground border-primary"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? "Unfollow" : "Follow"}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
