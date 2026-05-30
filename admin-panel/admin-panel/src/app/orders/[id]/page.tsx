"use client";

import OrderDetailView from "../../components/orderDetail";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <AdminMain className="min-h-screen">
        <OrderDetailView />
      </AdminMain>
    </ProtectedRoute>
  );
}
