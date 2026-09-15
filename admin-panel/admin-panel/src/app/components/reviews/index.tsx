"use client";

import React, { useEffect, useState } from "react";
import { getAllReviews, adminReplyReview, adminDeleteReview, updateReviewStatus } from "../../services/reviewService";
import ReviewList from "./reviewList";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useToast } from "../../../context/ToastContext";
import { useResource } from "../../hooks/useResource";

export interface Review {
  _id: string;
  product: { name: string; image: string; price: number } | null;
  user: { name: string; email: string; profilePic?: string };
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

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminDeleteReview(deleteId);
      showToast("Review deleted successfully!", "success");
      refresh();
      setDeleteId(null);
    } catch (error) {
      showToast("Failed to delete review", "error");
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Customer Reviews</h1>
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
      />
    </>
  );
}
