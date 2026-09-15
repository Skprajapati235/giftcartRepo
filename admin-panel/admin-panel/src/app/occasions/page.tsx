"use client";

import OccasionView from "../components/occasions";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function OccasionsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <OccasionView />
      </AdminMain>
    </ProtectedRoute>
  );
}
