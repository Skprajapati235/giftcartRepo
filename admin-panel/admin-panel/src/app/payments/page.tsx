"use client";

import PaymentsView from "../components/payments";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8 text-foreground">
        <div className="mb-2 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Finance Management</p>
        </div>
        <PaymentsView />
      </main>
    </ProtectedRoute>
  );
}
