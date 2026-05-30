"use client";

import CityView from "../components/city";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function CitiesPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
            Location Management
          </p>
        </div>
        <CityView />
      </AdminMain>
    </ProtectedRoute>
  );
}
