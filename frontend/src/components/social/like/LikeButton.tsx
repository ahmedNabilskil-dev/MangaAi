import React from "react";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  liked,
  count,
  onClick,
  disabled,
}) => {
  return (
    <button
      className={`flex items-center gap-1 px-2 py-1 rounded transition text-sm ${
        liked ? "text-primary" : "text-muted-foreground"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <span className="material-symbols-rounded">thumb_up</span>
      <span>{count}</span>
    </button>
  );
};

export default LikeButton;
