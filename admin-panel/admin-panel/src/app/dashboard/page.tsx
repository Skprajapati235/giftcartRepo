"use client";

import DashboardView from "../components/dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className={`flex-1 p-10 bg-background text-foreground`}>
        <div className="mb-8 items-end justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
        </div>
        <DashboardView />
      </main>
    </ProtectedRoute>
  );
}
