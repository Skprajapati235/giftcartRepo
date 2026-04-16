"use client";

import React, { useEffect, useState } from "react";
import { getAllReviews, adminReplyReview, adminDeleteReview, updateReviewStatus } from "../../services/reviewService";
import ReviewList from "./reviewList";
import { useToast } from "../../../context/ToastContext";
import { useResource } from "../../hooks/useResource";

export interface Review {
  _id: string;
  product: { name: string; image: string; price: number };
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

  const handleDelete = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await adminDeleteReview(reviewId);
        showToast("Review deleted successfully!", "success");
        refresh();
      } catch (error) {
        showToast("Failed to delete review", "error");
      }
    }
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
      <div className="mb-8 items-end justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Customer Reviews</h1>
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
