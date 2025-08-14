import { Share2 } from "lucide-react";
import React from "react";

interface ShareButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl border border-transparent"
      }`}
    >
      <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
      <span>Share</span>
    </button>
  );
};

export default ShareButton;
