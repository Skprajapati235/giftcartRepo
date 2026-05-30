"use client";

import ReplyReviewView from "../../../components/reviews/replyReview";
import ProtectedRoute from "../../../components/ProtectedRoute";
import AdminMain from "../../../components/AdminMain";

export default function ReplyReviewPage() {
  return (
    <ProtectedRoute>
      <AdminMain className="min-h-screen">
        <ReplyReviewView />
      </AdminMain>
    </ProtectedRoute>
  );
}
