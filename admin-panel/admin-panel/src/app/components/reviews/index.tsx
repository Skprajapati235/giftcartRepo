"use client";

import React, { useEffect, useState } from "react";
import { getAllReviews, adminReplyReview, adminDeleteReview } from "../../services/reviewService";
import ReviewList from "./reviewList";

export interface Review {
  _id: string;
  product: { name: string; image: string; price: number };
  user: { name: string; email: string };
  rating: number;
  comment: string;
  images: string[];
  reply?: string;
  replyAt?: string;
  createdAt: string;
}

export default function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await getAllReviews();
      setReviews(response);
    } catch (error) {
      console.error("Fetch reviews failed", error);
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
        fetchReviews();
      } catch (error) {
        alert("Failed to delete review");
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
