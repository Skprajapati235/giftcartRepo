"use client";

import React, { useEffect, useState } from "react";
import { getAllReviews, adminReplyReview, adminDeleteReview, adminBulkDeleteReviews, updateReviewStatus } from "../../services/reviewService";
import ReviewList from "./reviewList";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useToast } from "../../../context/ToastContext";
import { useResource } from "../../hooks/useResource";
import { Trash2 } from "lucide-react";

export interface Review {
  _id: string;
  product: { name: string; image: string; price: number } | null;
  user: { name: string; mobileNumber?: string; profilePic?: string };
  rating: number;
  comment: string;
  images: string[];
  likes: string[];
  dislikes: string[];
  reply?: string;
  replyAt?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ReviewsView() {
  const {
    data: reviews,
    loading,
    error,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<Review>(getAllReviews, "reviews");

  const { showToast } = useToast();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Clear selections when page or search changes
  useEffect(() => {
    setSelectedIds([]);
  }, [params.page, params.search]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminDeleteReview(deleteId);
      showToast("Review deleted successfully!", "success");
      refresh();
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
    } catch (error) {
      showToast("Failed to delete review", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await adminBulkDeleteReviews(selectedIds);
      showToast(`${selectedIds.length} reviews deleted successfully!`, "success");
      refresh();
      setIsBulkDeleting(false);
      setSelectedIds([]);
    } catch (error) {
      showToast("Failed to delete selected reviews", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleStatusUpdate = async (reviewId: string, status: string) => {
    try {
      await updateReviewStatus(reviewId, status);
      showToast(`Review ${status} successfully!`, "success");
      refresh();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Customer Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and moderate customer feedback across all products.</p>
        </div>

        {selectedIds.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-200">
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-3xl bg-rose-50 p-6 text-rose-700 font-bold border border-rose-200">
          {error}
        </div>
      )}

      <ReviewList
        reviews={reviews}
        loading={loading}
        total={total}
        totalPages={totalPages}
        currentPage={params.page}
        searchTerm={params.search}
        onPageChange={onPageChange}
        onSearchChange={onSearchChange}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={isBulkDeleting}
        title="Delete Selected Reviews"
        message={`Are you sure you want to delete ${selectedIds.length} selected review(s)? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleting(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
