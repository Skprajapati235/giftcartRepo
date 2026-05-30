"use client";

import EditReviewView from "../../../components/reviews/editReview";
import ProtectedRoute from "../../../components/ProtectedRoute";
import AdminMain from "../../../components/AdminMain";

export default function EditReviewPage() {
  return (
    <ProtectedRoute>
      <AdminMain className="min-h-screen">
        <EditReviewView />
      </AdminMain>
    </ProtectedRoute>
  );
}
