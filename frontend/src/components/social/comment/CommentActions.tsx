import { useCommentActions } from "@/hooks/useCommentActions";
import { useLike } from "@/hooks/useLike";
import { Comment } from "@/lib/api/social/comments";
import React, { useState } from "react";
import LikeButton from "../like/LikeButton";
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
  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editVisibility, setEditVisibility] = useState(comment.visibility);
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmHide, setShowConfirmHide] = useState(false);
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);

  const likeCount = likes.length;
  const liked = !!userLike;

  return (
    <div className="relative z-10 flex flex-wrap gap-2 pt-2 pb-1 px-2 rounded-xl bg-gradient-to-r from-white/80 to-slate-50/80 shadow-sm border border-border mt-2 items-center backdrop-blur-md">
      <LikeButton
        liked={liked}
        count={likeCount}
        onClick={() => {
          if (liked) {
            unlike("like");
          } else {
            like("like");
          }
        }}
        disabled={likeLoading || unlikeLoading}
        aria-label={liked ? "Unlike" : "Like"}
      />
      <button className="icon-btn" aria-label="Reply" title="Reply">
        <span className="material-symbols-rounded text-lg">reply</span>
        <span className="hidden sm:inline">Reply</span>
      </button>
      <button
        className="icon-btn"
        aria-label="Edit"
        title="Edit"
        onClick={() => setShowEdit((v) => !v)}
      >
        <span className="material-symbols-rounded text-lg">edit</span>
        <span className="hidden sm:inline">Edit</span>
      </button>
      <button
        className="icon-btn text-destructive border-destructive hover:bg-destructive/10"
        aria-label="Delete"
        title="Delete"
        onClick={() => setShowConfirmDelete(true)}
        disabled={remove.isPending}
      >
        <span className="material-symbols-rounded text-lg">delete</span>
        <span className="hidden sm:inline">
          {remove.isPending ? "..." : "Delete"}
        </span>
      </button>
      <button
        className="icon-btn text-warning border-warning hover:bg-warning/10"
        aria-label="Report"
        title="Report"
        onClick={() => setShowReport(true)}
        disabled={report.isPending}
      >
        <span className="material-symbols-rounded text-lg">flag</span>
        <span className="hidden sm:inline">
          {report.isPending ? "..." : "Report"}
        </span>
      </button>
      <button
        className="icon-btn text-muted-foreground border-muted-foreground hover:bg-primary/10"
        aria-label="Hide"
        title="Hide"
        onClick={() => setShowConfirmHide(true)}
        disabled={hide.isPending}
      >
        <span className="material-symbols-rounded text-lg">visibility_off</span>
        <span className="hidden sm:inline">
          {hide.isPending ? "..." : "Hide"}
        </span>
      </button>
      <select
        className="rounded border px-2 py-1 text-xs bg-white/80 shadow-sm focus:ring-2 focus:ring-primary outline-none"
        value={editVisibility}
        onChange={(e) => {
          setEditVisibility(e.target.value as "public" | "private" | "friends");
          updateVisibility.mutate({
            commentId: comment._id,
            visibility: e.target.value as "public" | "private" | "friends",
          });
        }}
        disabled={updateVisibility.isPending}
        aria-label="Change visibility"
        title="Change visibility"
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="friends">Friends</option>
      </select>
      <button
        className="icon-btn text-muted-foreground border-muted-foreground hover:bg-primary/10"
        aria-label="Block User"
        title="Block User"
        onClick={() => setShowConfirmBlock(true)}
        disabled={block.isPending}
      >
        <span className="material-symbols-rounded text-lg">block</span>
        <span className="hidden sm:inline">
          {block.isPending ? "..." : "Block User"}
        </span>
      </button>

      {/* Modals/Dialogs */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-3 border border-border">
            <h3 className="font-semibold text-lg mb-2">Edit Comment</h3>
            <textarea
              className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                onClick={() => {
                  update.mutate({
                    commentId: comment._id,
                    data: { content: editContent, visibility: editVisibility },
                  });
                  setShowEdit(false);
                }}
                disabled={update.isPending}
              >
                {update.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-3 border border-border">
            <h3 className="font-semibold text-lg mb-2">Report Comment</h3>
            <input
              className="w-full border rounded p-2 focus:ring-2 focus:ring-warning outline-none"
              placeholder="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80"
                onClick={() => setShowReport(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-warning text-warning-foreground hover:bg-warning/90 shadow"
                onClick={() => {
                  report.mutate({
                    commentId: comment._id,
                    reason: reportReason,
                  });
                  setShowReport(false);
                }}
                disabled={report.isPending || !reportReason}
              >
                {report.isPending ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-3 border border-border">
            <h3 className="font-semibold text-lg mb-2">Delete Comment?</h3>
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow"
                onClick={() => {
                  remove.mutate(comment._id);
                  setShowConfirmDelete(false);
                }}
                disabled={remove.isPending}
              >
                {remove.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmHide && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-3 border border-border">
            <h3 className="font-semibold text-lg mb-2">Hide Comment?</h3>
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80"
                onClick={() => setShowConfirmHide(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                onClick={() => {
                  hide.mutate(comment._id);
                  setShowConfirmHide(false);
                }}
                disabled={hide.isPending}
              >
                {hide.isPending ? "Hiding..." : "Hide"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmBlock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-3 border border-border">
            <h3 className="font-semibold text-lg mb-2">
              Block All Comments from User?
            </h3>
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80"
                onClick={() => setShowConfirmBlock(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                onClick={() => {
                  block.mutate(comment.userId);
                  setShowConfirmBlock(false);
                }}
                disabled={block.isPending}
              >
                {block.isPending ? "Blocking..." : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom styles for icon buttons */}
      <style jsx>{`
        .icon-btn {
          @apply flex items-center gap-1 px-2 py-1 rounded-full border border-border bg-white/70 hover:bg-primary/10 transition text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-primary;
        }
      `}</style>
    </div>
  );
};

export default CommentActions;
