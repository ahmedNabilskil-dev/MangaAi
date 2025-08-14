import { useCommentActions } from "@/hooks/useCommentActions";
import { useLike } from "@/hooks/useLike";
import { Comment } from "@/lib/api/social/comments";
import {
  Edit3,
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Shield,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

// Replace with real auth context/store
const fakeUserId = "demo-user-id";
const fakeToken = "demo-token";

interface CommentActionsProps {
  comment: Comment;
  userId?: string;
  token?: string;
}

const CommentActions: React.FC<CommentActionsProps> = ({
  comment,
  userId = fakeUserId,
  token = fakeToken,
}) => {
  const { likes, userLike, like, unlike, likeLoading, unlikeLoading } = useLike(
    "comment",
    comment._id,
    userId,
    token
  );
  const { remove, update, report, hide, updateVisibility, block } =
    useCommentActions(token);

  // UI State
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editVisibility, setEditVisibility] = useState(comment.visibility);
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
      <div className="ml-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={likeLoading || unlikeLoading}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
              liked
                ? "text-red-500 hover:text-red-600"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-200 ${
                liked ? "fill-current" : ""
              }`}
            />
            <span>{likeCount}</span>
          </button>

          {/* Reply Button */}
          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors duration-200">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amber-600 transition-colors duration-200"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* More Actions */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-10">
              <ActionMenuItem
                icon={<Edit3 className="w-3.5 h-3.5" />}
                text="Edit"
                onClick={() => {
                  setShowEditModal(true);
                  setShowDropdown(false);
                }}
              />
              <ActionMenuItem
                icon={<EyeOff className="w-3.5 h-3.5" />}
                text="Hide"
                onClick={() => {
                  hide.mutate(comment._id);
                  setShowDropdown(false);
                }}
                disabled={hide.isPending}
              />
              <ActionMenuItem
                icon={<Shield className="w-3.5 h-3.5" />}
                text="Block User"
                onClick={() => {
                  block.mutate(comment.userId);
                  setShowDropdown(false);
                }}
                disabled={block.isPending}
              />
              <div className="border-t border-gray-100 my-1" />
              <ActionMenuItem
                icon={<Trash2 className="w-3.5 h-3.5" />}
                text="Delete"
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

      {/* Edit Modal */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Comment
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-24 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Edit your comment..."
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    update.mutate({
                      commentId: comment._id,
                      data: {
                        content: editContent,
                        visibility: editVisibility,
                      },
                    });
                    setShowEditModal(false);
                  }}
                  disabled={update.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {update.isPending ? "Saving..." : "Save"}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Comment
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Help us understand what's wrong with this comment.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full h-20 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe the issue..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  report.mutate({
                    commentId: comment._id,
                    reason: reportReason,
                  });
                  setShowReportModal(false);
                }}
                disabled={report.isPending || !reportReason.trim()}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-red-700 hover:to-pink-700 disabled:opacity-50"
              >
                {report.isPending ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Comment?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  remove.mutate(comment._id);
                  setShowDeleteModal(false);
                }}
                disabled={remove.isPending}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-red-700 hover:to-pink-700 disabled:opacity-50"
              >
                {remove.isPending ? "Deleting..." : "Delete"}
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
    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
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

export default CommentActions;
