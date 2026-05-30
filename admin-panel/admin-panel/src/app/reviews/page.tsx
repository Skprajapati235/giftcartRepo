"use client";

import ReviewsView from "../components/reviews";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function ReviewsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <ReviewsView />
      </AdminMain>
    </ProtectedRoute>
  );
}
