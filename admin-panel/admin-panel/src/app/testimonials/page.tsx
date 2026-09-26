"use client";

import TestimonialsView from "../components/testimonials";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function TestimonialsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <TestimonialsView />
      </AdminMain>
    </ProtectedRoute>
  );
}
