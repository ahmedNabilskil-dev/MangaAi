import { useShareMutation, useShares } from "@/hooks/useShares";
import { Share2 } from "lucide-react";
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Share2 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Failed to load shares
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!shares?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Share2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No shares yet
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          When people share this {targetType}, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Shares</h3>
            <p className="text-sm text-gray-600">{shares.length} shares</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {shares.map((shareItem) => {
          const initials = `U${shareItem.userId.slice(-2)}`;
          const gradients = [
            "from-green-500 to-emerald-500",
            "from-blue-500 to-cyan-500",
            "from-purple-500 to-violet-500",
            "from-orange-500 to-red-500",
            "from-indigo-500 to-blue-500",
          ];
          const gradient =
            gradients[shareItem.userId.length % gradients.length];

          return (
            <div
              key={shareItem._id}
              className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/30`}
              >
                <span>{initials}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">
                  User {shareItem.userId.slice(-4)}
                </h4>
                {shareItem.comment && (
                  <p className="text-sm text-gray-700 mb-2 bg-white p-3 rounded-lg border border-gray-200">
                    "{shareItem.comment}"
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Shared {new Date(shareItem.createdAt).toLocaleDateString()}
                </p>
              </div>

              <ShareButton
                onClick={() => share.mutate()}
                disabled={share.isPending || unshare.isPending}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShareFeed;
