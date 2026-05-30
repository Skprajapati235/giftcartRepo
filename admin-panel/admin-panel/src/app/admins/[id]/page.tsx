"use client";

import AdminDetails from "@/app/components/adminProfile/admin-detail/adminDetails";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import AdminMain from "@/app/components/AdminMain";

export default function AdminDetail() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 flex flex-col gap-3 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
              Admins
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Admin accounts</h1>
            <p className="mt-2 text-sm text-slate-600">
              View, edit, or delete administrator accounts.
            </p>
          </div>
        </div>
        <AdminDetails />
      </AdminMain>
    </ProtectedRoute>
  );
}
