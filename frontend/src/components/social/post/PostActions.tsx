"use client";
import { useLike } from "@/hooks/useLike";
import { usePostActions } from "@/hooks/usePostActions";
import { Post } from "@/lib/api/social/posts";
import React, { useState } from "react";
import LikeButton from "../like/LikeButton";
// You should replace these with your actual auth context/store
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
  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmHide, setShowConfirmHide] = useState(false);
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);

  const likeCount = likes.length;
  const liked = !!userLike;

  return (
    <div className="flex flex-wrap gap-3 pt-2 border-t border-border mt-2 items-center">
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
      />
      <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition">
        <span className="material-symbols-rounded">chat_bubble</span>
        <span>Comment</span>
      </button>
      <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition">
        <span className="material-symbols-rounded">share</span>
        <span>Share</span>
      </button>
      {/* Edit */}
      <button
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
        onClick={() => setShowEdit((v) => !v)}
      >
        <span className="material-symbols-rounded">edit</span>
        <span>Edit</span>
      </button>
      {/* Delete */}
      <button
        className="flex items-center gap-1 text-destructive hover:text-destructive-foreground transition"
        onClick={() => setShowConfirmDelete(true)}
        disabled={remove.isPending}
      >
        <span className="material-symbols-rounded">delete</span>
        <span>{remove.isPending ? "..." : "Delete"}</span>
      </button>
      {/* Report */}
      <button
        className="flex items-center gap-1 text-warning hover:text-warning-foreground transition"
        onClick={() => setShowReport(true)}
        disabled={report.isPending}
      >
        <span className="material-symbols-rounded">flag</span>
        <span>{report.isPending ? "..." : "Report"}</span>
      </button>
      {/* Hide */}
      <button
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
        onClick={() => setShowConfirmHide(true)}
        disabled={hide.isPending}
      >
        <span className="material-symbols-rounded">visibility_off</span>
        <span>{hide.isPending ? "..." : "Hide"}</span>
      </button>
      {/* Visibility */}
      <select
        className="rounded border px-2 py-1 text-xs"
        value={editVisibility}
        onChange={(e) => {
          setEditVisibility(e.target.value as "public" | "private" | "friends");
          updateVisibility.mutate({
            postId: post._id,
            visibility: e.target.value as "public" | "private" | "friends",
          });
        }}
        disabled={updateVisibility.isPending}
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="friends">Friends</option>
      </select>
      {/* Block */}
      <button
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
        onClick={() => setShowConfirmBlock(true)}
        disabled={block.isPending}
      >
        <span className="material-symbols-rounded">block</span>
        <span>{block.isPending ? "..." : "Block User"}</span>
      </button>

      {/* Modals/Dialogs */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-md flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">Edit Post</h3>
            <textarea
              className="w-full border rounded p-2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-muted"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={() => {
                  update.mutate({
                    postId: post._id,
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-md flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">Report Post</h3>
            <input
              className="w-full border rounded p-2"
              placeholder="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-muted"
                onClick={() => setShowReport(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-warning text-warning-foreground"
                onClick={() => {
                  report.mutate({ postId: post._id, reason: reportReason });
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-sm flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">Delete Post?</h3>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-muted"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-destructive text-destructive-foreground"
                onClick={() => {
                  remove.mutate(post._id);
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-sm flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">Hide Post?</h3>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-muted"
                onClick={() => setShowConfirmHide(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={() => {
                  hide.mutate(post._id);
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-sm flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">
              Block All Posts from User?
            </h3>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-muted"
                onClick={() => setShowConfirmBlock(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={() => {
                  block.mutate(post.userId);
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
    </div>
  );
};

export default PostActions;
