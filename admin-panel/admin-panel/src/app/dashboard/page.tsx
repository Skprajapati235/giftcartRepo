"use client";

import DashboardView from "../components/dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
            Dashboard
          </p>
        </div>
        <DashboardView />
      </AdminMain>
    </ProtectedRoute>
  );
}
