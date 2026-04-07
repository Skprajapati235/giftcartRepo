"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { getAllReviews } from "../services/adminService";
import ReviewList from "../components/reviews/reviewList";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch (err) {
        console.error("Fetch reviews failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-2 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Store Operations</p>
        </div>
        <div className="mb-8 items-end justify-between">
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Reviews</h1>
        </div>
        <ReviewList reviews={reviews} loading={loading} />
      </main>
    </ProtectedRoute>
  );
}
