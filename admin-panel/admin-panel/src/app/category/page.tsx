"use client";

import CategoryView from "../components/category";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CategoryPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-8 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Catalog Management</p>
        </div>
        <CategoryView />
      </main>
    </ProtectedRoute>
  );
}
