"use client";

import OrdersView from "../components/orders";
import ProtectedRoute from "../components/ProtectedRoute";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-2 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Store Operations</p>
        </div>
        <OrdersView />
      </main>
    </ProtectedRoute>
  );
}
