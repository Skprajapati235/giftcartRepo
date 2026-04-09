"use client";

import ReplyReviewView from "../../../components/reviews/replyReview";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function ReplyReviewPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen flex-1 p-8 bg-background">
         <ReplyReviewView />
      </main>
    </ProtectedRoute>
  );
}
