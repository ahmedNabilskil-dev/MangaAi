import React from "react";

interface ShareButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      className={`flex items-center gap-1 px-3 py-1 rounded bg-accent text-accent-foreground transition text-sm ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/10"
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-label="Share"
    >
      <span className="material-symbols-rounded">share</span>
      <span>Share</span>
    </button>
  );
};

export default ShareButton;
