"use client";

import React, { useEffect, useState } from "react";
import { getAllReviews, adminReplyReview, adminDeleteReview } from "../../services/reviewService";
import ReviewList from "./reviewList";
import { useToast } from "../../../context/ToastContext";

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
  createdAt: string;
}

export default function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      const response = await getAllReviews();
      setReviews(response);
    } catch (error) {
      showToast("Fetch reviews failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await adminDeleteReview(reviewId);
        showToast("Review deleted successfully!", "success");
        fetchReviews();
      } catch (error) {
        showToast("Failed to delete review", "error");
      }
    }
  };

  return (
    <>
      <div className="mb-8 items-end justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Customer Reviews</h1>
      </div>
      <ReviewList
        reviews={reviews}
        loading={loading}
        onDelete={handleDelete}
      />
    </>
  );
}
