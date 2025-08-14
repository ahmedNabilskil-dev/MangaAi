"use client";
import { useLike } from "@/hooks/useLike";
import { usePostActions } from "@/hooks/usePostActions";
import { Post } from "@/lib/api/social/posts";
import {
  Bookmark,
  Edit3,
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  Shield,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

// Replace with your actual auth context/store
const fakeUserId = "demo-user-id";
const fakeToken = "demo-token";

interface PostActionsProps {
  post: Post;
  userId?: string;
  token?: string;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  userId = fakeUserId,
  token = fakeToken,
}) => {
  const { likes, userLike, like, unlike, likeLoading, unlikeLoading } = useLike(
    "post",
    post._id,
    userId,
    token
  );
  const { remove, update, report, hide, updateVisibility, block } =
    usePostActions(token);

  // UI State
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [reportReason, setReportReason] = useState("");

  const likeCount = likes.length;
  const liked = !!userLike;

  const handleLike = () => {
    if (liked) {
      unlike("like");
    } else {
      like("like");
    }
  };

  return (
    <>
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          {/* Main Actions */}
          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={likeLoading || unlikeLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm ${
                liked
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-white hover:bg-gray-50 text-gray-600 hover:text-red-500 border border-gray-200"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  liked ? "fill-current" : ""
                }`}
              />
              <span>{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 transition-all duration-200 font-medium text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>Comment</span>
            </button>

            {/* Share Button */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-green-50 text-gray-600 hover:text-green-600 border border-gray-200 transition-all duration-200 font-medium text-sm">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* More Actions */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                <ActionMenuItem
                  icon={<Bookmark className="w-4 h-4" />}
                  text="Save Post"
                  onClick={() => setShowDropdown(false)}
                />
                <ActionMenuItem
                  icon={<Edit3 className="w-4 h-4" />}
                  text="Edit Post"
                  onClick={() => {
                    setShowEditModal(true);
                    setShowDropdown(false);
                  }}
                />
                <ActionMenuItem
                  icon={<Flag className="w-4 h-4" />}
                  text="Report Post"
                  onClick={() => {
                    setShowReportModal(true);
                    setShowDropdown(false);
                  }}
                />
                <ActionMenuItem
                  icon={<EyeOff className="w-4 h-4" />}
                  text="Hide Post"
                  onClick={() => {
                    hide.mutate(post._id);
                    setShowDropdown(false);
                  }}
                  disabled={hide.isPending}
                />
                <ActionMenuItem
                  icon={<Shield className="w-4 h-4" />}
                  text="Block User"
                  onClick={() => {
                    block.mutate(post.userId);
                    setShowDropdown(false);
                  }}
                  disabled={block.isPending}
                />
                <div className="border-t border-gray-100 my-1" />
                <ActionMenuItem
                  icon={<Trash2 className="w-4 h-4" />}
                  text="Delete Post"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowDropdown(false);
                  }}
                  destructive
                  disabled={remove.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Post
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's on your mind?"
            />
            <div className="flex items-center justify-between mt-4">
              <select
                value={editVisibility}
                onChange={(e) =>
                  setEditVisibility(
                    e.target.value as "public" | "private" | "friends"
                  )
                }
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Private</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    update.mutate({
                      postId: post._id,
                      data: {
                        content: editContent,
                        visibility: editVisibility,
                      },
                    });
                    setShowEditModal(false);
                  }}
                  disabled={update.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {update.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <Modal onClose={() => setShowReportModal(false)}>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Report Post
            </h3>
            <p className="text-gray-600 mb-4">
              Help us understand what's wrong with this post.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full h-24 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe the issue..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  report.mutate({ postId: post._id, reason: reportReason });
                  setShowReportModal(false);
                }}
                disabled={report.isPending || !reportReason.trim()}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 disabled:opacity-50"
              >
                {report.isPending ? "Reporting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Delete Post?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Your post will be permanently
              deleted.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  remove.mutate(post._id);
                  setShowDeleteModal(false);
                }}
                disabled={remove.isPending}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 disabled:opacity-50"
              >
                {remove.isPending ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// Helper Components
const ActionMenuItem = ({
  icon,
  text,
  onClick,
  destructive = false,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
      destructive ? "text-red-600 hover:bg-red-50" : "text-gray-700"
    }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
);

export default PostActions;
