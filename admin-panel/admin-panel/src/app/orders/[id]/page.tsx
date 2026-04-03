"use client";

import OrderDetailView from "../../components/orderDetail";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen flex-1 p-8 bg-background text-foreground">
        <OrderDetailView />
      </main>
    </ProtectedRoute>
  );
}
