import { useFollowers, useFollowMutation } from "@/hooks/useFollows";
import { Users, UserX } from "lucide-react";
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
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
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Failed to load followers
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

  if (!followers?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserX className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No followers yet
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          When people follow this user, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Followers</h3>
            <p className="text-sm text-gray-600">
              {followers.length} followers
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {followers.map((follower) => {
          const initials = `U${follower.userId.slice(-2)}`;
          const gradients = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-red-500",
            "from-indigo-500 to-purple-500",
          ];
          const gradient = gradients[follower.userId.length % gradients.length];

          return (
            <div
              key={follower._id}
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/30`}
              >
                <span>{initials}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">
                  User {follower.userId.slice(-4)}
                </h4>
                <p className="text-sm text-gray-500">Followed recently</p>
              </div>

              <FollowButton
                isFollowing={true}
                onClick={() => unfollow.mutate(follower.userId)}
                disabled={follow.isPending || unfollow.isPending}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowersFeed;
