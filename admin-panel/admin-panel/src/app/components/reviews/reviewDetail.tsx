"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviewDetail, replyReview, updateReview, deleteReview } from "../../services/adminService";
import { useTheme } from "../../context/ThemeContext";

export default function ReviewDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;
      try {
        const data = await getReviewDetail(id);
        setReview(data);
        setReplyText(data.adminReply?.message || "");
        setEditRating(data.rating || 0);
        setEditComment(data.comment || "");
      } catch (err) {
        console.error("Fetch review detail error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const onReply = async () => {
    if (!id || !replyText.trim()) return;
    try {
      setSavingReply(true);
      await replyReview(id, replyText.trim());
      const data = await getReviewDetail(id);
      setReview(data);
      setReplyText(data.adminReply?.message || "");
    } catch (err) {
      console.error("Reply failed", err);
      alert("Unable to send reply.");
    } finally {
      setSavingReply(false);
    }
  };

  const onSaveUpdate = async () => {
    if (!id) return;
    try {
      setSavingUpdate(true);
      await updateReview(id, { rating: editRating, comment: editComment });
      const data = await getReviewDetail(id);
      setReview(data);
      setEditMode(false);
    } catch (err) {
      console.error("Update failed", err);
      alert("Unable to update review.");
    } finally {
      setSavingUpdate(false);
    }
  };

  const onDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this review?")) return;
    try {
      setDeleting(true);
      await deleteReview(id);
      router.push("/reviews");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Unable to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  const pageWrapper = theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";

  if (loading) {
    return <div className="p-20 text-center text-slate-400">Loading review details...</div>;
  }

  if (!review) {
    return <div className="p-20 text-center text-slate-400">Review not found.</div>;
  }

  return (
    <div className={pageWrapper}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Detail</h1>
          <p className="text-sm text-slate-500">Review by {review.user?.name || "Unknown"} for {review.product?.name || "Product"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Review"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Review Overview</h2>
                <p className="text-sm text-slate-500">Submitted on {new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">{review.rating?.toFixed(1)} ★</span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-400">Product</h3>
                <div className="flex items-center gap-4">
                  {review.product?.image ? (
                    <img src={review.product.image} alt={review.product.name} className="h-20 w-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">No image</div>
                  )}
                  <div>
                    <p className="font-semibold">{review.product?.name || "Product"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-400">Customer</h3>
                <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                  <div><span className="font-semibold">Name:</span> {review.user?.name}</div>
                  <div><span className="font-semibold">Email:</span> {review.user?.email}</div>
                  <div><span className="font-semibold">Phone:</span> {review.user?.mobileNumber || "-"}</div>
                  <div><span className="font-semibold">Location:</span> {review.user?.city || ""}{review.user?.state ? ", " + review.user.state : ""}</div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-400">Comment</h3>
                <p className="rounded-3xl border border-border-theme bg-hover-theme p-6 text-slate-700">{review.comment}</p>
              </div>

              {review.images?.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Uploaded Images</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {review.images.map((image: string, index: number) => (
                      <img key={index} src={image} alt={`Review image ${index + 1}`} className="h-40 w-full rounded-3xl object-cover border border-border-theme" />
                    ))}
                  </div>
                </div>
              )}

              {review.adminReply?.message && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-700">Admin Reply</h3>
                  <p className="text-slate-700">{review.adminReply.message}</p>
                  <p className="mt-3 text-xs text-slate-500">Replied on {new Date(review.adminReply.repliedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Admin Actions</h2>
                <p className="text-sm text-slate-500">Reply to the user or update the review details.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">Reply message</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full rounded-3xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={onReply}
                  disabled={savingReply || !replyText.trim()}
                  className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingReply ? "Sending reply..." : "Send Reply"}
                </button>
              </div>

              <div className="border-t border-border-theme pt-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Edit Review</h3>
                    <p className="text-sm text-slate-500">Update the score or comment if needed.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditMode((prev) => !prev)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-slate-600">
                        Rating
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                          className="mt-2 w-full rounded-3xl border border-border-theme bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </label>
                    </div>
                    <label className="block text-sm font-semibold text-slate-600">
                      Comment
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={4}
                        className="mt-2 w-full rounded-3xl border border-border-theme bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={onSaveUpdate}
                      disabled={savingUpdate || editRating < 1 || editRating > 5 || !editComment.trim()}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {savingUpdate ? "Saving..." : "Save Review Changes"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border-theme p-6 text-sm text-slate-500">
                    Current rating: <span className="font-semibold text-slate-900">{review.rating}</span>, current comment length: <span className="font-semibold text-slate-900">{(review.comment || "").length}</span>.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <h2 className="mb-6 text-lg font-bold">Review Summary</h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Review ID</span>
                <span className="text-slate-400">{review._id}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Order ID</span>
                <span className="text-slate-400">{review.order?._id || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Order status</span>
                <span className="text-slate-400">{review.order?.status || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Created</span>
                <span className="text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">Last updated</span>
                <span className="text-slate-400">{new Date(review.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
