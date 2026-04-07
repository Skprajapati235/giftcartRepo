"use client";

import ReviewDetailView from "../../components/reviews/reviewDetail";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function ReviewDetailPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <ReviewDetailView />
      </main>
    </ProtectedRoute>
  );
}
