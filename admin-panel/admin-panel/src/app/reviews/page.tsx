"use client";

import ReviewsView from "../components/reviews";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ReviewsPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-2 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Feedback Management</p>
        </div>
        <ReviewsView />
      </main>
    </ProtectedRoute>
  );
}
