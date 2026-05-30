"use client";

import OrdersView from "../components/orders";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-4 lg:mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Store Operations
          </p>
        </div>
        <OrdersView />
      </AdminMain>
    </ProtectedRoute>
  );
}
