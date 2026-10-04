"use client";

import AbandonedCartsView from "../components/abandonedCarts/AbandonedCartsView";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function AbandonedCartsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <AbandonedCartsView />
      </AdminMain>
    </ProtectedRoute>
  );
}
