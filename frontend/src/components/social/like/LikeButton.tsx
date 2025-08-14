import { Heart } from "lucide-react";
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
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold text-sm border ${
        liked
          ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border-red-200 hover:from-red-100 hover:to-pink-100 shadow-md"
          : "bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-300 ${
          liked ? "fill-current scale-110" : "group-hover:scale-110"
        }`}
      />
      <span className="font-bold">{count}</span>
    </button>
  );
};

export default LikeButton;
