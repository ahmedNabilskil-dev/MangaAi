import { UserCheck, UserPlus } from "lucide-react";
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
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
        isFollowing
          ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-red-100 hover:to-pink-100 hover:text-red-600 border border-gray-300 hover:border-red-300"
          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl border border-transparent"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 group-hover:hidden" />
          <UserPlus className="w-4 h-4 hidden group-hover:block" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:block">Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
