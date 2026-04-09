"use client";

import EditReviewView from "../../../components/reviews/editReview";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function EditReviewPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen flex-1 p-8 bg-background text-foreground">
         <EditReviewView />
      </main>
    </ProtectedRoute>
  );
}
