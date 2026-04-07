"use client";

import CityView from "../components/city";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CitiesPage() {
  return (
    <ProtectedRoute>
      <main className={`flex-1 p-10 bg-background text-foreground`}>
        <div className="mb-8 items-end justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shop Location Management</p>
        </div>
        <CityView />
      </main>
    </ProtectedRoute>
  );
}
