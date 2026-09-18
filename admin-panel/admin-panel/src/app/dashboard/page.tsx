"use client";

import DashboardView from "../components/dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-4 lg:mb-6">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-slate-700 dark:text-slate-400 sm:text-sm">
            Overview & Analytics
          </p>
        </div>
        <DashboardView />
      </AdminMain>
    </ProtectedRoute>
  );
}
